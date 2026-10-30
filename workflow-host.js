/**
 * workflow-host.js — local 知行台 workspace.
 *
 * A deliberately small, single-user local backend for the Personal Workflow
 * UI. Data lives in the DSH profile (not in this package) as one JSON file;
 * every route is fenced to this machine exactly like the quota route. The
 * Cloudflare D1 / Sites login / Google OAuth parts of the original project
 * are intentionally not part of the local edition.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PREFIX = '/api/dsh-workflow';
const APP_PREFIX = `${PREFIX}/app`;
const APP_ROOT = path.resolve(fileURLToPath(new URL('./workflow-dist', import.meta.url)));
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store',
};
const ENTITY_MAP = {
  project: 'projects', task: 'tasks', domain: 'domains',
  learningLog: 'learningLogs', knowledgeNote: 'knowledgeNotes',
  idea: 'ideas', event: 'events',
  semester: 'semesters', course: 'courses', courseSlot: 'courseSlots',
};
const ENTITIES = new Set(Object.values(ENTITY_MAP));
/** Current store layout. Older files are upgraded in place by migrateStore(). */
const STORE_VERSION = 2;
/** Highest period index a timetable slot may use. */
const MAX_PERIOD = 13;
/**
 * Default weekly grid (Beijing time).
 *
 * Periods 1–7 match the 2026 autumn timetable exported by 旦挞 (08:00 start,
 * 11:45–12:30 for the fifth period, lunch, 13:30 resume). Periods 8–13 are a
 * common layout; an imported .ics rewrites whichever periods it contains, and
 * the whole grid lives in `settings.periodTimes`.
 */
const DEFAULT_PERIOD_TIMES = [
  ['08:00', '08:45'], ['08:55', '09:40'],
  ['09:55', '10:40'], ['10:50', '11:35'],
  ['11:45', '12:30'], ['13:30', '14:15'],
  ['14:25', '15:10'], ['15:20', '16:05'],
  ['16:15', '17:00'], ['17:10', '17:55'],
  ['18:30', '19:15'], ['19:25', '20:10'], ['20:20', '21:05'],
].map(([start, end], index) => ({ index: index + 1, start, end }));
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
};

const profileDir = process.env.DSH_PROFILE_DIR
  || path.join(os.homedir(), '.dsh', 'profiles', process.env.DSH_PROFILE || 'default');
const DATA_DIR = path.join(profileDir, 'data', 'dsh-fudan-workflow');
const DATA_FILE = path.join(DATA_DIR, 'workspace.json');

function nowIso() { return new Date().toISOString(); }
function todayKey() { return new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10); }
function addDays(date, amount) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
function withLocalTime(date, time) {
  return new Date(`${date}T${time}:00+08:00`).toISOString();
}
function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function nullableText(value) { return value === undefined || value === null || value === '' ? null : String(value); }
function clamp(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}
function defaultReminders() {
  return { enabled: true, dailyDigest: true, digestTime: '08:00', leadHours: [24, 2] };
}
function defaultSettings() {
  return { periodTimes: DEFAULT_PERIOD_TIMES.map((item) => ({ ...item })), reminders: defaultReminders() };
}
function emptyProfile() {
  return { nickname: 'FDUer', school: '复旦大学', claims: [] };
}
function emptyStore() {
  return {
    version: STORE_VERSION,
    profile: emptyProfile(),
    settings: defaultSettings(),
    semesters: [], courses: [], courseSlots: [],
    projects: [], tasks: [], domains: [], learningLogs: [],
    knowledgeNotes: [], ideas: [], events: [],
  };
}

/** Monday of the ISO week that contains `date` (YYYY-MM-DD, Beijing time). */
function mondayOf(date) {
  const value = new Date(`${date}T00:00:00Z`);
  const weekday = value.getUTCDay() || 7;
  value.setUTCDate(value.getUTCDate() - weekday + 1);
  return value.toISOString().slice(0, 10);
}
function normalizeWeeks(value, weekCount) {
  const total = clamp(weekCount, 1, 30, 16);
  const all = Array.from({ length: total }, (_, index) => index + 1);
  if (Array.isArray(value)) {
    const weeks = [...new Set(value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item >= 1 && item <= total))];
    return weeks.length ? weeks.sort((a, b) => a - b) : all;
  }
  const raw = text(value);
  if (!raw) return all;
  const picked = new Set();
  const parity = raw.includes('单') ? 1 : raw.includes('双') ? 0 : null;
  for (const chunk of raw.split(/[,，;；\s]+/)) {
    const clean = chunk.replace(/[单双]/g, '');
    if (!clean) continue;
    const range = clean.match(/^(\d{1,2})\s*[-–~]\s*(\d{1,2})$/);
    if (range) {
      const from = Number(range[1]);
      const to = Number(range[2]);
      for (let week = Math.min(from, to); week <= Math.max(from, to); week += 1) {
        if (week >= 1 && week <= total) picked.add(week);
      }
      continue;
    }
    const single = clean.match(/^(\d{1,2})$/);
    if (single) {
      const week = Number(single[1]);
      if (week >= 1 && week <= total) picked.add(week);
    }
  }
  const weeks = [...picked].sort((a, b) => a - b);
  const filtered = parity === null ? weeks : weeks.filter((week) => week % 2 === parity);
  return filtered.length ? filtered : all;
}
function activeSemesterId(store) {
  const semesters = store.semesters.filter((item) => !item.archivedAt);
  if (!semesters.length) return null;
  const marked = semesters.find((item) => item.isActive);
  if (marked) return marked.id;
  return [...semesters].sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)))[0].id;
}
/** Fill in fields a pre-v2 workspace file does not have yet. */
function migrateStore(store) {
  let changed = false;
  if (!store.profile || typeof store.profile !== 'object') { store.profile = emptyProfile(); changed = true; }
  else if (typeof store.profile.nickname !== 'string' || !store.profile.nickname.trim()) { store.profile.nickname = 'FDUer'; changed = true; }
  if (!Array.isArray(store.profile.claims)) { store.profile.claims = []; changed = true; }
  if (!store.settings || typeof store.settings !== 'object') { store.settings = defaultSettings(); changed = true; }
  else {
    if (!Array.isArray(store.settings.periodTimes) || !store.settings.periodTimes.length) { store.settings.periodTimes = defaultSettings().periodTimes; changed = true; }
    if (!store.settings.reminders || typeof store.settings.reminders !== 'object') { store.settings.reminders = defaultReminders(); changed = true; }
  }
  for (const key of ['semesters', 'courses', 'courseSlots']) {
    if (!Array.isArray(store[key])) { store[key] = []; changed = true; }
  }
  if (Number(store.version) !== STORE_VERSION) { store.version = STORE_VERSION; changed = true; }
  return changed;
}

