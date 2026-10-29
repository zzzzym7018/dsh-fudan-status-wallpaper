/**
 * dsh-quota-wallpaper — Host half.
 *
 * Registers one same-origin route:
 *
 *   GET /api/dsh-quota/summary
 *     → the DeepSeek account balance, the current peak/off-peak window and
 *       countdown, and the active official model's unit prices.
 *
 * The balance is read from the official `/user/balance` endpoint with the
 * `DEEPSEEK_API_KEY` resolved through the credential service once per call.
 * Nothing about the key (value, source, or upstream error text) is returned to
 * the browser: the client only ever sees a stable error code, so a malformed
 * Authorization value can never print a secret into the status pill.
 *
 * The route is restricted to this machine with the same fence DSH's own /api
 * uses: loopback or the listener's bind address, no cross-site fetch metadata,
 * and a same-authority Origin when one is present.
 *
 * Peak/off-peak follows the official calendar: Beijing time, Monday–Friday,
 * 09:00–12:00 and 14:00–18:00 are peak; weekends and statutory holidays are
 * off-peak all day. Prices are a versioned snapshot of the official price page
 * (see PRICE_TABLE) because the public API exposes no price endpoint.
 */

import { registerWorkflowRoutes } from './workflow-host.js';

const name = 'dsh-quota-wallpaper';
const inject = ['credentials', 'webServer'];

const ROUTE_PATH = '/api/dsh-quota/summary';
const BALANCE_PATH = '/user/balance';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const BASE_URL_ENV = 'DEEPSEEK_BASE_URL';
const API_KEY_REF = 'DEEPSEEK_API_KEY';
const TIMEOUT_MS = 12_000;
const CACHE_MS = 15_000;
const MAX_BODY_BYTES = 64 * 1024;



const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};

/** Official DeepSeek model routes (API-key route and account route). */
const OFFICIAL_PROVIDERS = new Set(['deepseek-official', 'deepseek-account']);

/**
 * Unit prices in CNY per million tokens, snapshot of the official price page.
 * Each figure is `[peak, off-peak]`; cache writes are not billed.
 * Update this table with a plugin release when DeepSeek changes its pricing.
 */
const PRICE_TABLE = {
  'deepseek-flash': { input: [2, 1], cacheRead: [0.04, 0.02], output: [8, 4] },
  'deepseek-v4-pro': { input: [9, 4.5], cacheRead: [0.3, 0.15], output: [27, 13.5] },
  'deepseek-chat': { input: [2, 2], cacheRead: [0.5, 0.5], output: [8, 8] },
  'deepseek-reasoner': { input: [4, 4], cacheRead: [1, 1], output: [16, 16] },
};

/** Old model names kept as callable aliases by the provider. */
const MODEL_ALIASES = {
  'deepseek-v4-flash': 'deepseek-flash',
  'deepseek-v4-flash-vision-exp': 'deepseek-flash',
};

/** Beijing is a fixed UTC+8 offset (no daylight saving). */
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
/** Peak windows in Beijing hours, half-open [start, end). */
const PEAK_WINDOWS = [[9, 12], [14, 18]];
const BOUNDARY_HOURS = [...new Set(PEAK_WINDOWS.flat())].sort((a, b) => a - b);

/**
 * Statutory holidays (Beijing calendar days, inclusive). Weekends are already
 * off-peak, so only holidays that fall on a weekday change the verdict.
 */
const HOLIDAY_RANGES = [
  ['2026-01-01', '2026-01-03'],
  ['2026-02-15', '2026-02-23'],
  ['2026-04-04', '2026-04-06'],
  ['2026-05-01', '2026-05-05'],
  ['2026-06-19', '2026-06-21'],
  ['2026-09-25', '2026-09-27'],
  ['2026-10-01', '2026-10-07'],
];

function expandHolidayRanges(ranges) {
  const days = new Set();
  const DAY = 24 * 60 * 60 * 1000;
  for (const [from, to] of ranges) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) continue;
    const start = Date.parse(`${from}T00:00:00Z`);
    const end = Date.parse(`${to}T00:00:00Z`);
    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) continue;
    if (new Date(start).toISOString().slice(0, 10) !== from) continue;
    if (new Date(end).toISOString().slice(0, 10) !== to) continue;
    for (let t = start; t <= end; t += DAY) days.add(new Date(t).toISOString().slice(0, 10));
  }
  return days;
}

const HOLIDAY_DAYS = expandHolidayRanges(HOLIDAY_RANGES);

