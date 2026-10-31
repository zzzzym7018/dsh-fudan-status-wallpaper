/**
 * agent-tools.js — 知行台 capabilities exposed to the DSH agent.
 *
 * Registered by hand as registry-ready definitions (the same shape defineTool
 * produces) so this package needs no runtime dependency on the harness
 * packages. Each tool is a thin wrapper over workflow-host.js: one operation,
 * two callers — the UI reaches the same host methods over HTTP.
 */
import {
  addClaim,
  applyDraft,
  createDraft,
  dateKeyOf,
  generateDigest,
  listClaims,
  readStore,
  rebuildProfile,
  saveStore,
  sessionsOn,
  shiftDateKey,
  statsFor,
  upcomingDeadlines,
} from './workflow-host.js';

const todayKey = () => new Date(Date.now() + 8 * 3600_000).toISOString().slice(0, 10);
const clean = (value) => (typeof value === 'string' ? value.trim() : '');

/** JSON Schema object builder. */
const params = (properties, required = []) => ({
  type: 'object',
  properties,
  required,
  additionalProperties: false,
});

const tool = (name, description, parameters, schema, execute) => ({
  name,
  description,
  parameters,
  output: {
    schema,
    render: (_args, value) => [
      { type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) },
    ],
  },
  execute: async (args) => execute(args ?? {}),
});

/** Events or courses that overlap a proposed block. */
function conflictsFor(store, startAt, endAt) {
  const dateKey = dateKeyOf(startAt);
  const start = Date.parse(startAt);
  const end = Date.parse(endAt);
  const conflicts = [];
  for (const session of sessionsOn(store, dateKey)) {
    const sessionStart = Date.parse(`${dateKey}T${session.start}:00+08:00`);
    const sessionEnd = Date.parse(`${dateKey}T${session.end}:00+08:00`);
    if (sessionStart < end && start < sessionEnd) {
      conflicts.push({ kind: 'course', title: session.name, start: session.start, end: session.end });
    }
  }
  for (const event of store.events) {
    if (event.archivedAt) continue;
    if (Date.parse(event.startAt) < end && start < Date.parse(event.endAt)) {
      conflicts.push({ kind: 'event', title: event.title, start: event.startAt, end: event.endAt });
    }
  }
  return conflicts;
}

const scheduleItem = {
  type: 'object',
  additionalProperties: false,
  properties: {
    kind: {
      type: 'string',
      enum: ['task', 'event', 'courseSlot'],
      description: 'task = 待办/子目标；event = 一件有开始结束的日程；courseSlot = 每周固定课程时间',
    },
    op: { type: 'string', enum: ['create', 'update', 'delete'], description: '默认 create' },
    id: { type: 'string', description: 'update/delete 时的目标 id' },
    data: {
      type: 'object',
      description:
        'task: {title, plannedDate?, dueDate?, notes?}；event: {title, startAt, endAt, notes?}（ISO 带 +08:00）；courseSlot: {courseName, weekday 1-7, startPeriod, endPeriod, weeks?, location?, teacher?}',
    },
  },
  required: ['kind', 'data'],
};

const DAY_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    date: { type: 'string' },
    courses: { type: 'array', items: { type: 'object' } },
    tasks: { type: 'array', items: { type: 'object' } },
    events: { type: 'array', items: { type: 'object' } },
    deadlines: { type: 'array', items: { type: 'object' } },
  },
};