function demoCourses() {
  const courses = [
    ['高等数学 A', '王启明', '#0d2f5a', [['一', 1, 2, '光华楼西辅楼 305'], ['三', 3, 4, '光华楼西辅楼 305']]],
    ['大学英语 III', '周敏', '#9d7d46', [['一', 5, 6, '文科楼 506']]],
    ['数据结构', '李哲', '#167f78', [['二', 3, 4, '第二教学楼 2101'], ['四', 3, 4, '第二教学楼 2101']]],
    ['体育（羽毛球）', '赵伟', '#2d6b5f', [['二', 7, 8, '正大体育馆']]],
    ['概率论与数理统计', '刘一诺', '#5267c7', [['五', 1, 2, '光华楼东辅楼 202']]],
    ['计算机系统导论', '孙可', '#3449a4', [['四', 5, 6, '第三教学楼 3308']]],
    ['大学物理实验', '陈立', '#b64949', [['三', 7, 8, '物理楼 实验中心 B203']]],
    ['专业前沿讲座', '院系安排', '#a07d3e', [['五', 5, 6, '江湾校区 报告厅']]],
  ];
  const weekdayOf = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 日: 7 };
  const now = nowIso();
  const semesterId = 'semester-demo';
  const rows = { semesters: [], courses: [], courseSlots: [] };
  rows.semesters.push({
    id: semesterId, name: '2026—2027 学年 秋季学期',
    startDate: addDays(mondayOf(todayKey()), -9 * 7), weekCount: 16,
    isActive: true, note: '示例学期：当前为第 10 周。',
    archivedAt: null, createdAt: now, updatedAt: now,
  });
  courses.forEach(([name, teacher, color, slots], courseIndex) => {
    const courseId = `course-demo-${courseIndex + 1}`;
    rows.courses.push({
      id: courseId, semesterId, name, teacher, code: '', credits: 0, color, note: '',
      archivedAt: null, createdAt: now, updatedAt: now,
    });
    slots.forEach(([weekday, startPeriod, endPeriod, location], slotIndex) => {
      rows.courseSlots.push({
        id: `slot-demo-${courseIndex + 1}-${slotIndex + 1}`,
        courseId, weekday: weekdayOf[weekday] ?? 1, startPeriod, endPeriod,
        weeks: Array.from({ length: name === '大学物理实验' ? 14 : 16 }, (_, index) => index + (name === '大学物理实验' ? 3 : 1)),
        location, note: '', archivedAt: null, createdAt: now, updatedAt: now,
      });
    });
  });
  return rows;
}