function beijingDateKey(ms) {
  return new Date(ms + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
}

function isPeak(ms) {
  const now = Number.isFinite(ms) ? ms : Date.now();
  if (HOLIDAY_DAYS.has(beijingDateKey(now))) return false;
  const beijing = new Date(now + SHANGHAI_OFFSET_MS);
  const weekday = beijing.getUTCDay();
  if (weekday === 0 || weekday === 6) return false;
  const hour = beijing.getUTCHours();
  return PEAK_WINDOWS.some(([start, end]) => hour >= start && hour < end);
}

/**
 * The next moment `isPeak` flips. Candidates are the window boundaries on each
 * coming Beijing day, so this is exact rather than a per-minute probe.
 */
function nextChange(ms) {
  const now = Number.isFinite(ms) ? ms : Date.now();
  const current = isPeak(now);
  const DAY = 24 * 60 * 60 * 1000;
  const HOUR = 60 * 60 * 1000;
  const dayStart = Date.parse(`${beijingDateKey(now)}T00:00:00Z`) - SHANGHAI_OFFSET_MS;
  for (let day = 0; day < 32; day += 1) {
    const base = dayStart + day * DAY;
    for (const hour of BOUNDARY_HOURS) {
      const at = base + hour * HOUR;
      if (at <= now) continue;
      if (isPeak(at) !== current) return { peak: !current, at, ms: at - now };
    }
  }
  return { peak: !current, at: null, ms: 0 };
}

/** Resolve the model id from a `ModelSelection` without assuming its shape. */
function modelOf(selection) {
  if (selection === null || typeof selection !== 'object') return { model: '', provider: '' };
  const model = typeof selection.model === 'string' ? selection.model.trim() : '';
  const provider = typeof selection.provider === 'string' ? selection.provider.trim() : '';
  return { model, provider };
}

/**
 * Current unit price for the active model, or null when the price table cannot
 * describe it. Third-party routes that merely host a `deepseek-*` model are
 * excluded on purpose: the official table has nothing to do with their bill.
 */
function unitPrice(model, provider, now) {
  if (!model || !OFFICIAL_PROVIDERS.has(provider.toLowerCase())) return null;
  const key = model.toLowerCase();
  const canonical = Object.prototype.hasOwnProperty.call(PRICE_TABLE, key)
    ? key
    : MODEL_ALIASES[key];
  const entry = canonical === undefined ? undefined : PRICE_TABLE[canonical];
  if (entry === undefined) return null;
  const tier = isPeak(now) ? 0 : 1;
  return {
    model: canonical,
    requested: model,
    currency: 'CNY',
    unit: 'per-million-tokens',
    tier: tier === 0 ? 'peak' : 'off-peak',
    input: entry.input[tier],
    cacheRead: entry.cacheRead[tier],
    output: entry.output[tier],
  };
}

function sendJson(res, status, body) {
  if (res.headersSent) {
    res.end();
    return;
  }
  res.writeHead(status, JSON_HEADERS);
  res.end(JSON.stringify(body));
}

function hostNameOf(authority) {
  let host = String(authority).trim().toLowerCase();
  if (host.startsWith('[')) {
    const end = host.indexOf(']');
    if (end === -1) return null;
    host = host.slice(1, end);
    return host === '' ? null : host;
  }
  const index = host.lastIndexOf(':');
  if (index !== -1 && host.indexOf(':') === index) host = host.slice(0, index);
  return host === '' ? null : host;
}

function isLocalHost(req, bindHost) {
  const raw = req.headers.host;
  if (typeof raw !== 'string' || raw === '') return false;
  const host = hostNameOf(raw);
  if (host === null) return false;
  if (host === 'localhost' || host === '::1' || host === '::ffff:127.0.0.1') return true;
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) return true;
  if (typeof bindHost === 'string' && bindHost !== '') {
    const bind = hostNameOf(bindHost);
    if (bind !== null && bind !== '' && host === bind) return true;
  }
  return false;
}

function isTrustedRequest(req, bindHost) {
  if (!isLocalHost(req, bindHost)) return false;
  if (req.headers['sec-fetch-site'] === 'cross-site') return false;
  const origin = req.headers.origin;
  if (typeof origin === 'string' && origin !== '') {
    let originHost;
    try {
      originHost = new URL(origin).host.toLowerCase();
    } catch {
      return false;
    }
    if (originHost !== String(req.headers.host ?? '').toLowerCase()) return false;
  }
  return true;
}

function toFinite(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : Number.NaN;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }
  return Number.NaN;
}

class BodyTooLargeError extends Error {}

async function readBoundedText(response) {
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new BodyTooLargeError();
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_BODY_BYTES) throw new BodyTooLargeError();
  return text;
}