export function registerAgentTools(ctx) {
  const tools = [
    tool(
      'workflow_day_overview',
      '读取知行台里某一天的课程、任务、日程与临近 DDL。排日程或写总结前先调用，别凭空猜。日期省略时用今天（Asia/Shanghai）。',
      params({ date: { type: 'string', description: 'YYYY-MM-DD，省略为今天' } }),
      DAY_SCHEMA,
      async (args) => {
        const date = /^\d{4}-\d{2}-\d{2}$/.test(clean(args.date)) ? args.date : todayKey();
        const store = readStore();
        const stats = statsFor(store, date);
        return {
          date,
          courses: stats.courses,
          tasks: stats.due.concat(stats.planned).map((task) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            plannedDate: task.plannedDate,
            dueDate: task.dueDate,
          })),
          events: stats.events,
          deadlines: upcomingDeadlines(store, date, 3).map((task) => ({
            id: task.id,
            title: task.title,
            dueDate: task.dueDate,
          })),
        };
      },
    ),
    tool(
      'workflow_week_overview',
      '读取某一周的课程表与周次，用来把「下周三」「这周五」落到具体日期。',
      params({ weekOffset: { type: 'number', description: '0 = 本周，1 = 下周，-1 = 上周' } }),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          week: { type: 'number' },
          startDate: { type: 'string' },
          days: { type: 'array', items: { type: 'object' } },
        },
      },
      async (args) => {
        const store = readStore();
        const offset = Number.isFinite(Number(args.weekOffset)) ? Number(args.weekOffset) : 0;
        const today = todayKey();
        const active = store.semesters.filter((item) => !item.archivedAt);
        const semester = active.find((item) => item.isActive) ?? active[active.length - 1];
        if (!semester) return { week: 0, startDate: today, days: [] };
        const start = Date.parse(`${semester.startDate}T00:00:00Z`);
        const currentWeek = Math.floor((Date.parse(`${today}T00:00:00Z`) - start) / 86_400_000 / 7) + 1;
        const week = Math.min(Math.max(currentWeek + offset, 1), semester.weekCount);
        const monday = shiftDateKey(semester.startDate, (week - 1) * 7);
        const days = Array.from({ length: 7 }, (_, index) => {
          const date = shiftDateKey(monday, index);
          return {
            date,
            courses: sessionsOn(store, date).map((session) => `${session.start} ${session.name}`),
          };
        });
        return { week, startDate: monday, days };
      },
    ),
    tool(
      'workflow_search',
      '在任务、项目、Ideas 里按关键词搜索，避免重复创建同一条。',
      params({ query: { type: 'string', description: '关键词' } }, ['query']),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          tasks: { type: 'array', items: { type: 'object' } },
          projects: { type: 'array', items: { type: 'object' } },
          ideas: { type: 'array', items: { type: 'object' } },
        },
      },
      async (args) => {
        const query = clean(args.query).toLowerCase();
        if (!query) return { tasks: [], projects: [], ideas: [] };
        const store = readStore();
        const match = (value) => String(value ?? '').toLowerCase().includes(query);
        return {
          tasks: store.tasks
            .filter((task) => !task.archivedAt && match(task.title))
            .slice(0, 8)
            .map((task) => ({ id: task.id, title: task.title, status: task.status, dueDate: task.dueDate })),
          projects: store.projects
            .filter((project) => !project.archivedAt && match(project.title))
            .slice(0, 6)
            .map((project) => ({ id: project.id, title: project.title })),
          ideas: store.ideas
            .filter((idea) => !idea.archivedAt && (match(idea.title) || match(idea.note)))
            .slice(0, 6)
            .map((idea) => ({ id: idea.id, title: idea.title })),
        };
      },
    ),
    tool(
      'workflow_get_profile',
      '读取用户的长期画像（作息、偏好、习惯、约束）。给用户安排事情前先看这里，别推荐他明确不想要的时间。',
      params({}),
      {
        type: 'object',
        additionalProperties: false,
        properties: { claims: { type: 'array', items: { type: 'object' } } },
      },
      async () => ({
        claims: listClaims(readStore()).map((claim) => ({
          id: claim.id,
          text: claim.text,
          kind: claim.kind,
          status: claim.status,
          confidence: claim.confidence,
        })),
      }),
    ),
    tool(
      'workflow_propose_schedule',
      '把一组「要建/要改」的日程或任务写成草稿。不要直接改数据：草稿会显示给用户确认，确认后才落库。时间一律用带 +08:00 的 ISO 字符串；有冲突时先问用户，不要自己挪课。',
      params(
        {
          reason: { type: 'string', description: '一句话说明这批改动从哪来，给用户看' },
          items: { type: 'array', items: scheduleItem, description: '最多 20 条' },
        },
        ['items'],
      ),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          draftId: { type: 'string' },
          summary: { type: 'string' },
          conflicts: { type: 'array', items: { type: 'object' } },
        },
      },
      async (args) => {
        const store = readStore();
        const draft = createDraft(store, {
          items: Array.isArray(args.items) ? args.items : [],
          reason: args.reason,
          source: 'agent',
        });
        const conflicts = [];
        for (const item of draft.items) {
          if (item.kind !== 'event' || !item.data.startAt || !item.data.endAt) continue;
          const start = new Date(String(item.data.startAt));
          const end = new Date(String(item.data.endAt));
          if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) continue;
          for (const conflict of conflictsFor(store, start, end)) {
            conflicts.push({ title: item.data.title ?? '', ...conflict });
          }
        }
        saveStore(store);
        return {
          draftId: draft.id,
          summary: `${draft.items.length} 条改动待确认${draft.reason ? `：${draft.reason}` : ''}`,
          conflicts,
        };
      },
    ),
    tool(
      'workflow_apply_draft',
      '用户明确同意之后，把某份草稿落库。没得到同意不要调用。',
      params({ draftId: { type: 'string', description: '草稿 id' } }, ['draftId']),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          applied: { type: 'boolean' },
          created: { type: 'array', items: { type: 'object' } },
        },
      },
      async (args) => {
        const store = readStore();
        const result = applyDraft(store, clean(args.draftId));
        saveStore(store);
        return {
          applied: true,
          created: result.created.map((row) => ({ id: row.id, title: row.title })),
        };
      },
    ),
    tool(
      'workflow_update_task',
      '勾完成、改期或改名某条任务。不需要确认，但改完要告诉用户。',
      params({
        taskId: { type: 'string', description: '任务 id' },
        status: { type: 'string', enum: ['todo', 'doing', 'done'] },
        dueDate: { type: 'string', description: 'YYYY-MM-DD' },
        plannedDate: { type: 'string', description: 'YYYY-MM-DD' },
      }, ['taskId']),
      {
        type: 'object',
        additionalProperties: false,
        properties: { ok: { type: 'boolean' }, task: { type: 'object' } },
      },
      async (args) => {
        const store = readStore();
        const task = store.tasks.find((item) => item.id === clean(args.taskId) && !item.archivedAt);
        if (!task) throw new Error('找不到这条任务。');
        if (args.status && ['todo', 'doing', 'done'].includes(args.status)) task.status = args.status;
        if (args.dueDate !== undefined) task.dueDate = clean(args.dueDate) || null;
        if (args.plannedDate !== undefined) task.plannedDate = clean(args.plannedDate) || null;
        task.updatedAt = new Date().toISOString();
        saveStore(store);
        return {
          ok: true,
          task: { id: task.id, title: task.title, status: task.status, dueDate: task.dueDate },
        };
      },
    ),
    tool(
      'workflow_remember',
      '把一条值得长期记住的事实/偏好/习惯写进画像。用户明确说「记住」时才用，别把一次性的安排写进去。',
      params({
        text: { type: 'string', description: '一句话，最多 60 字' },
        kind: { type: 'string', enum: ['fact', 'preference', 'habit', 'constraint'] },
      }, ['text']),
      {
        type: 'object',
        additionalProperties: false,
        properties: { ok: { type: 'boolean' }, claim: { type: 'object' } },
      },
      async (args) => {
        const store = readStore();
        const claim = addClaim(store, {
          text: args.text,
          kind: args.kind ?? 'preference',
          source: 'user',
        });
        saveStore(store);
        return { ok: true, claim: { id: claim.id, text: claim.text, kind: claim.kind, status: claim.status } };
      },
    ),
    tool(
      'workflow_run_digest',
      '立刻生成今天（或指定日期）的简报：昨日完成、今日任务与课程、DDL、天气。用户想提前看时用。',
      params({ date: { type: 'string', description: 'YYYY-MM-DD，省略为今天' } }),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          headline: { type: 'string' },
          sections: { type: 'array', items: { type: 'object' } },
          source: { type: 'string' },
        },
      },
      async (args) => {
        const store = readStore();
        const entry = await generateDigest(store, { date: args.date });
        saveStore(store);
        return { headline: entry.headline, sections: entry.sections, source: entry.source };
      },
    ),
    tool(
      'workflow_rebuild_profile',
      '根据最近三个月的全部记录和现有画像，重新生成画像摘要与长期词条。用户说「更新一下我的画像」时用。旧的词条只有在被新词条取代时才会退役。',
      params({ days: { type: 'number', description: '回看天数，默认 90' } }),
      {
        type: 'object',
        additionalProperties: false,
        properties: {
          summary: { type: 'string' },
          added: { type: 'number' },
          retired: { type: 'number' },
          claims: { type: 'array', items: { type: 'object' } },
        },
      },
      async (args) => {
        const store = readStore();
        const result = await rebuildProfile(store, { days: args.days });
        saveStore(store);
        return {
          summary: result.summary,
          added: result.added,
          retired: result.retired,
          claims: result.claims,
        };
      },
    ),
  ];

  for (const definition of tools) ctx.tools.register(definition);
  return tools.map((definition) => definition.name);
}