function seedStore() {
  const now = nowIso();
  const today = todayKey();
  return {
    version: STORE_VERSION,
    profile: emptyProfile(),
    settings: defaultSettings(),
    ...demoCourses(),
    projects: [
      {
        id: 'project-personal-web', title: '个人助手网站',
        description: '把日程、项目和领域学习连接到一个安静的个人工作台。',
        status: 'active', progress: 68, color: '#3449A4',
        deadline: addDays(today, 21), nextAction: '完成交互原型并连接持久化数据',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
      {
        id: 'project-rl', title: '强化学习实验',
        description: '复现实验基线并明确离线策略评估指标。',
        status: 'active', progress: 42, color: '#D48B2C',
        deadline: addDays(today, 35), nextAction: '明确离线策略评估指标',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
    tasks: [
      {
        id: 'task-experiment-draft', projectId: 'project-rl', domainId: null,
        title: '完成实验方案初稿', notes: '补齐数据、指标和对照组。',
        status: 'doing', priority: 'high', plannedDate: today,
        dueDate: today, startAt: withLocalTime(today, '10:00'), endAt: withLocalTime(today, '11:30'),
        archivedAt: null, createdAt: now, updatedAt: now,
      },
      {
        id: 'task-info-architecture', projectId: 'project-personal-web', domainId: null,
        title: '确定网站信息架构', notes: '', status: 'done', priority: 'normal',
        plannedDate: today, dueDate: today, startAt: null, endAt: null,
        archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
    domains: [
      {
        id: 'domain-causal', title: '因果推断', stage: 2,
        summary: '正在建立识别假设与反事实框架之间的整体地图。',
        nextStep: '整理混杂、选择偏差和可识别性的边界', color: '#167F78',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
      {
        id: 'domain-rl', title: '强化学习', stage: 3,
        summary: '能够解释主要范式，正在深入离线数据分布偏移问题。',
        nextStep: '连接 OPE 方法与当前实验设计', color: '#D48B2C',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
    learningLogs: [
      {
        id: 'log-causal-ch2', domainId: 'domain-causal',
        title: '读完《Causal Inference: The Mixtape》第 2 章',
        note: '把识别假设和反事实框架串起来。', minutes: 45,
        occurredAt: withLocalTime(today, '08:30'), createdAt: now, updatedAt: now,
      },
    ],
    knowledgeNotes: [
      {
        id: 'note-causal-identification', domainId: 'domain-causal', kind: 'core',
        stage: 2, title: '识别假设是因果结论的边界',
        content: '没有识别假设，就只有一个相关关系；先写清楚假设，再谈估计量。',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
      {
        id: 'note-cross-ope', domainId: null, kind: 'note', stage: null,
        title: '从 OPE 到因果识别',
        content: '离线策略评估和因果推断共享同一个覆盖问题；把覆盖不足写进实验记录。',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
    ideas: [
      {
        id: 'idea-offline-bias', title: '离线数据偏差如何影响策略评估？',
        note: '比较重要性采样、模型方法和双稳健估计在覆盖不足时的误差。',
        type: 'question', status: 'exploring',
        projectId: 'project-rl', domainId: 'domain-rl',
        archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
    events: [
      {
        id: 'event-focus', title: '完成实验方案初稿',
        startAt: withLocalTime(today, '10:00'), endAt: withLocalTime(today, '11:30'),
        allDay: false, notes: '', color: '#3449A4', source: 'local',
        externalId: null, externalCalendarId: null, syncStatus: 'local',
        projectId: 'project-rl', archivedAt: null, createdAt: now, updatedAt: now,
      },
      {
        id: 'event-meeting', title: '组会',
        startAt: withLocalTime(today, '12:20'), endAt: withLocalTime(today, '13:10'),
        allDay: false, notes: '', color: '#159AA9', source: 'local',
        externalId: null, externalCalendarId: null, syncStatus: 'local',
        projectId: null, archivedAt: null, createdAt: now, updatedAt: now,
      },
    ],
  };
}

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}
function readStore() {
  ensureDir();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('bad workspace');
    const migrated = migrateStore(parsed);
    for (const key of ENTITIES) {
      if (!Array.isArray(parsed[key])) throw new Error(`bad workspace.${key}`);
    }
    if (migrated) saveStore(parsed);
    return parsed;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      const seeded = seedStore();
      saveStore(seeded);
      return seeded;
    }
    throw error;
  }
}
function saveStore(store) {
  ensureDir();
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, DATA_FILE);
  try { fs.chmodSync(DATA_FILE, 0o600); } catch { /* best effort */ }
}

function snapshot(store) {
  const active = (row) => !row.archivedAt;
  const byCreated = (a, b) => String(a.createdAt).localeCompare(String(b.createdAt));
  const courses = store.courses.filter(active).sort(byCreated);
  const courseIds = new Set(courses.map((course) => course.id));
  return {
    profile: {
      nickname: text(store.profile?.nickname) || 'FDUer',
      school: text(store.profile?.school) || '复旦大学',
      claims: Array.isArray(store.profile?.claims) ? store.profile.claims : [],
    },
    settings: {
      periodTimes: store.settings.periodTimes,
      reminders: store.settings.reminders,
    },
    semesters: store.semesters.filter(active).sort((a, b) => String(a.startDate).localeCompare(String(b.startDate))),
    activeSemesterId: activeSemesterId(store),
    courses,
    courseSlots: store.courseSlots
      .filter((slot) => active(slot) && courseIds.has(slot.courseId))
      .sort((a, b) => (a.weekday - b.weekday) || (a.startPeriod - b.startPeriod)),
    projects: store.projects.filter(active).sort(byCreated),
    tasks: store.tasks.filter(active).sort(byCreated),
    domains: store.domains.filter(active).sort(byCreated),
    learningLogs: store.learningLogs
      .filter(active)
      .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)))
      .slice(0, 50),
    knowledgeNotes: store.knowledgeNotes
      .filter(active)
      .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))),
    ideas: store.ideas
      .filter(active)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))),
    events: store.events
      .filter(active)
      .sort((a, b) => String(a.startAt).localeCompare(String(b.startAt))),
    viewer: {
      displayName: text(store.profile?.nickname) || 'FDUer',
      email: 'local@localhost',
      isPreview: true,
    },
  };
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
class BodyTooLarge extends Error {}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new BodyTooLarge());
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (raw.trim() === '') return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new HttpError(400, '请求内容不是有效的 JSON。')); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, body) {
  if (res.headersSent) { res.end(); return; }
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
    try { originHost = new URL(origin).host.toLowerCase(); } catch { return false; }
    if (originHost !== String(req.headers.host ?? '').toLowerCase()) return false;
  }
  return true;
}