/** Resolve and validate the API key. The value never leaves this function. */
async function resolveApiKey(ctx) {
  let resolved;
  try {
    resolved = await ctx.credentials.resolve(API_KEY_REF);
  } catch {
    return { ok: false, code: 'internal' };
  }
  if (resolved === undefined) return { ok: false, code: 'noKey' };
  const key = typeof resolved.value === 'string' ? resolved.value.trim() : '';
  if (key === '') return { ok: false, code: 'noKey' };
  // HTTP header values are printable ASCII; an illegal value would otherwise
  // make the HTTP client echo the Authorization header into its error text.
  if (!/^[\x21-\x7e]+$/.test(key)) return { ok: false, code: 'badKey' };
  return { ok: true, key };
}

async function readBalance(ctx) {
  const credential = await resolveApiKey(ctx);
  if (!credential.ok) return credential;

  const baseUrl = String(process.env[BASE_URL_ENV] ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
  let response;
  try {
    response = await fetch(`${baseUrl}${BALANCE_PATH}`, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${credential.key}`,
        accept: 'application/json',
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return { ok: false, code: timedOut ? 'timeout' : 'network' };
  }

  if (response.status === 401) return { ok: false, code: 'badKey' };
  if (!response.ok) return { ok: false, code: 'http', status: response.status };

  let text;
  try {
    text = await readBoundedText(response);
  } catch {
    return { ok: false, code: 'payload' };
  }

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    return { ok: false, code: 'payload' };
  }

  const infos = Array.isArray(payload?.balance_infos) ? payload.balance_infos : [];
  if (infos.length === 0) return { ok: false, code: 'empty' };
  const info = infos.find((item) => item?.currency === 'CNY') ?? infos[0];
  const total = toFinite(info?.total_balance);
  if (!Number.isFinite(total)) return { ok: false, code: 'payload' };
  const granted = toFinite(info?.granted_balance);
  const toppedUp = toFinite(info?.topped_up_balance);
  return {
    ok: true,
    available: payload?.is_available !== false,
    currency: typeof info?.currency === 'string' ? info.currency : 'CNY',
    total,
    granted: Number.isFinite(granted) ? granted : null,
    toppedUp: Number.isFinite(toppedUp) ? toppedUp : null,
  };
}

/** Compose the full snapshot: balance + peak state + active model price. */
async function composeSnapshot(ctx) {
  const now = Date.now();
  let model = '';
  let provider = '';
  try {
    const selectionService = ctx.get('agentDefaultModel');
    if (selectionService !== undefined) {
      const selection = modelOf(selectionService.currentSelection());
      model = selection.model;
      provider = selection.provider;
    }
  } catch {
    // Model metadata is decoration; balance remains the useful part.
  }

  const balance = await readBalance(ctx);
  const change = nextChange(now);
  const snapshot = {
    ok: balance.ok === true,
    fetchedAt: now,
    peak: isPeak(now),
    next: change,
    model,
    provider: provider === '' ? null : provider,
    price: unitPrice(model, provider, now),
  };

  if (balance.ok) {
    snapshot.available = balance.available;
    snapshot.currency = balance.currency;
    snapshot.total = balance.total;
    snapshot.granted = balance.granted;
    snapshot.toppedUp = balance.toppedUp;
  } else {
    snapshot.code = balance.code;
    if (balance.status !== undefined) snapshot.status = balance.status;
  }
  return snapshot;
}

/** Success-only cache; failures must be retryable by the next request. */
let cachedSnapshot;
let inFlightSnapshot;

async function getSnapshot(ctx) {
  const now = Date.now();
  if (cachedSnapshot !== undefined && now - cachedSnapshot.at < CACHE_MS) {
    return cachedSnapshot.value;
  }
  if (inFlightSnapshot !== undefined) return inFlightSnapshot;
  inFlightSnapshot = composeSnapshot(ctx)
    .then((value) => {
      if (value.ok) cachedSnapshot = { at: Date.now(), value };
      return value;
    })
    .finally(() => {
      inFlightSnapshot = undefined;
    });
  return inFlightSnapshot;
}

function apply(ctx) {
  const bindHost = typeof ctx.webServer?.host === 'string' ? ctx.webServer.host : '';

  ctx.effect(
    () => ctx.webServer.register({
      kind: 'exact',
      path: ROUTE_PATH,
      handler: async (req, res) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          return sendJson(res, 405, { ok: false, code: 'method' });
        }
        if (!isTrustedRequest(req, bindHost)) {
          return sendJson(res, 403, { ok: false, code: 'forbidden' });
        }
        try {
          const snapshot = await getSnapshot(ctx);
          return sendJson(res, 200, snapshot);
        } catch {
          return sendJson(res, 500, { ok: false, code: 'internal' });
        }
      },
    }),
    'dsh-quota-wallpaper: quota summary route',
  );

  registerWorkflowRoutes(ctx, bindHost);
}

export { name, inject, apply };