function serveApp(req, res, pathname) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    sendJson(res, 405, { error: '只支持 GET。' });
    return;
  }
  let rel = pathname.slice(APP_PREFIX.length) || '/';
  try { rel = decodeURIComponent(rel); } catch { sendJson(res, 400, { error: '无效路径。' }); return; }
  if (rel === '' || rel === '/') rel = '/index.html';
  const resolved = path.resolve(APP_ROOT, `.${rel}`);
  if (resolved !== APP_ROOT && !resolved.startsWith(`${APP_ROOT}${path.sep}`)) {
    sendJson(res, 403, { error: '无效路径。' });
    return;
  }
  fs.readFile(resolved, (error, data) => {
    if (error) {
      if (error.code === 'ENOENT') sendJson(res, 404, { error: '找不到页面资源。' });
      else sendJson(res, 500, { error: '无法读取页面资源。' });
      return;
    }
    const ext = path.extname(resolved).toLowerCase();
    const headers = {
      'content-type': MIME[ext] || 'application/octet-stream',
      'cache-control': ext === '.html' ? 'no-store' : 'public, max-age=300',
      'x-content-type-options': 'nosniff',
    };
    if (req.method === 'HEAD') { res.writeHead(200, headers); res.end(); return; }
    res.writeHead(200, headers);
    res.end(data);
  });
}

function requireEntity(entity) {
  const key = typeof entity === 'string' ? ENTITY_MAP[entity] : undefined;
  if (!key || !ENTITIES.has(key)) throw new HttpError(400, '未知的数据类型。');
  return key;
}
function requiredTitle(value, message = '请填写标题。') {
  const title = text(value);
  if (!title) throw new HttpError(400, message);
  return title.slice(0, 240);
}
function isoOrNull(value, message) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new HttpError(400, message);
  return date.toISOString();
}
function isoRequired(value, message) {
  const normalized = isoOrNull(value, message);
  if (!normalized) throw new HttpError(400, message);
  return normalized;
}
/** A plain YYYY-MM-DD calendar day (no time, no timezone shift). */
function dateFormat(value, message) {
  const raw = text(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new HttpError(400, message);
  const date = new Date(`${raw}T00:00:00+08:00`);
  if (!Number.isFinite(date.getTime())) throw new HttpError(400, message);
  return raw;
}
function semesterWeekCount(store, semesterId) {
  const semester = store.semesters.find((item) => item.id === semesterId);
  return semester ? clamp(semester.weekCount, 1, 30, 16) : 16;
}
/**
 * A timetable entry carries the course name inline, so adding a slot for an
 * existing course reuses its row (and colour) instead of duplicating it.
 */
function resolveCourse(store, semesterId, data) {
  const courseId = nullableText(data.courseId);
  if (courseId) {
    const existing = store.courses.find((item) => item.id === courseId && !item.archivedAt);
    if (!existing) throw new HttpError(404, '这门课程已经不存在。');
    if (data.teacher !== undefined) existing.teacher = text(data.teacher);
    return existing;
  }
  const name = requiredTitle(data.courseName ?? data.name, '请填写课程名称。');
  let course = store.courses.find(
    (item) => item.semesterId === semesterId && !item.archivedAt && item.name === name,
  );
  if (!course) {
    const now = nowIso();
    course = {
      id: crypto.randomUUID(), semesterId, name,
      teacher: text(data.teacher), code: '', credits: 0,
      color: text(data.color) || '#0d2f5a', note: '',
      archivedAt: null, createdAt: now, updatedAt: now,
    };
    store.courses.push(course);
  } else if (data.color) {
    course.color = text(data.color) || course.color;
  }
  return course;
}
/** A course with no remaining slots is invisible in the timetable; drop it. */
function pruneCourse(store, courseId) {
  if (!courseId) return;
  if (store.courseSlots.some((slot) => slot.courseId === courseId && !slot.archivedAt)) return;
  store.courses = store.courses.filter((course) => course.id !== courseId);
}

function createEntity(entity, data, store) {
  const now = nowIso();
  const id = crypto.randomUUID();
  const base = { id, archivedAt: null, createdAt: now, updatedAt: now };
  switch (entity) {
    case 'semesters': {
      const row = {
        ...base,
        name: requiredTitle(data.name ?? data.title, '请填写学期名称。'),
        startDate: mondayOf(dateFormat(data.startDate, '学期开始日期无效。')),
        weekCount: clamp(data.weekCount, 1, 30, 16),
        isActive: data.isActive === undefined ? store.semesters.length === 0 : Boolean(data.isActive),
        note: text(data.note),
      };
      if (row.isActive) for (const item of store.semesters) item.isActive = false;
      store.semesters.push(row); return row;
    }
    case 'courses': {
      const semesterId = nullableText(data.semesterId) || activeSemesterId(store);
      if (!semesterId) throw new HttpError(400, '请先创建一个学期。');
      const row = {
        ...base, semesterId,
        name: requiredTitle(data.name ?? data.title, '请填写课程名称。'),
        teacher: text(data.teacher), code: text(data.code),
        credits: clamp(data.credits, 0, 20, 0), color: text(data.color) || '#0d2f5a',
        note: text(data.note),
      };
      store.courses.push(row); return row;
    }
    case 'courseSlots': {
      const semesterId = nullableText(data.semesterId) || activeSemesterId(store);
      if (!semesterId) throw new HttpError(400, '请先创建一个学期。');
      const course = resolveCourse(store, semesterId, data);
      const startPeriod = clamp(data.startPeriod, 1, MAX_PERIOD, 1);
      const row = {
        ...base, courseId: course.id,
        weekday: clamp(data.weekday, 1, 7, 1),
        startPeriod,
        endPeriod: Math.max(startPeriod, clamp(data.endPeriod, 1, MAX_PERIOD, startPeriod)),
        weeks: normalizeWeeks(data.weeks, semesterWeekCount(store, semesterId)),
        location: text(data.location), note: text(data.note),
      };
      if (data.location !== undefined) { course.updatedAt = now; }
      store.courseSlots.push(row);
      return { ...row, course };
    }
    case 'projects': {
      const row = {
        ...base,
        title: requiredTitle(data.title, '请填写项目名称。'),
        description: text(data.description), status: text(data.status) || 'active',
        progress: clamp(data.progress, 0, 100, 0), color: text(data.color) || '#3449A4',
        deadline: nullableText(data.deadline), nextAction: text(data.nextAction),
      };
      store.projects.push(row); return row;
    }
    case 'tasks': {
      const row = {
        ...base,
        projectId: nullableText(data.projectId), domainId: nullableText(data.domainId),
        title: requiredTitle(data.title, '请填写任务名称。'),
        notes: text(data.notes ?? data.note), status: text(data.status) || 'todo',
        priority: text(data.priority) || 'normal', plannedDate: nullableText(data.plannedDate),
        dueDate: nullableText(data.dueDate), startAt: isoOrNull(data.startAt, '开始时间无效。'),
        endAt: isoOrNull(data.endAt, '结束时间无效。'),
      };
      if (row.startAt && row.endAt && new Date(row.endAt) <= new Date(row.startAt)) throw new HttpError(400, '结束时间必须晚于开始时间。');
      store.tasks.push(row); return row;
    }
    case 'domains': {
      const row = {
        ...base,
        title: requiredTitle(data.title, '请填写领域名称。'), stage: clamp(data.stage, 1, 5, 1),
        summary: text(data.summary), nextStep: text(data.nextStep), color: text(data.color) || '#167F78',
      };
      store.domains.push(row); return row;
    }
    case 'learningLogs': {
      const row = {
        ...base,
        domainId: nullableText(data.domainId), title: requiredTitle(data.title, '请填写学习记录。'),
        note: text(data.note), minutes: clamp(data.minutes, 0, 1440, 0),
        occurredAt: isoRequired(data.occurredAt ?? now, '学习时间无效。'),
      };
      if (!row.domainId) throw new HttpError(400, '请选择学习领域。');
      store.learningLogs.push(row); return row;
    }
    case 'knowledgeNotes': {
      const kind = text(data.kind) || 'note';
      const row = {
        ...base,
        domainId: nullableText(data.domainId), kind,
        stage: kind === 'stage' ? clamp(data.stage, 1, 5, 1) : null,
        title: requiredTitle(data.title, '请填写认知条目标题。'), content: text(data.note ?? data.content),
      };
      if (kind !== 'note' && !row.domainId) throw new HttpError(400, '请选择这条认知所属的领域。');
      store.knowledgeNotes.push(row); return row;
    }
    case 'ideas': {
      const row = {
        ...base,
        title: requiredTitle(data.title, '请填写内容。'), note: text(data.note),
        type: text(data.type) === 'question' ? 'question' : 'idea',
        status: text(data.status) || 'inbox', projectId: nullableText(data.projectId),
        domainId: nullableText(data.domainId),
      };
      store.ideas.push(row); return row;
    }
    case 'events': {
      const startAt = isoRequired(data.startAt, '请填写有效的开始时间。');
      const endAt = isoRequired(data.endAt, '请填写有效的结束时间。');
      if (new Date(endAt) <= new Date(startAt)) throw new HttpError(400, '结束时间必须晚于开始时间。');
      const row = {
        ...base,
        title: requiredTitle(data.title, '请填写日程标题。'), startAt, endAt,
        allDay: Boolean(data.allDay), notes: text(data.notes ?? data.note),
        color: text(data.color) || '#159AA9', source: 'local',
        externalId: null, externalCalendarId: null, syncStatus: 'local',
        projectId: nullableText(data.projectId),
      };
      store.events.push(row); return row;
    }
  }
}

function updateEntity(entity, id, data, store) {
  const rows = store[entity];
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) throw new HttpError(404, '这条记录已经不存在。');
  const row = { ...rows[index] };
  const now = nowIso();
  const has = (key) => Object.prototype.hasOwnProperty.call(data, key);
  switch (entity) {
    case 'semesters':
      if (has('name') || has('title')) row.name = requiredTitle(data.name ?? data.title, '请填写学期名称。');
      if (has('startDate')) row.startDate = mondayOf(dateFormat(data.startDate, '学期开始日期无效。'));
      if (has('weekCount')) row.weekCount = clamp(data.weekCount, 1, 30, row.weekCount);
      if (has('note')) row.note = text(data.note);
      if (has('isActive')) {
        row.isActive = Boolean(data.isActive);
        if (row.isActive) for (const item of store.semesters) if (item.id !== id) item.isActive = false;
      }
      break;
    case 'courses':
      if (has('name') || has('title')) row.name = requiredTitle(data.name ?? data.title, '请填写课程名称。');
      if (has('teacher')) row.teacher = text(data.teacher);
      if (has('code')) row.code = text(data.code);
      if (has('credits')) row.credits = clamp(data.credits, 0, 20, row.credits);
      if (has('color')) row.color = text(data.color) || row.color;
      if (has('note')) row.note = text(data.note);
      break;
    case 'courseSlots': {
      const semesterId = store.courses.find((item) => item.id === row.courseId)?.semesterId
        ?? activeSemesterId(store);
      if (has('courseId') || has('courseName') || has('name')) {
        row.courseId = resolveCourse(store, semesterId, data).id;
      }
      if (has('weekday')) row.weekday = clamp(data.weekday, 1, 7, row.weekday);
      if (has('startPeriod')) row.startPeriod = clamp(data.startPeriod, 1, MAX_PERIOD, row.startPeriod);
      if (has('endPeriod')) row.endPeriod = Math.max(row.startPeriod, clamp(data.endPeriod, 1, MAX_PERIOD, row.endPeriod));
      if (has('weeks')) row.weeks = normalizeWeeks(data.weeks, semesterWeekCount(store, semesterId));
      if (has('location')) row.location = text(data.location);
      if (has('note')) row.note = text(data.note);
      break;
    }
    case 'projects':
      if (has('title')) row.title = requiredTitle(data.title, '请填写项目名称。');
      if (has('description')) row.description = text(data.description);
      if (has('status')) row.status = text(data.status) || row.status;
      if (has('progress')) row.progress = clamp(data.progress, 0, 100, row.progress);
      if (has('color')) row.color = text(data.color) || row.color;
      if (has('deadline')) row.deadline = nullableText(data.deadline);
      if (has('nextAction')) row.nextAction = text(data.nextAction);
      break;
    case 'tasks':
      if (has('title')) row.title = requiredTitle(data.title, '请填写任务名称。');
      if (has('status')) row.status = text(data.status) || row.status;
      if (has('priority')) row.priority = text(data.priority) || row.priority;
      if (has('notes') || has('note')) row.notes = text(data.notes ?? data.note);
      if (has('projectId')) row.projectId = nullableText(data.projectId);
      if (has('domainId')) row.domainId = nullableText(data.domainId);
      if (has('plannedDate')) row.plannedDate = nullableText(data.plannedDate);
      if (has('dueDate')) row.dueDate = nullableText(data.dueDate);
      if (has('startAt')) row.startAt = isoOrNull(data.startAt, '开始时间无效。');
      if (has('endAt')) row.endAt = isoOrNull(data.endAt, '结束时间无效。');
      if (row.startAt && row.endAt && new Date(row.endAt) <= new Date(row.startAt)) throw new HttpError(400, '结束时间必须晚于开始时间。');
      break;
    case 'domains':
      if (has('title')) row.title = requiredTitle(data.title, '请填写领域名称。');
      if (has('stage')) row.stage = clamp(data.stage, 1, 5, row.stage);
      if (has('summary')) row.summary = text(data.summary);
      if (has('nextStep')) row.nextStep = text(data.nextStep);
      if (has('color')) row.color = text(data.color) || row.color;
      break;
    case 'learningLogs':
      if (has('title')) row.title = requiredTitle(data.title, '请填写学习记录。');
      if (has('note')) row.note = text(data.note);
      if (has('minutes')) row.minutes = clamp(data.minutes, 0, 1440, row.minutes);
      if (has('occurredAt')) row.occurredAt = isoRequired(data.occurredAt, '学习时间无效。');
      break;
    case 'knowledgeNotes':
      if (has('title')) row.title = requiredTitle(data.title, '请填写认知条目标题。');
      if (has('note') || has('content')) row.content = text(data.note ?? data.content);
      if (has('kind')) row.kind = text(data.kind) || 'note';
      if (has('domainId')) row.domainId = nullableText(data.domainId);
      if (has('stage')) row.stage = row.kind === 'stage' ? clamp(data.stage, 1, 5, 1) : null;
      if (row.kind !== 'note' && !row.domainId) throw new HttpError(400, '请选择这条认知所属的领域。');
      break;
    case 'ideas':
      if (has('title')) row.title = requiredTitle(data.title, '请填写内容。');
      if (has('note')) row.note = text(data.note);
      if (has('type')) row.type = text(data.type) === 'question' ? 'question' : 'idea';
      if (has('status')) row.status = text(data.status) || row.status;
      if (has('projectId')) row.projectId = nullableText(data.projectId);
      if (has('domainId')) row.domainId = nullableText(data.domainId);
      break;
    case 'events':
      if (has('title')) row.title = requiredTitle(data.title, '请填写日程标题。');
      if (has('startAt')) row.startAt = isoRequired(data.startAt, '开始时间无效。');
      if (has('endAt')) row.endAt = isoRequired(data.endAt, '结束时间无效。');
      if (has('notes') || has('note')) row.notes = text(data.notes ?? data.note);
      if (has('allDay')) row.allDay = Boolean(data.allDay);
      if (has('color')) row.color = text(data.color) || row.color;
      if (has('projectId')) row.projectId = nullableText(data.projectId);
      if (new Date(row.endAt) <= new Date(row.startAt)) throw new HttpError(400, '结束时间必须晚于开始时间。');
      row.syncStatus = 'local';
      break;
  }
  row.updatedAt = now;
  rows[index] = row;
  return row;
}

function archiveEntity(entity, id, store, action) {
  const rows = store[entity];
  const row = rows.find((item) => item.id === id);
  if (!row) throw new HttpError(404, '这条记录已经不存在。');
  if (action !== 'delete') {
    row.archivedAt = nowIso();
    row.updatedAt = row.archivedAt;
    if (entity === 'events') row.syncStatus = 'archive-pending';
    if (entity === 'courseSlots') pruneCourse(store, row.courseId);
    return { archived: true };
  }
  switch (entity) {
    case 'semesters':
      store.courseSlots = store.courseSlots.filter((item) => {
        const course = store.courses.find((entry) => entry.id === item.courseId);
        return course ? course.semesterId !== id : false;
      });
      store.courses = store.courses.filter((item) => item.semesterId !== id);
      store.semesters = store.semesters.filter((item) => item.id !== id);
      break;
    case 'courses':
      store.courseSlots = store.courseSlots.filter((item) => item.courseId !== id);
      store.courses = store.courses.filter((item) => item.id !== id);
      break;
    case 'courseSlots':
      store.courseSlots = store.courseSlots.filter((item) => item.id !== id);
      pruneCourse(store, row.courseId);
      break;
    case 'projects':
      store.tasks = store.tasks.filter((item) => item.projectId !== id);
      for (const item of store.ideas) if (item.projectId === id) item.projectId = null;
      for (const item of store.events) if (item.projectId === id) item.projectId = null;
      store.projects = store.projects.filter((item) => item.id !== id);
      break;
    case 'domains':
      store.knowledgeNotes = store.knowledgeNotes.filter((item) => item.domainId !== id);
      store.learningLogs = store.learningLogs.filter((item) => item.domainId !== id);
      for (const item of store.tasks) if (item.domainId === id) item.domainId = null;
      for (const item of store.ideas) if (item.domainId === id) item.domainId = null;
      store.domains = store.domains.filter((item) => item.id !== id);
      break;
    case 'tasks': store.tasks = store.tasks.filter((item) => item.id !== id); break;
    case 'ideas': store.ideas = store.ideas.filter((item) => item.id !== id); break;
    case 'events': store.events = store.events.filter((item) => item.id !== id); break;
    case 'learningLogs': store.learningLogs = store.learningLogs.filter((item) => item.id !== id); break;
    case 'knowledgeNotes': store.knowledgeNotes = store.knowledgeNotes.filter((item) => item.id !== id); break;
  }
  return { deleted: true };
}

async function handleWorkspace(req, res, pathname) {
  if (pathname === `${PREFIX}/workspace`) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const store = readStore();
      return sendJson(res, 200, snapshot(store));
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      await Promise.resolve();
      const entity = requireEntity(body.entity);
      const store = readStore();
      const item = createEntity(entity, body.data && typeof body.data === 'object' ? body.data : {}, store);
      saveStore(store);
      return sendJson(res, 201, { item });
    }
    if (req.method === 'PATCH') {
      const body = await readBody(req);
      const entity = requireEntity(body.entity);
      if (typeof body.id !== 'string' || !body.id) throw new HttpError(400, '缺少记录 id。');
      const store = readStore();
      const item = updateEntity(entity, body.id, body.data && typeof body.data === 'object' ? body.data : {}, store);
      saveStore(store);
      return sendJson(res, 200, { item });
    }
    if (req.method === 'DELETE') {
      const body = await readBody(req);
      const entity = requireEntity(body.entity);
      if (typeof body.id !== 'string' || !body.id) throw new HttpError(400, '缺少记录 id。');
      const action = body.action === 'delete' ? 'delete' : 'archive';
      const store = readStore();
      const result = archiveEntity(entity, body.id, store, action);
      saveStore(store);
      return sendJson(res, 200, result);
    }
    return sendJson(res, 405, { error: '不支持的方法。' });
  }

  if (pathname === `${PREFIX}/profile` && req.method === 'PATCH') {
    const body = await readBody(req);
    const store = readStore();
    const nickname = text(body.nickname);
    if (nickname) store.profile.nickname = nickname.slice(0, 40);
    if (typeof body.school === 'string' && text(body.school)) store.profile.school = text(body.school).slice(0, 60);
    if (Array.isArray(body.claims)) store.profile.claims = body.claims.slice(0, 200);
    saveStore(store);
    return sendJson(res, 200, { profile: snapshot(store).profile });
  }
  if (pathname === `${PREFIX}/settings` && req.method === 'PATCH') {
    const body = await readBody(req);
    const store = readStore();
    const current = store.settings.reminders;
    if (body.reminders && typeof body.reminders === 'object') {
      const next = body.reminders;
      store.settings.reminders = {
        enabled: next.enabled === undefined ? current.enabled : Boolean(next.enabled),
        dailyDigest: next.dailyDigest === undefined ? current.dailyDigest : Boolean(next.dailyDigest),
        digestTime: /^\d{2}:\d{2}$/.test(String(next.digestTime ?? '')) ? next.digestTime : current.digestTime,
        leadHours: Array.isArray(next.leadHours)
          ? [...new Set(next.leadHours.map(Number).filter((hour) => Number.isFinite(hour) && hour > 0 && hour <= 168))].slice(0, 3)
          : current.leadHours,
      };
    }
    if (Array.isArray(body.periodTimes) && body.periodTimes.length) {
      const rows = body.periodTimes
        .map((item, index) => ({
          index: index + 1,
          start: /^\d{2}:\d{2}$/.test(String(item?.start ?? '')) ? item.start : '',
          end: /^\d{2}:\d{2}$/.test(String(item?.end ?? '')) ? item.end : '',
        }))
        .filter((item) => item.start && item.end);
      if (rows.length) store.settings.periodTimes = rows;
    }
    saveStore(store);
    return sendJson(res, 200, { settings: snapshot(store).settings });
  }
  if (pathname === `${PREFIX}/timetable/demo` && req.method === 'POST') {
    const store = readStore();
    if (store.semesters.some((item) => !item.archivedAt)) {
      return sendJson(res, 409, { error: '已经有学期了，示例课表不会覆盖现有数据。' });
    }
    const demo = demoCourses();
    store.semesters.push(...demo.semesters);
    store.courses.push(...demo.courses);
    store.courseSlots.push(...demo.courseSlots);
    saveStore(store);
    return sendJson(res, 201, { semesters: demo.semesters.length, courses: demo.courses.length });
  }
  if (pathname === `${PREFIX}/store/reset` && req.method === 'POST') {
    const body = await readBody(req);
    const mode = body.mode === 'demo' ? 'demo' : 'empty';
    saveStore(mode === 'demo' ? seedStore() : emptyStore());
    return sendJson(res, 200, { ok: true, mode });
  }

  if (pathname === `${PREFIX}/google/status` && (req.method === 'GET' || req.method === 'HEAD')) {
    return sendJson(res, 200, {
      configured: false, connected: false, googleEmail: null,
      lastSyncAt: null, calendars: [],
    });
  }
  if (pathname === `${PREFIX}/google/calendars` && req.method === 'GET') {
    return sendJson(res, 200, { calendars: [] });
  }
  if (pathname === `${PREFIX}/google/calendars` && req.method === 'POST') {
    return sendJson(res, 200, { calendars: [] });
  }
  if (pathname === `${PREFIX}/google/sync` && req.method === 'POST') {
    return sendJson(res, 501, { error: '本地版暂不启用 Google Calendar 同步。' });
  }
  if (pathname === `${PREFIX}/google/disconnect` && req.method === 'POST') {
    return sendJson(res, 200, { ok: true });
  }
  if (pathname === `${PREFIX}/google/connect` && req.method === 'GET') {
    return sendJson(res, 501, { error: '本地版暂不启用 Google Calendar 授权。' });
  }
  if (pathname === `${PREFIX}/export` && (req.method === 'GET' || req.method === 'HEAD')) {
    const store = readStore();
    return sendJson(res, 200, { ...snapshot(store), exportedAt: nowIso(), version: store.version });
  }
  if (pathname === `${PREFIX}/health` && (req.method === 'GET' || req.method === 'HEAD')) {
    return sendJson(res, 200, { ok: true, dataFile: DATA_FILE });
  }
  return sendJson(res, 404, { error: '未知的本地工作台接口。' });
}

export function registerWorkflowRoutes(ctx, bindHost) {
  return ctx.effect(
    () => ctx.webServer.register({
      kind: 'prefix',
      path: PREFIX,
      handler: async (req, res) => {
        try {
          if (!isTrustedRequest(req, bindHost)) {
            return sendJson(res, 403, { error: '只允许本机访问。' });
          }
          const pathname = new URL(req.url, 'http://localhost').pathname;
          if (pathname === APP_PREFIX || pathname.startsWith(`${APP_PREFIX}/`)) {
            return serveApp(req, res, pathname);
          }
          return await handleWorkspace(req, res, pathname);
        } catch (error) {
          if (error instanceof BodyTooLarge) return sendJson(res, 413, { error: '请求内容过大。' });
          if (error instanceof HttpError) return sendJson(res, error.status, { error: error.message });
          console.error('[dsh-workflow] request failed', error);
          return sendJson(res, 500, { error: '本地工作台暂时无法处理这个请求。' });
        }
      },
    }),
    'dsh-quota-wallpaper: local workflow routes',
  );
}
