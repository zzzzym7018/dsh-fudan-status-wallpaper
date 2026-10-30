"use client";

import type {
  CSSProperties,
  FormEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ViewKey =
  | "today"
  | "courses"
  | "calendar"
  | "projects"
  | "learning"
  | "ideas"
  | "review"
  | "settings";
type EntityName =
  | "project"
  | "task"
  | "domain"
  | "idea"
  | "event"
  | "learningLog"
  | "knowledgeNote";
type Viewer = { displayName: string; email: string; isPreview: boolean };
type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  color: string;
  deadline: string | null;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};
type Task = {
  id: string;
  projectId: string | null;
  domainId: string | null;
  title: string;
  notes: string;
  status: string;
  priority: string;
  plannedDate: string | null;
  dueDate: string | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
};
type Domain = {
  id: string;
  title: string;
  stage: number;
  summary: string;
  nextStep: string;
  color: string;
  createdAt: string;
  updatedAt: string;
};
type LearningLog = {
  id: string;
  domainId: string;
  title: string;
  note: string;
  minutes: number;
  occurredAt: string;
  createdAt: string;
  updatedAt: string;
};
type KnowledgeNote = {
  id: string;
  domainId: string | null;
  kind: "insight" | "branch" | "stage" | "note";
  stage: number | null;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};
type Idea = {
  id: string;
  title: string;
  note: string;
  type: string;
  status: string;
  projectId: string | null;
  domainId: string | null;
  createdAt: string;
  updatedAt: string;
};
type CalendarEvent = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  notes: string;
  color: string;
  source: string;
  externalId: string | null;
  externalCalendarId: string | null;
  syncStatus: string;
  projectId: string | null;
  createdAt: string;
  updatedAt: string;
};
type Snapshot = {
  profile: Profile;
  settings: Settings;
  semesters: Semester[];
  activeSemesterId: string | null;
  courses: Course[];
  courseSlots: CourseSlot[];
  projects: Project[];
  tasks: Task[];
  domains: Domain[];
  learningLogs: LearningLog[];
  knowledgeNotes: KnowledgeNote[];
  ideas: Idea[];
  events: CalendarEvent[];
  viewer: Viewer;
};
type Profile = {
  nickname: string;
  school: string;
  claims: unknown[];
};
type CoursePeriod = { index: number; start: string; end: string };
type ReminderSettings = {
  enabled: boolean;
  dailyDigest: boolean;
  digestTime: string;
  leadHours: number[];
};
type Settings = { periodTimes: CoursePeriod[]; reminders: ReminderSettings };
type Semester = {
  id: string;
  name: string;
  startDate: string;
  weekCount: number;
  isActive: boolean;
  note: string;
};
type Course = {
  id: string;
  semesterId: string;
  name: string;
  teacher: string;
  code: string;
  credits: number;
  color: string;
  note: string;
};
type CourseSlot = {
  id: string;
  courseId: string;
  weekday: number;
  startPeriod: number;
  endPeriod: number;
  weeks: number[];
  location: string;
  note: string;
};
/** One dated occurrence of a timetable slot. */
type CourseSession = {
  slotId: string;
  courseId: string;
  dateKey: string;
  title: string;
  teacher: string;
  location: string;
  color: string;
  start: string;
  end: string;
  startMinute: number;
  endMinute: number;
  periods: string;
};
type GoogleCalendar = {
  id: string;
  calendarId: string;
  name: string;
  color: string;
  selected: boolean;
  writable: boolean;
  isPrimary: boolean;
};
type GoogleStatus = {
  configured: boolean;
  connected: boolean;
  googleEmail: string | null;
  lastSyncAt: string | null;
  calendars: GoogleCalendar[];
};
type Toast = {
  id: string;
  message: string;
  tone: "success" | "warning" | "error" | "info";
};
type EditorDraft = Record<string, string>;
type DeleteTarget = {
  entity: Exclude<EntityName, "learningLog" | "knowledgeNote">;
  id: string;
  title: string;
  description: string;
};

const temporarilyDisabledViews = new Set<ViewKey>(["review"]);

const allNavigation: Array<{ key: ViewKey; label: string; mark: string }> = [
  { key: "today", label: "今日", mark: "今" },
  { key: "courses", label: "课表", mark: "课" },
  { key: "calendar", label: "日程", mark: "历" },
  { key: "projects", label: "项目", mark: "项" },
  { key: "learning", label: "领域学习", mark: "域" },
  { key: "ideas", label: "Ideas 与疑问", mark: "问" },
  { key: "review", label: "回顾", mark: "顾" },
  { key: "settings", label: "设置", mark: "设" },
];

const navigation = allNavigation.filter(
  (item) => !temporarilyDisabledViews.has(item.key),
);

/** The five destinations a phone-sized bottom bar can hold comfortably. */
const mobileNavigation: ViewKey[] = [
  "today",
  "courses",
  "calendar",
  "projects",
  "learning",
];

const viewTitles: Record<ViewKey, string> = {
  today: "今日",
  courses: "课表",
  calendar: "日程",
  projects: "项目",
  learning: "领域学习",
  ideas: "Ideas 与疑问",
  review: "回顾",
  settings: "设置",
};

const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

const stageLabels = [
  "尚未开始",
  "建立框架",
  "深入理解",
  "可以解释",
  "可以应用或输出",
];

const subgoalStatuses = [
  { value: "todo", label: "未开启", icon: "○" },
  { value: "doing", label: "进行中", icon: "◐" },
  { value: "done", label: "已完成", icon: "✓" },
] as const;

export function WorkspaceApp({ initialViewer }: { initialViewer: Viewer }) {
  const [activeView, setActiveView] = useState<ViewKey>("today");
  const [navigationReady, setNavigationReady] = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<EntityName | null>(null);
  const [editorTargetId, setEditorTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditorDraft>({});
  const [editorError, setEditorError] = useState("");
  const [saving, setSaving] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<{
    entity: Exclude<EntityName, "learningLog" | "knowledgeNote">;
    id: string;
    title: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [courseEditor, setCourseEditor] = useState<{
    id: string | null;
    draft: EditorDraft;
  } | null>(null);
  const [courseError, setCourseError] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const quickAddRef = useRef<HTMLButtonElement>(null);
  const editorReturnFocusIdRef = useRef<string | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      const view = new URLSearchParams(window.location.search).get(
        "view",
      ) as ViewKey | null;
      if (view && navigation.some((item) => item.key === view))
        setActiveView(view);
      setNavigationReady(true);
    });
  }, []);

  const notify = useCallback(
    (message: string, tone: Toast["tone"] = "success") => {
      const id = crypto.randomUUID();
      setToasts((items) => {
        if (items.some((item) => item.message === message)) return items;
        return [...items.slice(-2), { id, message, tone }];
      });
      window.setTimeout(
        () => setToasts((items) => items.filter((item) => item.id !== id)),
        4500,
      );
    },
    [],
  );

  const loadWorkspace = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/dsh-workflow/workspace", { signal });
    if (!response.ok) throw new Error("工作台数据暂时无法读取。 ");
    setSnapshot((await response.json()) as Snapshot);
  }, []);

  const loadGoogleStatus = useCallback(async (signal?: AbortSignal) => {
    const response = await fetch("/api/dsh-workflow/google/status", { signal });
    if (response.ok) setGoogleStatus((await response.json()) as GoogleStatus);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    queueMicrotask(() => {
      Promise.all([
        loadWorkspace(controller.signal),
        loadGoogleStatus(controller.signal),
      ])
        .catch((reason: unknown) => {
          if (!(reason instanceof DOMException && reason.name === "AbortError"))
            setError(
              reason instanceof Error
                ? reason.message
                : "工作台暂时无法读取。 ",
            );
        })
        .finally(() => setLoading(false));
    });
    return () => controller.abort();
  }, [loadGoogleStatus, loadWorkspace]);

  useEffect(() => {
    if (!navigationReady) return;
    document.title = `${viewTitles[activeView]} — 知行台`;
    const url = new URL(window.location.href);
    url.searchParams.set("view", activeView);
    window.history.replaceState({ view: activeView }, "", url);
  }, [activeView, navigationReady]);

  useEffect(() => {
    const onPopState = () => {
      const view = new URLSearchParams(window.location.search).get(
        "view",
      ) as ViewKey | null;
      if (view && navigation.some((item) => item.key === view))
        setActiveView(view);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = target?.matches(
        "input, textarea, select, [contenteditable='true']",
      );
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.isComposing
      ) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "n" &&
        !event.isComposing &&
        !isTyping
      ) {
        event.preventDefault();
        openEditor("task");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  function navigate(view: ViewKey) {
    setActiveView(view);
    const url = new URL(window.location.href);
    url.searchParams.set("view", view);
    window.history.pushState({ view }, "", url);
    document.querySelector<HTMLElement>("#workspace-main")?.focus();
  }

  function openEditor(entity: EntityName, defaults: EditorDraft = {}) {
    const date = localDateKey(new Date());
    editorReturnFocusIdRef.current = null;
    setEditor(entity);
    setEditorTargetId(null);
    setEditorError("");
    setDraft({
      type: entity === "idea" ? "idea" : "",
      kind: entity === "knowledgeNote" ? "insight" : "",
      date,
      plannedDate: entity === "task" ? date : "",
      dueDate: entity === "task" ? date : "",
      start: "09:00",
      end: "10:00",
      occurredDate: date,
      minutes: "45",
      stage: "1",
      ...defaults,
    });
  }

  function openEventEditor(event: CalendarEvent) {
    editorReturnFocusIdRef.current = null;
    setEditor("event");
    setEditorTargetId(event.id);
    setEditorError("");
    setDraft({
      title: event.title,
      date: localDateKey(new Date(event.startAt)),
      start: formatTime(event.startAt),
      end: formatTime(event.endAt),
      note: event.notes,
    });
  }

  function openTaskEditor(task: Task, returnFocusId = `agenda-task-${task.id}`) {
    editorReturnFocusIdRef.current = returnFocusId;
    setEditor("task");
    setEditorTargetId(task.id);
    setEditorError("");
    setDraft({
      title: task.title,
      plannedDate: task.plannedDate ?? task.dueDate ?? "",
      dueDate: task.dueDate ?? "",
      projectId: task.projectId ?? "",
      domainId: task.domainId ?? "",
      note: task.notes,
    });
  }

  function openProjectEditor(project: Project) {
    editorReturnFocusIdRef.current = `project-edit-${project.id}`;
    setEditor("project");
    setEditorTargetId(project.id);
    setEditorError("");
    setDraft({
      title: project.title,
      description: project.description,
      deadline: project.deadline ?? "",
    });
  }

  function openIdeaEditor(idea: Idea) {
    editorReturnFocusIdRef.current = `idea-edit-${idea.id}`;
    setEditor("idea");
    setEditorTargetId(idea.id);
    setEditorError("");
    setDraft({
      title: idea.title,
      type: idea.type,
      note: idea.note,
      status: idea.status,
      projectId: idea.projectId ?? "",
      domainId: idea.domainId ?? "",
    });
  }

  function openDomainEditor(domain: Domain) {
    editorReturnFocusIdRef.current = `domain-select-${domain.id}`;
    setEditor("domain");
    setEditorTargetId(domain.id);
    setEditorError("");
    setDraft({
      title: domain.title,
      stage: String(domain.stage),
      summary: domain.summary,
      nextStep: domain.nextStep,
    });
  }

  function openKnowledgeNoteEditor(note: KnowledgeNote) {
    editorReturnFocusIdRef.current = `knowledge-note-${note.id}`;
    setEditor("knowledgeNote");
    setEditorTargetId(note.id);
    setEditorError("");
    setDraft({
      title: note.title,
      kind: note.kind,
      stage: String(note.stage ?? 1),
      domainId: note.domainId ?? "",
      note: note.content,
    });
  }

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    setEditorError("");
    if (!draft.title?.trim()) {
      setEditorError("请先填写标题。 ");
      document.querySelector<HTMLElement>("#editor-title")?.focus();
      return;
    }
    const data: Record<string, unknown> = { ...draft };
    if (editor === "event") {
      const startAt = parseShanghaiDateTime(draft.date, draft.start);
      const endAt = parseShanghaiDateTime(draft.date, draft.end);
      if (!startAt || !endAt) {
        setEditorError("请按 YYYY-MM-DD 和 HH:mm 格式填写时间。 ");
        return;
      }
      data.startAt = startAt;
      data.endAt = endAt;
      data.notes = draft.note ?? "";
    }
    if (editor === "learningLog") {
      data.occurredAt = parseShanghaiDateTime(draft.occurredDate, "12:00");
      data.minutes = Number(draft.minutes);
    }
    setSaving(true);
    try {
      const editing = Boolean(editorTargetId);
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entity: editor,
          ...(editorTargetId ? { id: editorTargetId } : {}),
          data,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok)
        throw new Error(
          result.error || (editing ? "保存失败，请重试。 " : "创建失败，请重试。 "),
        );
      await loadWorkspace();
      const returnFocusId = editorReturnFocusIdRef.current;
      editorReturnFocusIdRef.current = null;
      setEditor(null);
      setEditorTargetId(null);
      notify(
        editing
          ? `${entityLabel(editor)}已更新`
          : editor === "task" && draft.projectId
            ? "子目标已创建"
            : `${entityLabel(editor)}已创建`,
      );
      window.setTimeout(
        () =>
          (returnFocusId
            ? document.getElementById(returnFocusId)
            : document.querySelector<HTMLElement>("#workspace-main"))?.focus(),
        0,
      );
    } catch (reason) {
      setEditorError(
        reason instanceof Error ? reason.message : "保存失败，请重试。 ",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(
    entity: EntityName | "semester",
    id: string,
    data: Record<string, unknown>,
    message = "更改已保存",
  ) {
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity, id, data }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      notify(message);
    } catch {
      notify("更改未保存，请重试", "error");
    }
  }

  async function archiveItem() {
    if (!archiveTarget) return;
    setSaving(true);
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entity: archiveTarget.entity,
          id: archiveTarget.id,
        }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      setArchiveTarget(null);
      notify("已归档", "warning");
    } catch {
      notify("未能归档，请重试", "error");
    } finally {
      setSaving(false);
    }
  }

  function requestDelete(target: DeleteTarget) {
    setDeleteError("");
    setDeleteTarget(target);
  }

  async function deleteItem() {
    if (!deleteTarget) return;
    setDeleteError("");
    setSaving(true);
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entity: deleteTarget.entity,
          id: deleteTarget.id,
          action: "delete",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "删除失败，请重试。 ");
      await loadWorkspace();
      const deletedEditorTarget = editorTargetId === deleteTarget.id;
      setDeleteTarget(null);
      if (deletedEditorTarget) {
        editorReturnFocusIdRef.current = null;
        setEditor(null);
        setEditorTargetId(null);
      }
      notify(`${entityLabel(deleteTarget.entity)}已永久删除`, "warning");
      window.setTimeout(
        () => document.querySelector<HTMLElement>("#workspace-main")?.focus(),
        0,
      );
    } catch (reason) {
      setDeleteError(
        reason instanceof Error ? reason.message : "删除失败，请重试。 ",
      );
    } finally {
      setSaving(false);
    }
  }

  async function syncGoogle() {
    setSyncing(true);
    try {
      const response = await fetch("/api/dsh-workflow/google/sync", { method: "POST" });
      const result = (await response.json()) as {
        imported?: number;
        exported?: number;
        error?: string;
      };
      if (!response.ok) throw new Error(result.error || "同步失败");
      await Promise.all([loadWorkspace(), loadGoogleStatus()]);
      notify(
        `同步完成：读取 ${result.imported ?? 0}，写入 ${result.exported ?? 0}`,
      );
    } catch (reason) {
      notify(
        reason instanceof Error ? reason.message : "同步失败，请重试",
        "error",
      );
    } finally {
      setSyncing(false);
    }
  }

  function openCourseEditor(
    defaults: EditorDraft = {},
    slot?: { id: string; courseId: string },
  ) {
    setCourseError("");
    const semester = activeSemesterOf(snapshot);
    const course = slot
      ? snapshot?.courses.find((item) => item.id === slot.courseId)
      : undefined;
    const existing = slot
      ? snapshot?.courseSlots.find((item) => item.id === slot.id)
      : undefined;
    setCourseEditor({
      id: slot?.id ?? null,
      draft: {
        semesterId: semester?.id ?? "",
        weekday: String(existing?.weekday ?? isoWeekdayOf(localDateKey(new Date()))),
        startPeriod: String(existing?.startPeriod ?? 1),
        endPeriod: String(existing?.endPeriod ?? 2),
        weeks: existing ? existing.weeks.join(",") : "",
        courseName: course?.name ?? "",
        teacher: course?.teacher ?? "",
        location: existing?.location ?? "",
        color: course?.color ?? "#0d2f5a",
        ...defaults,
      },
    });
  }

  async function saveCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseEditor) return;
    const { id, draft: values } = courseEditor;
    if (!values.courseName?.trim()) {
      setCourseError("请先填写课程名称。");
      return;
    }
    const startPeriod = Math.max(1, Math.min(13, Number(values.startPeriod) || 1));
    const endPeriod = Math.max(startPeriod, Math.min(13, Number(values.endPeriod) || startPeriod));
    const data: Record<string, unknown> = {
      semesterId: values.semesterId || null,
      courseName: values.courseName,
      teacher: values.teacher ?? "",
      location: values.location ?? "",
      color: values.color ?? "#0d2f5a",
      weekday: Number(values.weekday) || 1,
      startPeriod,
      endPeriod,
      weeks: values.weeks ?? "",
    };
    setSavingCourse(true);
    setCourseError("");
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: id ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity: "courseSlot", ...(id ? { id } : {}), data }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "保存失败，请重试。");
      await loadWorkspace();
      setCourseEditor(null);
      notify(id ? "课程时间已更新" : "课程已加入课表");
    } catch (reason) {
      setCourseError(reason instanceof Error ? reason.message : "保存失败，请重试。");
    } finally {
      setSavingCourse(false);
    }
  }

  async function deleteCourseSlot(slotId: string) {
    setSavingCourse(true);
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ entity: "courseSlot", id: slotId, action: "delete" }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      setCourseEditor(null);
      notify("课程时间已删除", "warning");
    } catch {
      setCourseError("未能删除，请重试。");
    } finally {
      setSavingCourse(false);
    }
  }

  async function saveProfile(next: { nickname?: string }) {
    try {
      const response = await fetch("/api/dsh-workflow/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      notify("身份已更新");
    } catch {
      notify("未能保存，请重试", "error");
    }
  }

  async function saveSettings(next: { reminders?: Partial<ReminderSettings>; periodTimes?: CoursePeriod[] }) {
    try {
      const response = await fetch("/api/dsh-workflow/settings", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      notify("设置已保存");
    } catch {
      notify("设置未保存，请重试", "error");
    }
  }

  async function saveSemester(semester: Semester, patch: Record<string, unknown>) {
    await updateItem("semester", semester.id, patch, "学期已更新");
  }

  async function createSemester() {
    setSaving(true);
    try {
      const response = await fetch("/api/dsh-workflow/workspace", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          entity: "semester",
          data: {
            name: `${new Date().getFullYear()} 学年 学期`,
            startDate: mondayKeyOf(todayKey),
            weekCount: 16,
            isActive: true,
          },
        }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      notify("学期已创建，现在可以添加课程");
    } catch {
      notify("未能创建学期", "error");
    } finally {
      setSaving(false);
    }
  }

  async function loadDemoTimetable() {
    try {
      const response = await fetch("/api/dsh-workflow/timetable/demo", { method: "POST" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "无法载入示例课表。");
      await loadWorkspace();
      notify("示例课表已载入，可以按自己的课表修改");
    } catch (reason) {
      notify(reason instanceof Error ? reason.message : "无法载入示例课表。", "error");
    }
  }

  async function resetStore(mode: "empty" | "demo") {
    setSaving(true);
    try {
      const response = await fetch("/api/dsh-workflow/store/reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!response.ok) throw new Error();
      await loadWorkspace();
      notify(mode === "empty" ? "已清空为空白工作台" : "已恢复示例数据", "warning");
    } catch {
      notify("未能重置，请重试", "error");
    } finally {
      setSaving(false);
    }
  }

  const viewer = snapshot?.viewer ?? initialViewer;
  const today = new Date();
  const todayKey = localDateKey(today);
  const todayEvents = useMemo(
    () =>
      (snapshot?.events ?? []).filter(
        (item) => localDateKey(new Date(item.startAt)) === todayKey,
      ),
    [snapshot, todayKey],
  );
  const semester = activeSemesterOf(snapshot);
  const weekInfo = useMemo(
    () => (semester ? semesterWeekAt(semester, todayKey) : null),
    [semester, todayKey],
  );
  const todaySessions = useMemo(
    () => sessionsForDate(snapshot, todayKey),
    [snapshot, todayKey],
  );
  const deadlines = useMemo(
    () => upcomingDeadlines(snapshot?.tasks ?? [], todayKey, 7),
    [snapshot, todayKey],
  );
  const dueSoon = useMemo(
    () =>
      deadlines.filter(
        (task) =>
          task.dueDate && hoursUntilDate(task.dueDate, Date.now()) <= 48 && task.dueDate >= todayKey,
      ),
    [deadlines, todayKey],
  );
  const reminderCount = todaySessions.length + dueSoon.length;

  useReminderEngine({
    snapshot,
    todayKey,
    todaySessions,
    deadlines,
    semester,
    weekInfo,
    notify,
  });

  return (
    <div className="workspace-shell">
      <aside className="sidebar" aria-label="主要导航">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true">
            <img src="./emblem-gold.png" alt="" />
          </span>
          <div>
            <strong>知行台</strong>
            <span>FUDAN · 1905</span>
          </div>
        </div>
        <nav className="nav-list">
          {navigation.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeView === item.key ? "is-current" : ""}`}
              type="button"
              aria-current={activeView === item.key ? "page" : undefined}
              onClick={() => navigate(item.key)}
            >
              <span className="nav-mark" aria-hidden="true">
                {item.mark}
              </span>
              <span>{item.label}</span>
              {item.key === "ideas" && snapshot ? (
                <span className="nav-count">
                  {
                    snapshot.ideas.filter((idea) => idea.status !== "resolved")
                      .length
                  }
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="sidebar-quote" aria-hidden="true">
          <span className="sidebar-quote-en">FUDAN UNIVERSITY</span>
          <p>博学而笃志<br />切问而近思</p>
          <span className="sidebar-quote-line" />
        </div>
        <div className="sidebar-footer">
          <div className="profile-mark" aria-hidden="true">
            {viewer.displayName.slice(0, 1)}
          </div>
          <div>
            <strong>{viewer.displayName}</strong>
            <span>{viewer.isPreview ? "本地工作台" : "私人空间"}</span>
          </div>
        </div>
      </aside>

      <div className="workspace-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">{formatFullDate(today)}</p>
            <h1>{viewTitles[activeView]}</h1>
          </div>
          <div className="topbar-actions">
            <div className="reminder-anchor">
              <button
                className={`reminder-trigger ${reminderCount ? "has-items" : ""}`}
                type="button"
                aria-label={`提醒，${reminderCount} 项待关注`}
                aria-expanded={reminderOpen}
                onClick={() => setReminderOpen((value) => !value)}
              >
                <span aria-hidden="true">铃</span>
                {reminderCount ? <b aria-hidden="true">{reminderCount}</b> : null}
              </button>
              {reminderOpen ? (
                <ReminderPanel
                  sessions={todaySessions}
                  deadlines={deadlines}
                  weekLabel={
                    weekInfo && weekInfo.inTerm ? `第 ${weekInfo.week} 周` : "假期"
                  }
                  reminders={snapshot?.settings?.reminders}
                  onClose={() => setReminderOpen(false)}
                  onOpenWeek={() => {
                    setReminderOpen(false);
                    navigate("courses");
                  }}
                  onEditTask={openTaskEditor}
                  onRequestPermission={async () => {
                    if (!("Notification" in window)) {
                      notify("这个浏览器不支持系统通知", "warning");
                      return;
                    }
                    const permission = await Notification.requestPermission();
                    notify(
                      permission === "granted"
                        ? "系统通知已开启"
                        : "未开启系统通知，提醒仍会显示在页面里",
                      permission === "granted" ? "success" : "warning",
                    );
                  }}
                />
              ) : null}
            </div>
            <button
              className="search-trigger"
              type="button"
              onClick={() => setSearchOpen(true)}
            >
              <span>搜索任务、项目或问题</span>
              <kbd>⌘ K</kbd>
            </button>
            <button
              ref={quickAddRef}
              className="button button--primary"
              type="button"
              onClick={() => {
                if (activeView === "courses") {
                  openCourseEditor({
                    weekday: String(isoWeekdayOf(todayKey)),
                    startPeriod: "1",
                    endPeriod: "2",
                  });
                  return;
                }
                openEditor(
                  activeView === "calendar"
                    ? "event"
                    : activeView === "projects"
                      ? "project"
                    : activeView === "ideas"
                      ? "idea"
                      : activeView === "learning"
                        ? "learningLog"
                        : "task",
                );
              }}
            >
              ＋ 快速添加
            </button>
          </div>
        </header>

        {viewer.isPreview ? (
          <div className="preview-banner" role="status">
            <span>复旦 · 本地</span>
            <span>日月光华 · 旦复旦兮　│　数据只保存在这台电脑；Google Calendar 同步在本地版暂不启用。</span>
          </div>
        ) : null}
        {error ? (
          <div className="page-alert" role="alert">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError("");
                setLoading(true);
                loadWorkspace()
                  .catch(() => setError("仍然无法读取数据。 "))
                  .finally(() => setLoading(false));
              }}
            >
              重试
            </button>
          </div>
        ) : null}

        <main id="workspace-main" className="workspace-main" tabIndex={-1}>
          {loading ? (
            <LoadingRegion />
          ) : snapshot ? (
            <>
              {activeView === "today" ? (
                <TodayView
                  snapshot={snapshot}
                  todayEvents={todayEvents}
                  todaySessions={todaySessions}
                  deadlines={deadlines}
                  semester={semester}
                  weekInfo={weekInfo}
                  todayKey={todayKey}
                  onNavigate={navigate}
                  onOpenCourse={(session) =>
                    openCourseEditor({}, { id: session.slotId, courseId: session.courseId })
                  }
                  onToggleTask={(task) =>
                    updateItem(
                      "task",
                      task.id,
                      { status: task.status === "done" ? "todo" : "done" },
                      task.status === "done" ? "任务已重新打开" : "任务已完成",
                    )
                  }
                  onOpenEditor={openEditor}
                  onEditTask={(task) =>
                    openTaskEditor(task, `today-task-${task.id}`)
                  }
                  onEditEvent={openEventEditor}
                  onDeleteTask={(task) =>
                    requestDelete({
                      entity: "task",
                      id: task.id,
                      title: task.title,
                      description: task.projectId
                        ? "该子目标将从所属项目中永久删除，且无法恢复。"
                        : "该任务将被永久删除，且无法恢复。",
                    })
                  }
                />
              ) : null}
              {activeView === "courses" ? (
                <TimetableView
                  snapshot={snapshot}
                  todayKey={todayKey}
                  onCreateAt={(weekday, period) =>
                    openCourseEditor({ weekday: String(weekday), startPeriod: String(period), endPeriod: String(period + 1) })
                  }
                  onEditSlot={(slotId, courseId) => openCourseEditor({}, { id: slotId, courseId })}
                  onCreateSemester={() => setActiveView("settings")}
                  onLoadDemo={loadDemoTimetable}
                  onSaveSemester={saveSemester}
                />
              ) : null}
              {activeView === "calendar" ? (
                <CalendarView
                  events={snapshot.events}
                  tasks={snapshot.tasks}
                  projects={snapshot.projects}
                  onCreate={(defaults) => openEditor("event", defaults)}
                  onCreateTask={() => openEditor("task")}
                  onEdit={openEventEditor}
                  onEditTask={openTaskEditor}
                  onToggleTask={(task) =>
                    updateItem(
                      "task",
                      task.id,
                      { status: "done" },
                      "任务已完成",
                    )
                  }
                  onArchive={(item) =>
                    setArchiveTarget({
                      entity: "event",
                      id: item.id,
                      title: item.title,
                    })
                  }
                  onDelete={(item) =>
                    requestDelete({
                      entity: "event",
                      id: item.id,
                      title: item.title,
                      description:
                        item.externalCalendarId && item.externalId
                          ? "该日程将同时从 Google Calendar 和知行台永久删除，且无法恢复。"
                          : "该日程将从知行台永久删除，且无法恢复。",
                    })
                  }
                  onDeleteTask={(task) =>
                    requestDelete({
                      entity: "task",
                      id: task.id,
                      title: task.title,
                      description: task.projectId
                        ? "该子目标将从所属项目中永久删除，且无法恢复。"
                        : "该任务将被永久删除，且无法恢复。",
                    })
                  }
                  googleStatus={googleStatus}
                  onSync={syncGoogle}
                  syncing={syncing}
                />
              ) : null}
              {activeView === "projects" ? (
                <ProjectsView
                  projects={snapshot.projects}
                  tasks={snapshot.tasks}
                  onCreate={() => openEditor("project")}
                  onEdit={openProjectEditor}
                  onCreateSubgoal={(projectId) =>
                    openEditor("task", {
                      projectId,
                      plannedDate: "",
                      dueDate: "",
                    })
                  }
                  onUpdate={updateItem}
                  onArchive={(item) =>
                    setArchiveTarget({
                      entity: "project",
                      id: item.id,
                      title: item.title,
                    })
                  }
                  onDelete={(item) => {
                    const childCount = snapshot.tasks.filter(
                      (task) => task.projectId === item.id,
                    ).length;
                    requestDelete({
                      entity: "project",
                      id: item.id,
                      title: item.title,
                      description: `该项目及其 ${childCount} 个子目标将被永久删除；关联的 Ideas 会保留并取消项目关联。此操作无法恢复。`,
                    });
                  }}
                  onDeleteTask={(task) =>
                    requestDelete({
                      entity: "task",
                      id: task.id,
                      title: task.title,
                      description: "该子目标将从所属项目中永久删除，且无法恢复。",
                    })
                  }
                />
              ) : null}
              {activeView === "learning" ? (
                <LearningView
                  domains={snapshot.domains}
                  logs={snapshot.learningLogs}
                  notes={snapshot.knowledgeNotes}
                  onCreateDomain={() => openEditor("domain")}
                  onEditDomain={openDomainEditor}
                  onCreateLog={() => openEditor("learningLog")}
                  onCreateNote={(defaults) =>
                    openEditor("knowledgeNote", defaults)
                  }
                  onEditNote={openKnowledgeNoteEditor}
                  onUpdate={updateItem}
                />
              ) : null}
              {activeView === "ideas" ? (
                <IdeasView
                  ideas={snapshot.ideas}
                  projects={snapshot.projects}
                  domains={snapshot.domains}
                  onCreate={() => openEditor("idea")}
                  onEdit={openIdeaEditor}
                  onUpdate={updateItem}
                  onArchive={(item) =>
                    setArchiveTarget({
                      entity: "idea",
                      id: item.id,
                      title: item.title,
                    })
                  }
                  onDelete={(item) =>
                    requestDelete({
                      entity: "idea",
                      id: item.id,
                      title: item.title,
                      description: `这条${item.type === "question" ? "疑问" : "Idea"}将被永久删除，且无法恢复。`,
                    })
                  }
                />
              ) : null}
              {activeView === "review" ? (
                <ReviewView snapshot={snapshot} />
              ) : null}
              {activeView === "settings" ? (
                <SettingsView
                  viewer={viewer}
                  profile={snapshot.profile}
                  settings={snapshot.settings}
                  semester={semester}
                  weekInfo={weekInfo}
                  googleStatus={googleStatus}
                  setGoogleStatus={setGoogleStatus}
                  onRefresh={loadGoogleStatus}
                  onSync={syncGoogle}
                  syncing={syncing}
                  notify={notify}
                  onSaveProfile={saveProfile}
                  onSaveSettings={saveSettings}
                  onSaveSemester={saveSemester}
                  onCreateSemester={createSemester}
                  onLoadDemo={loadDemoTimetable}
                  onReset={resetStore}
                />
              ) : null}
            </>
          ) : null}
        </main>
      </div>

      <nav className="mobile-nav" aria-label="移动端主要导航">
        {mobileNavigation.map((key) => {
          const item = navigation.find((entry) => entry.key === key);
          if (!item) return null;
          return (
            <button
              key={item.key}
              type="button"
              className={activeView === item.key ? "is-current" : ""}
              aria-current={activeView === item.key ? "page" : undefined}
              onClick={() => navigate(item.key)}
            >
              <span aria-hidden="true">{item.mark}</span>
              {item.label.replace("Ideas 与疑问", "Ideas")}
            </button>
          );
        })}
      </nav>

      {editor ? (
        <EditorDialog
          entity={editor}
          draft={draft}
          setDraft={setDraft}
          error={editorError}
          saving={saving}
          editing={Boolean(editorTargetId)}
          suspended={Boolean(deleteTarget)}
          snapshot={snapshot}
          onClose={() => {
            const returnFocusId = editorReturnFocusIdRef.current;
            editorReturnFocusIdRef.current = null;
            setEditor(null);
            setEditorTargetId(null);
            window.setTimeout(
              () =>
                (returnFocusId
                  ? document.getElementById(returnFocusId)
                  : quickAddRef.current)?.focus(),
              0,
            );
          }}
          onSubmit={createItem}
          onDelete={
            editorTargetId &&
            (editor === "event" ||
              editor === "project" ||
              editor === "domain" ||
              editor === "idea")
              ? () => {
                  if (editor === "event") {
                    const item = snapshot?.events.find(
                      (event) => event.id === editorTargetId,
                    );
                    if (item)
                      requestDelete({
                        entity: "event",
                        id: item.id,
                        title: item.title,
                        description:
                          item.externalCalendarId && item.externalId
                            ? "该日程将同时从 Google Calendar 和知行台永久删除，且无法恢复。"
                            : "该日程将从知行台永久删除，且无法恢复。",
                      });
                  } else if (editor === "project") {
                    const item = snapshot?.projects.find(
                      (project) => project.id === editorTargetId,
                    );
                    if (item) {
                      const childCount =
                        snapshot?.tasks.filter(
                          (task) => task.projectId === item.id,
                        ).length ?? 0;
                      requestDelete({
                        entity: "project",
                        id: item.id,
                        title: item.title,
                        description: `该项目及其 ${childCount} 个子目标将被永久删除；关联的 Ideas 会保留并取消项目关联。此操作无法恢复。`,
                      });
                    }
                  } else if (editor === "idea") {
                    const item = snapshot?.ideas.find(
                      (idea) => idea.id === editorTargetId,
                    );
                    if (item)
                      requestDelete({
                        entity: "idea",
                        id: item.id,
                        title: item.title,
                        description: `这条${item.type === "question" ? "疑问" : "Idea"}将被永久删除，且无法恢复。`,
                      });
                  } else {
                    const item = snapshot?.domains.find(
                      (domain) => domain.id === editorTargetId,
                    );
                    if (item) {
                      const knowledgeCount =
                        snapshot?.knowledgeNotes.filter(
                          (note) => note.domainId === item.id,
                        ).length ?? 0;
                      const logCount =
                        snapshot?.learningLogs.filter(
                          (log) => log.domainId === item.id,
                        ).length ?? 0;
                      requestDelete({
                        entity: "domain",
                        id: item.id,
                        title: item.title,
                        description: `该领域及其 ${knowledgeCount} 条认知与笔记、${logCount} 条学习记录将被永久删除；关联的任务与 Ideas 会保留并取消领域关联。此操作无法恢复。`,
                      });
                    }
                  }
                }
              : undefined
          }
        />
      ) : null}
      {courseEditor ? (
        <CourseDialog
          draft={courseEditor.draft}
          setDraft={(next) =>
            setCourseEditor((current) =>
              current ? { ...current, draft: next } : current,
            )
          }
          editing={Boolean(courseEditor.id)}
          error={courseError}
          saving={savingCourse}
          periods={periodTimesOf(snapshot?.settings)}
          semester={semester}
          courses={snapshot?.courses ?? []}
          onClose={() => setCourseEditor(null)}
          onSubmit={saveCourse}
          onDelete={
            courseEditor.id
              ? () => deleteCourseSlot(courseEditor.id as string)
              : undefined
          }
        />
      ) : null}
      {searchOpen ? (
        <SearchDialog
          snapshot={snapshot}
          query={searchQuery}
          setQuery={setSearchQuery}
          onClose={() => setSearchOpen(false)}
          onNavigate={(view) => {
            setSearchOpen(false);
            navigate(view);
          }}
        />
      ) : null}
      {archiveTarget ? (
        <ConfirmDialog
          title={`归档「${archiveTarget.title}」？`}
          description="归档后它会从当前视图隐藏，但不会永久删除。"
          confirmLabel="归档"
          saving={saving}
          onCancel={() => setArchiveTarget(null)}
          onConfirm={archiveItem}
        />
      ) : null}
      {deleteTarget ? (
        <ConfirmDialog
          tone="danger"
          mark="删"
          title={`永久删除「${deleteTarget.title}」？`}
          description={deleteTarget.description}
          confirmLabel="永久删除"
          savingLabel="正在删除…"
          error={deleteError}
          saving={saving}
          onCancel={() => {
            setDeleteError("");
            setDeleteTarget(null);
          }}
          onConfirm={deleteItem}
        />
      ) : null}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.tone}`}
            role={toast.tone === "error" ? "alert" : "status"}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              aria-label="关闭提示"
              onClick={() =>
                setToasts((items) =>
                  items.filter((item) => item.id !== toast.id),
                )
              }
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayView({
  snapshot,
  todayEvents,
  todaySessions,
  deadlines,
  semester,
  weekInfo,
  todayKey,
  onNavigate,
  onToggleTask,
  onOpenEditor,
  onEditTask,
  onEditEvent,
  onDeleteTask,
  onOpenCourse,
}: {
  snapshot: Snapshot;
  todayEvents: CalendarEvent[];
  todaySessions: CourseSession[];
  deadlines: Task[];
  semester: Semester | null;
  weekInfo: { week: number; inTerm: boolean } | null;
  todayKey: string;
  onNavigate: (view: ViewKey) => void;
  onToggleTask: (task: Task) => void;
  onOpenEditor: (entity: EntityName, defaults?: EditorDraft) => void;
  onEditTask: (task: Task) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteTask: (task: Task) => void;
  onOpenCourse: (session: CourseSession) => void;
}) {
  const now = useCurrentTime();
  const nowMinute = shanghaiClockMinutes(new Date(now));
  const todayTasks = snapshot.tasks.filter((task) =>
    taskAppearsInToday(task, todayKey),
  );
  const currentSession = todaySessions.find(
    (session) => session.startMinute <= nowMinute && nowMinute < session.endMinute,
  );
  const currentEvent = todayEvents.find(
    (item) =>
      new Date(item.startAt).getTime() <= now &&
      now < new Date(item.endAt).getTime(),
  );
  const currentTask = snapshot.tasks.find(
    (task) =>
      task.status !== "done" &&
      task.startAt &&
      task.endAt &&
      new Date(task.startAt).getTime() <= now &&
      now < new Date(task.endAt).getTime(),
  );
  const currentSlot = currentSession
    ? {
        title: currentSession.title,
        time: `${currentSession.start}—${currentSession.end}`,
        detail: `课程 · ${currentSession.periods}${currentSession.location ? ` · ${currentSession.location}` : ""}`,
        kind: "course" as const,
      }
    : currentEvent
      ? {
          title: currentEvent.title,
          time: `${formatTime(currentEvent.startAt)}—${formatTime(currentEvent.endAt)}`,
          detail: "日程",
          kind: "event" as const,
        }
      : currentTask?.startAt && currentTask.endAt
        ? {
            title: currentTask.title,
            time: `${formatTime(currentTask.startAt)}—${formatTime(currentTask.endAt)}`,
            detail: currentTask.projectId ? "项目子目标" : "计划任务",
            kind: "task" as const,
          }
        : null;
  const weekLabel = semester
    ? weekInfo?.inTerm
      ? `第 ${weekInfo.week} 周 / 共 ${semester.weekCount} 周`
      : "不在教学周内"
    : "还没有学期";
  return (
    <div className="today-page page-enter">
      <section className="today-overview" aria-label="今日总览">
        <div className="today-overview-intro">
          <div>
            <p className="eyebrow">{weekLabel} · TODAY</p>
            <h2>今日总览</h2>
          </div>
          <span className="today-overview-mark" aria-hidden="true">旦</span>
        </div>
        <div className="today-metrics">
          {[
            { label: "今日课程", value: todaySessions.length, note: "门课程" },
            { label: "今日行动", value: todayTasks.filter((task) => task.status !== "done").length, note: "项待办" },
            { label: "本周 DDL", value: deadlines.length, note: "个截止" },
            { label: "推进项目", value: snapshot.projects.length, note: "个进行中" },
          ].map((metric) => (
            <div className="today-metric" key={metric.label}>
              <span className="today-metric-value">{String(metric.value).padStart(2, "0")}</span>
              <span className="today-metric-label">{metric.label}</span>
              <span className="today-metric-note">{metric.note}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="today-layout">
      <section className="today-primary">
        <div className={`current-slot-card ${currentSlot ? "is-active" : ""}`}>
          <div className="current-slot-accent" aria-hidden="true" />
          <div>
            <p className="eyebrow">当前时段 · NOW</p>
            <h2>{currentSlot?.title ?? "当前时段暂无安排"}</h2>
            <p>
              {currentSlot
                ? `${currentSlot.time} · ${currentSlot.detail}`
                : "查看下方时间轨，或为当前时段添加一项安排。"}
            </p>
          </div>
          <button
            className="button button--outline"
            type="button"
            onClick={() =>
              currentSlot
                ? onNavigate(currentSlot.kind === "course" ? "courses" : "calendar")
                : onOpenEditor("event")
            }
          >
            {currentSlot
              ? currentSlot.kind === "course"
                ? "查看课表"
                : "查看日程"
              : "安排当前时段"}
          </button>
        </div>
        <section className="panel today-courses" aria-label="今日课程">
          <div className="today-courses-head">
            <div>
              <p className="eyebrow">TIMETABLE</p>
              <h2>今日课程</h2>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate("courses")}
            >
              完整课表
            </button>
          </div>
          {todaySessions.length ? (
            <div className="today-course-strip" role="list">
              {todaySessions.map((session) => (
                <button
                  key={session.slotId}
                  className="today-course"
                  type="button"
                  role="listitem"
                  style={{ "--course-color": session.color } as CSSProperties}
                  onClick={() => onOpenCourse(session)}
                >
                  <span className="today-course-time">
                    {session.start}—{session.end}
                  </span>
                  <strong>{session.title}</strong>
                  <span className="today-course-meta">
                    {session.periods}
                    {session.location ? ` · ${session.location}` : ""}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="today-courses-empty">
              {semester
                ? weekInfo?.inTerm
                  ? "今天没有课。"
                  : "现在不在教学周内，课表按周次显示。"
                : "还没有课表。先创建学期，再把课程加进来。"}
              <button
                className="text-button"
                type="button"
                onClick={() => onNavigate("courses")}
              >
                {semester ? "打开课表" : "创建课表"}
              </button>
            </p>
          )}
        </section>
        <Timeline
          events={todayEvents}
          sessions={todaySessions}
          now={now}
          dateKey={todayKey}
          onCreateAt={(defaults) => onOpenEditor("event", defaults)}
          onEditEvent={onEditEvent}
          onOpenCourse={onOpenCourse}
        />
      </section>
      <aside className="context-column">
        <section className="panel compact-panel context-panel context-panel--tasks">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">TODAY</p>
              <h2>今日行动</h2>
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => onOpenEditor("task")}
            >
              添加任务
            </button>
          </div>
          <div
            className="task-list scroll-region"
            tabIndex={todayTasks.length ? 0 : undefined}
            aria-label={`今日行动，共 ${todayTasks.length} 项`}
          >
            {todayTasks.length ? (
              todayTasks.map((task) => (
                <div key={task.id} className="task-row">
                  <input
                    type="checkbox"
                    aria-label={`${task.status === "done" ? "重新打开" : "完成"} ${task.title}`}
                    checked={task.status === "done"}
                    onChange={() => onToggleTask(task)}
                  />
                  <button
                    id={`today-task-${task.id}`}
                    className="task-row-open"
                    type="button"
                    aria-label={`编辑任务「${task.title}」和 DDL`}
                    title="编辑任务与 DDL"
                    onClick={() => onEditTask(task)}
                  >
                    <span
                      className={`task-row-title${task.status === "done" ? " is-done" : ""}`}
                    >
                      {task.title}
                    </span>
                    {task.dueDate ? (
                      <time dateTime={task.dueDate}>
                        DDL {formatShortDate(task.dueDate)}
                      </time>
                    ) : (
                      <span className="task-row-due is-empty">设置 DDL</span>
                    )}
                    <span className="task-row-open-mark" aria-hidden="true">
                      ›
                    </span>
                  </button>
                  <button
                    className="row-action row-action--delete"
                    type="button"
                    aria-label={`删除${task.projectId ? "子目标" : "任务"} ${task.title}`}
                    title="删除"
                    onClick={() => onDeleteTask(task)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <EmptyState
                title="今天还没有任务"
                description="先添加一个具体、可完成的行动。"
                action="添加任务"
                onAction={() => onOpenEditor("task")}
              />
            )}
          </div>
        </section>
        <section className="panel compact-panel context-panel context-panel--ddl">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DEADLINE</p>
              <h2>临近 DDL</h2>
            </div>
            <span>未来 7 天</span>
          </div>
          {deadlines.length ? (
            <ul className="deadline-list" aria-label={`临近 DDL，共 ${deadlines.length} 项`}>
              {deadlines.slice(0, 6).map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="deadline-row"
                    onClick={() => onEditTask(task)}
                    aria-label={`编辑任务 ${task.title}`}
                  >
                    <span className={`deadline-day ${deadlineTone(task.dueDate as string)}`}>
                      {formatShortDate(task.dueDate as string)}
                    </span>
                    <strong>{task.title}</strong>
                    <small>{deadlineDistanceLabel(task.dueDate as string)}</small>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="deadline-empty">未来 7 天没有 DDL。</p>
          )}
        </section>
        <section className="panel compact-panel context-panel context-panel--projects">
          <div className="panel-heading">
            <h2>推进中的项目</h2>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate("projects")}
            >
              项目看板
            </button>
          </div>
          <div
            className="project-list scroll-region"
            tabIndex={snapshot.projects.length ? 0 : undefined}
            aria-label={`推进中的项目，共 ${snapshot.projects.length} 项`}
          >
            {snapshot.projects.map((project) => (
              <ProjectSummaryItem
                key={project.id}
                project={project}
                tasks={snapshot.tasks}
              />
            ))}
          </div>
        </section>
        <section className="panel compact-panel context-panel context-panel--learning">
          <div className="panel-heading">
            <h2>领域学习</h2>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate("learning")}
            >
              认知档案
            </button>
          </div>
          <div className="domain-mini-grid">
            {snapshot.domains.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => onNavigate("learning")}
              >
                <strong>{domain.title}</strong>
                <span>{stageLabels[domain.stage - 1]}</span>
                <StageMeter stage={domain.stage} />
              </button>
            ))}
          </div>
        </section>
        <section className="panel compact-panel context-panel context-panel--questions question-panel">
          <div className="panel-heading">
            <h2>待探索的问题</h2>
            <button
              className="text-button"
              type="button"
              onClick={() => onNavigate("ideas")}
            >
              查看全部
            </button>
          </div>
          <button
            className="question-entry"
            type="button"
            onClick={() => onNavigate("ideas")}
          >
            <span className="question-entry-mark" aria-hidden="true">
              问
            </span>
            <span className="question-entry-copy">
              <small>正在探索</small>
              <strong>
                {snapshot.ideas.find(
                  (idea) =>
                    idea.type === "question" && idea.status !== "resolved",
                )?.title ?? "记录一个仍未解决的问题"}
              </strong>
            </span>
            <span className="question-entry-arrow" aria-hidden="true">
              →
            </span>
          </button>
        </section>
      </aside>
      </div>
    </div>
  );
}

function ProjectSummaryItem({
  project,
  tasks,
}: {
  project: Project;
  tasks: Task[];
}) {
  const subgoals = tasks.filter((task) => task.projectId === project.id);
  const completed = subgoals.filter((task) => task.status === "done").length;
  const nextSubgoal = subgoals.find((task) => task.status !== "done");
  return (
    <div className="project-summary-item">
      <div>
        <strong>{project.title}</strong>
        <span>
          {completed}/{subgoals.length} 完成
        </span>
      </div>
      <p>
        {nextSubgoal
          ? `下一项 · ${nextSubgoal.title}`
          : subgoals.length
            ? "所有子目标已完成"
            : "还没有子目标"}
      </p>
    </div>
  );
}

function Timeline({
  events,
  sessions,
  now,
  dateKey,
  onCreateAt,
  onEditEvent,
  onOpenCourse,
}: {
  events: CalendarEvent[];
  sessions: CourseSession[];
  now: number;
  dateKey: string;
  onCreateAt: (defaults: EditorDraft) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onOpenCourse: (session: CourseSession) => void;
}) {
  const hours = Array.from({ length: 17 }, (_, index) => index + 8);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentPosition = nowPosition(now);

  useEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;
    const minute = Math.max(
      8 * 60,
      Math.min(24 * 60, shanghaiClockMinutes(new Date())),
    );
    const ratio = (minute - 8 * 60) / (16 * 60);
    scrollArea.scrollTop = Math.max(
      0,
      ratio * scrollArea.scrollHeight - scrollArea.clientHeight * 0.34,
    );
  }, []);

  function createFromRail(event: ReactMouseEvent<HTMLButtonElement>) {
    const currentMinute = shanghaiClockMinutes(new Date(now));
    const minute =
      event.detail === 0
        ? Math.ceil(currentMinute / 15) * 15
        : 8 * 60 +
          Math.round(
            ((event.clientY - event.currentTarget.getBoundingClientRect().top) /
              event.currentTarget.getBoundingClientRect().height) *
              64,
          ) *
            15;
    onCreateAt(eventDraft(dateKey, minute));
  }

  return (
    <section className="panel timeline-panel" aria-labelledby="timeline-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">TIME RAIL</p>
          <h2 id="timeline-title">今天的时间</h2>
        </div>
        <div className="timeline-heading-meta">
          <span>08:00—24:00 · Asia / Shanghai</span>
          <small>点击空白时间快速添加</small>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="timeline-scroll"
        tabIndex={0}
        aria-label="今日时间轨，早上八点至晚上十二点"
      >
        <div
          className="timeline"
          style={{ "--timeline-hours": hours.length - 1 } as CSSProperties}
        >
          <button
            className="timeline-create-layer"
            type="button"
            aria-label="在时间轨选择时间并新建日程"
            onClick={createFromRail}
          />
          {hours.map((hour) => (
            <div
              className="timeline-hour"
              key={hour}
              style={{ "--hour-index": hour - 8 } as CSSProperties}
            >
              <time>{String(hour).padStart(2, "0")}:00</time>
              <span />
            </div>
          ))}
          {currentPosition ? (
            <div
              className="now-line"
              style={{ "--now-position": currentPosition } as CSSProperties}
            >
              <span>现在</span>
            </div>
          ) : null}
          {sessions.map((session) => {
            const geometry = blockGeometryFromMinutes(
              session.startMinute,
              session.endMinute,
            );
            const minutesNow = shanghaiClockMinutes(new Date(now));
            const isCurrent =
              session.startMinute <= minutesNow && minutesNow < session.endMinute;
            return (
              <button
                type="button"
                key={session.slotId}
                className={`timeline-event timeline-course ${isCurrent ? "is-current" : ""}`}
                style={
                  {
                    "--event-top": geometry.top,
                    "--event-height": geometry.height,
                    "--event-color": session.color,
                  } as CSSProperties
                }
                aria-label={`编辑课程 ${session.title}，${session.start} 至 ${session.end}`}
                onClick={() => onOpenCourse(session)}
              >
                <div>
                  <strong>{session.title}</strong>
                  <span>
                    课程
                    {session.location ? ` · ${session.location}` : ""}
                  </span>
                </div>
                <time>
                  {session.start}—{session.end}
                </time>
              </button>
            );
          })}
          {events.map((event) => {
            const geometry = eventGeometry(event);
            const isCurrent =
              new Date(event.startAt).getTime() <= now &&
              now < new Date(event.endAt).getTime();
            return (
              <button
                type="button"
                key={event.id}
                className={`timeline-event ${isCurrent ? "is-current" : ""}`}
                style={
                  {
                    "--event-top": geometry.top,
                    "--event-height": geometry.height,
                    "--event-color": event.color,
                  } as CSSProperties
                }
                aria-label={`编辑日程 ${event.title}，${formatTime(event.startAt)} 至 ${formatTime(event.endAt)}`}
                onClick={() => onEditEvent(event)}
              >
                <div>
                  <strong>{event.title}</strong>
                  <span>
                    {event.source === "google"
                      ? "Google Calendar"
                      : "站内日程"}
                  </span>
                </div>
                <time>
                  {formatTime(event.startAt)}—{formatTime(event.endAt)}
                </time>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TimetableView({
  snapshot,
  todayKey,
  onCreateAt,
  onEditSlot,
  onCreateSemester,
  onLoadDemo,
  onSaveSemester,
}: {
  snapshot: Snapshot;
  todayKey: string;
  onCreateAt: (weekday: number, period: number) => void;
  onEditSlot: (slotId: string, courseId: string) => void;
  onCreateSemester: () => void;
  onLoadDemo: () => void;
  onSaveSemester: (semester: Semester, patch: Record<string, unknown>) => void;
}) {
  const semester = activeSemesterOf(snapshot);
  const periods = periodTimesOf(snapshot.settings);
  const [weekOffset, setWeekOffset] = useState(0);
  const current = semester ? semesterWeekAt(semester, todayKey) : null;
  const baseWeek = semester
    ? Math.min(Math.max(current?.week ?? 1, 1), semester.weekCount)
    : 1;
  const week = semester
    ? Math.min(Math.max(baseWeek + weekOffset, 1), semester.weekCount)
    : 1;
  const mondayKey = semester
    ? addDaysToKey(semester.startDate, (week - 1) * 7)
    : todayKey;
  const days = Array.from({ length: 7 }, (_, index) => {
    const key = addDaysToKey(mondayKey, index);
    return { key, isToday: key === todayKey, day: Number(key.slice(-2)) };
  });
  const semesterCourses = snapshot.courses.filter(
    (course) => course.semesterId === semester?.id,
  );
  const courseById = new Map(semesterCourses.map((course) => [course.id, course]));
  const slotsByDay = days.map((_, index) =>
    layoutTimetableDay(
      snapshot.courseSlots
        .filter(
          (slot) =>
            slot.weekday === index + 1 &&
            slot.weeks.includes(week) &&
            courseById.has(slot.courseId),
        )
        .map((slot) => ({ ...slot, course: courseById.get(slot.courseId) as Course })),
    ),
  );

  if (!semester) {
    return (
      <div className="page-stack page-enter">
        <section className="page-intro page-intro--calendar">
          <div>
            <p className="eyebrow">TIMETABLE</p>
            <h2>先把这一学期立起来</h2>
            <p>
              课表按「学期开始日期 + 周次」排布，之后每周自动滚动。先在设置里创建学期，或者先载入一份示例课表看看效果。
            </p>
          </div>
        </section>
        <section className="panel tt-empty">
          <p className="eyebrow">NO SEMESTER YET</p>
          <h3>还没有学期</h3>
          <p>一个学期只需要两件事：第一周的周一，以及总周数（默认 16 周）。</p>
          <div className="tt-empty-actions">
            <button className="button button--primary" type="button" onClick={onCreateSemester}>
              去设置创建学期
            </button>
            <button className="button button--outline" type="button" onClick={onLoadDemo}>
              载入示例课表
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack page-enter">
      <section className="page-intro page-intro--calendar tt-intro">
        <div>
          <p className="eyebrow">TIMETABLE · {semester.name}</p>
          <h2>
            第 {week} 周
            <span className="tt-week-parity">{week % 2 === 1 ? "单周" : "双周"}</span>
          </h2>
          <p>
            {formatShortDate(days[0].key)} — {formatShortDate(days[6].key)} · 共 {semester.weekCount} 周
            {current && !current.inTerm ? " · 现在不在教学周内" : ""}
          </p>
        </div>
        <div className="intro-actions tt-actions">
          <button
            className="button button--outline"
            type="button"
            aria-label="上一周"
            onClick={() => setWeekOffset((value) => value - 1)}
            disabled={weekOffset + baseWeek <= 1}
          >
            ‹
          </button>
          <button
            className="button button--outline"
            type="button"
            onClick={() => setWeekOffset(0)}
          >
            本周
          </button>
          <button
            className="button button--outline"
            type="button"
            aria-label="下一周"
            onClick={() => setWeekOffset((value) => value + 1)}
            disabled={weekOffset + baseWeek >= semester.weekCount}
          >
            ›
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={() => onCreateAt(isoWeekdayOf(todayKey), 1)}
          >
            ＋ 添加课程
          </button>
        </div>
      </section>

      <div className="tt-scroll">
        <div className="tt-grid" style={{ "--tt-rows": periods.length } as CSSProperties}>
          <div className="tt-corner" aria-hidden="true">
            节次
          </div>
          {days.map((day, index) => (
            <div className={`tt-head ${day.isToday ? "is-today" : ""}`} key={day.key}>
              <strong>周{weekdayLabels[index]}</strong>
              <small>{day.day}</small>
            </div>
          ))}
          <div className="tt-times">
            {periods.map((period) => (
              <div className="tt-time" key={period.index}>
                <b>{period.index}</b>
                <span>{period.start}</span>
              </div>
            ))}
          </div>
          {days.map((day, index) => (
            <div
              className={`tt-col ${day.isToday ? "is-today" : ""}`}
              key={day.key}
            >
              {periods.map((period) => (
                <button
                  className="tt-cell"
                  type="button"
                  key={period.index}
                  aria-label={`在周${weekdayLabels[index]}第 ${period.index} 节添加课程`}
                  onClick={() => onCreateAt(index + 1, period.index)}
                />
              ))}
              {slotsByDay[index].map(({ slot, lane, laneCount }) => (
                <button
                  className="tt-course"
                  type="button"
                  key={slot.id}
                  style={
                    {
                      "--course-color": slot.course.color,
                      top: `${((slot.startPeriod - 1) / periods.length) * 100}%`,
                      height: `${((slot.endPeriod - slot.startPeriod + 1) / periods.length) * 100}%`,
                      left: `${(lane / laneCount) * 100}%`,
                      width: `${100 / laneCount}%`,
                    } as CSSProperties
                  }
                  aria-label={`编辑课程 ${slot.course.name}，${courseWeekLabel(slot)}`}
                  onClick={() => onEditSlot(slot.id, slot.courseId)}
                >
                  <strong>{slot.course.name}</strong>
                  {slot.location ? <span>{slot.location}</span> : null}
                  <small>
                    {slot.startPeriod === slot.endPeriod
                      ? `第 ${slot.startPeriod} 节`
                      : `第 ${slot.startPeriod}–${slot.endPeriod} 节`}
                  </small>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section className="panel tt-course-list" aria-label="本学期课程">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">COURSES</p>
            <h2>本学期课程</h2>
          </div>
          <span>{semesterCourses.length} 门</span>
        </div>
        <ul>
          {semesterCourses.map((course) => {
            const slots = snapshot.courseSlots.filter((slot) => slot.courseId === course.id);
            const first = slots[0];
            return (
              <li key={course.id}>
                <button
                  type="button"
                  className="tt-course-row"
                  disabled={!first}
                  onClick={() => first && onEditSlot(first.id, course.id)}
                >
                  <span
                    className="tt-course-dot"
                    style={{ background: course.color }}
                    aria-hidden="true"
                  />
                  <strong>{course.name}</strong>
                  <span className="tt-course-teacher">{course.teacher || "未填教师"}</span>
                  <span className="tt-course-when">
                    {slots.length
                      ? slots
                          .map(
                            (slot) =>
                              `周${weekdayLabels[slot.weekday - 1]} ${slot.startPeriod}${
                                slot.endPeriod > slot.startPeriod ? `-${slot.endPeriod}` : ""
                              } 节`,
                          )
                          .join("、")
                      : "没有时间"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="tt-course-foot">
          <label className="tt-inline-field">
            <span>学期开始（周一）</span>
            <input
              type="date"
              value={semester.startDate}
              onChange={(event) =>
                onSaveSemester(semester, { startDate: event.target.value })
              }
            />
          </label>
          <label className="tt-inline-field">
            <span>总周数</span>
            <input
              type="number"
              min={1}
              max={30}
              value={semester.weekCount}
              onChange={(event) =>
                onSaveSemester(semester, { weekCount: Number(event.target.value) })
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}

const COURSE_COLORS = [
  "#0d2f5a",
  "#167f78",
  "#5267c7",
  "#2d6b5f",
  "#9d7d46",
  "#b64949",
  "#3449a4",
  "#a07d3e",
];

function CourseDialog({
  draft,
  setDraft,
  editing,
  error,
  saving,
  periods,
  semester,
  courses,
  onClose,
  onSubmit,
  onDelete,
}: {
  draft: EditorDraft;
  setDraft: (draft: EditorDraft) => void;
  editing: boolean;
  error: string;
  saving: boolean;
  periods: CoursePeriod[];
  semester: Semester | null;
  courses: Course[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, titleRef, onClose);
  const startPeriod = Number(draft.startPeriod) || 1;
  const endPeriod = Math.max(startPeriod, Number(draft.endPeriod) || startPeriod);
  const weekCount = semester?.weekCount ?? 16;
  const previewPeriod = periods[startPeriod - 1];
  const previewEnd = periods[endPeriod - 1];
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="editor-dialog course-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-dialog-title"
      >
        <header>
          <div>
            <p className="eyebrow">TIMETABLE</p>
            <h2 id="course-dialog-title">{editing ? "编辑这节课" : "添加一节课"}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="关闭课程编辑器"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </header>
        <form noValidate onSubmit={onSubmit}>
          <div className="field-group">
            <label htmlFor="course-name">课程名称</label>
            <input
              id="course-name"
              ref={titleRef}
              value={draft.courseName ?? ""}
              onChange={(event) => setDraft({ ...draft, courseName: event.target.value })}
              placeholder="例如：高等数学 A"
              list="course-name-options"
              aria-invalid={Boolean(error && !draft.courseName?.trim())}
            />
            <datalist id="course-name-options">
              {courses.map((course) => (
                <option value={course.name} key={course.id} />
              ))}
            </datalist>
            {error ? (
              <span className="field-error" role="alert">
                {error}
              </span>
            ) : null}
          </div>
          <div className="field-row">
            <div className="field-group">
              <label htmlFor="course-teacher">教师</label>
              <input
                id="course-teacher"
                value={draft.teacher ?? ""}
                onChange={(event) => setDraft({ ...draft, teacher: event.target.value })}
                placeholder="可选"
              />
            </div>
            <div className="field-group">
              <label htmlFor="course-location">教室</label>
              <input
                id="course-location"
                value={draft.location ?? ""}
                onChange={(event) => setDraft({ ...draft, location: event.target.value })}
                placeholder="例如：光华楼西辅楼 305"
              />
            </div>
          </div>
          <div className="field-row field-row--three">
            <div className="field-group">
              <label htmlFor="course-weekday">星期</label>
              <select
                id="course-weekday"
                value={draft.weekday ?? "1"}
                onChange={(event) => setDraft({ ...draft, weekday: event.target.value })}
              >
                {weekdayLabels.map((label, index) => (
                  <option value={index + 1} key={label}>
                    周{label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="course-start">开始节次</label>
              <select
                id="course-start"
                value={String(startPeriod)}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    startPeriod: event.target.value,
                    endPeriod: String(
                      Math.max(Number(event.target.value), endPeriod),
                    ),
                  })
                }
              >
                {periods.map((period) => (
                  <option value={period.index} key={period.index}>
                    第 {period.index} 节
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="course-end">结束节次</label>
              <select
                id="course-end"
                value={String(endPeriod)}
                onChange={(event) => setDraft({ ...draft, endPeriod: event.target.value })}
              >
                {periods
                  .filter((period) => period.index >= startPeriod)
                  .map((period) => (
                    <option value={period.index} key={period.index}>
                      第 {period.index} 节
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="field-group">
            <label htmlFor="course-weeks">
              上课周次
              <span>
                留空表示 1–{weekCount} 周；也可以写 1-8、1-16单、2,4,6
              </span>
            </label>
            <input
              id="course-weeks"
              value={draft.weeks ?? ""}
              onChange={(event) => setDraft({ ...draft, weeks: event.target.value })}
              placeholder={`1-${weekCount}`}
            />
          </div>
          <div className="field-group">
            <label>颜色</label>
            <div className="course-color-row">
              {COURSE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`course-color-swatch ${
                    (draft.color ?? "#0d2f5a") === color ? "is-selected" : ""
                  }`}
                  style={{ background: color }}
                  aria-label={`选择颜色 ${color}`}
                  aria-pressed={(draft.color ?? "#0d2f5a") === color}
                  onClick={() => setDraft({ ...draft, color })}
                />
              ))}
            </div>
          </div>
          <p className="course-dialog-hint">
            {previewPeriod && previewEnd
              ? `这节课会出现在课表上：${previewPeriod.start}—${previewEnd.end}`
              : "这节课还没有时间。"}
          </p>
          <footer>
            {onDelete ? (
              <button
                className="button button--outline editor-delete-action"
                type="button"
                onClick={onDelete}
                disabled={saving}
              >
                删除
              </button>
            ) : null}
            <button className="button button--outline" type="button" onClick={onClose} disabled={saving}>
              取消
            </button>
            <button className="button button--primary" type="submit" disabled={saving}>
              {saving ? "正在保存…" : editing ? "保存更改" : "加入课表"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function ReminderPanel({
  sessions,
  deadlines,
  weekLabel,
  reminders,
  onClose,
  onOpenWeek,
  onEditTask,
  onRequestPermission,
}: {
  sessions: CourseSession[];
  deadlines: Task[];
  weekLabel: string;
  reminders?: ReminderSettings;
  onClose: () => void;
  onOpenWeek: () => void;
  onEditTask: (task: Task) => void;
  onRequestPermission: () => void;
}) {
  return (
    <div className="reminder-panel" role="dialog" aria-label="提醒">
      <header>
        <div>
          <p className="eyebrow">REMINDERS</p>
          <h3>{weekLabel} · 今日</h3>
        </div>
        <button className="icon-button" type="button" aria-label="关闭提醒" onClick={onClose}>
          ×
        </button>
      </header>
      <section>
        <h4>今日课程</h4>
        {sessions.length ? (
          <ul>
            {sessions.map((session) => (
              <li key={session.slotId}>
                <time>{session.start}</time>
                <strong>{session.title}</strong>
                <small>{session.location || session.periods}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="reminder-empty">今天没有课。</p>
        )}
      </section>
      <section>
        <h4>未来 7 天 DDL</h4>
        {deadlines.length ? (
          <ul>
            {deadlines.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEditTask(task);
                  }}
                >
                  <time>{formatShortDate(task.dueDate as string)}</time>
                  <strong>{task.title}</strong>
                  <small className={deadlineTone(task.dueDate as string)}>
                    {deadlineDistanceLabel(task.dueDate as string)}
                  </small>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="reminder-empty">没有临近截止。</p>
        )}
      </section>
      <footer>
        <button className="button button--outline" type="button" onClick={onOpenWeek}>
          打开课表
        </button>
        <button
          className="button button--ghost"
          type="button"
          onClick={onRequestPermission}
          disabled={!reminders?.enabled}
        >
          {reminders?.enabled ? "开启系统通知" : "提醒已关闭"}
        </button>
      </footer>
      <p className="reminder-note">
        提醒在知行台打开时生效；系统通知需要浏览器授权，且只在页面运行时触发。
      </p>
    </div>
  );
}

const REMINDER_STATE_KEY = "dsh-workflow-reminder-state";

function readReminderState(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(REMINDER_STATE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
function writeReminderState(state: Record<string, number>) {
  try {
    const entries = Object.entries(state)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 300);
    window.localStorage.setItem(REMINDER_STATE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* localStorage may be unavailable; reminders still show in-page. */
  }
}
function notifyDesktop(title: string, body: string) {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, tag: `${title}:${body}` });
  } catch {
    /* Some browsers require a service worker; skip silently. */
  }
}

/** In-page digest + DDL reminders, plus a desktop notification when allowed. */
function useReminderEngine({
  snapshot,
  todayKey,
  todaySessions,
  deadlines,
  weekInfo,
  notify,
}: {
  snapshot: Snapshot | null;
  todayKey: string;
  todaySessions: CourseSession[];
  deadlines: Task[];
  semester: Semester | null;
  weekInfo: { week: number; inTerm: boolean } | null;
  notify: (message: string, tone?: Toast["tone"]) => void;
}) {
  const now = useCurrentTime();
  useEffect(() => {
    const reminders = snapshot?.settings?.reminders;
    if (!snapshot || !reminders?.enabled) return;
    const state = readReminderState();
    let changed = false;
    const minuteNow = shanghaiClockMinutes(new Date(now));
    const fire = (key: string, title: string, body: string) => {
      if (state[key]) return;
      state[key] = Date.now();
      changed = true;
      notify(`${title}：${body}`, "info");
      notifyDesktop(title, body);
    };
    if (reminders.dailyDigest && minuteNow >= clockMinutesOf(reminders.digestTime || "08:00")) {
      const dueToday = deadlines.filter((task) => task.dueDate === todayKey).length;
      fire(
        `digest:${todayKey}`,
        "今日摘要",
        `${todaySessions.length} 节课 · ${dueToday} 个今天到期${
          weekInfo?.inTerm ? ` · 第 ${weekInfo.week} 周` : ""
        }`,
      );
    }
    for (const task of deadlines) {
      if (!task.dueDate) continue;
      const hours = hoursUntilDate(task.dueDate, now);
      if (hours <= 0) continue;
      const leads = [...(reminders.leadHours ?? [])].sort((left, right) => right - left);
      for (const lead of leads) {
        if (hours > lead) continue;
        fire(
          `ddl:${task.id}:${lead}:${task.dueDate}`,
          "DDL 提醒",
          `「${task.title}」${hours < 1 ? "不到 1 小时" : `约 ${Math.round(hours)} 小时`}后到期`,
        );
      }
    }
    if (changed) writeReminderState(state);
  }, [now, snapshot, todayKey, todaySessions, deadlines, weekInfo, notify]);
}

function deadlineDistanceLabel(dueDate: string) {
  const hours = hoursUntilDate(dueDate, Date.now());
  if (hours <= 0) return "已过期";
  if (hours < 12) return `剩 ${Math.max(1, Math.round(hours))} 小时`;
  const days = Math.ceil(hours / 24);
  return days <= 1 ? "今天截止" : `还有 ${days} 天`;
}
function deadlineTone(dueDate: string) {
  const hours = hoursUntilDate(dueDate, Date.now());
  return hours < 24 ? "is-urgent" : hours < 72 ? "is-soon" : "is-calm";
}

function CalendarView({
  events,
  tasks,
  projects,
  onCreate,
  onCreateTask,
  onEdit,
  onEditTask,
  onToggleTask,
  onArchive,
  onDelete,
  onDeleteTask,
  googleStatus,
  onSync,
  syncing,
}: {
  events: CalendarEvent[];
  tasks: Task[];
  projects: Project[];
  onCreate: (defaults?: EditorDraft) => void;
  onCreateTask: () => void;
  onEdit: (event: CalendarEvent) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task) => void;
  onArchive: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onDeleteTask: (task: Task) => void;
  googleStatus: GoogleStatus | null;
  onSync: () => void;
  syncing: boolean;
}) {
  const [mode, setMode] = useState<"week" | "month" | "agenda">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const days = useMemo(() => {
    const anchor = new Date();
    anchor.setDate(anchor.getDate() + weekOffset * 7);
    return weekDays(anchor);
  }, [weekOffset]);
  const relativeWeek = weekOffset === 0
    ? "本周"
    : weekOffset === -1
      ? "上周"
      : weekOffset === 1
        ? "下周"
        : `${Math.abs(weekOffset)} 周${weekOffset > 0 ? "后" : "前"}`;
  const weekLabel = `${relativeWeek} · ${formatShortDate(days[0].key)}—${formatShortDate(days[6].key)}`;
  return (
    <div className="page-stack page-enter">
      <section className="page-intro page-intro--calendar">
        <div>
          <p className="eyebrow">CALENDAR</p>
          <h2>把承诺放进时间，而不是留在列表里</h2>
          <p>日程记录几点到几点；任务记录行动日期与 DDL。站内日程保存在本机；Google Calendar 同步在本地版暂不启用。</p>
        </div>
        <div className="intro-actions">
          <div className="segmented" role="group" aria-label="日历视图">
            {(["week", "month", "agenda"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={mode === item}
                onClick={() => setMode(item)}
              >
                {item === "week" ? "周" : item === "month" ? "月" : "议程"}
              </button>
            ))}
          </div>
          {googleStatus?.configured ? (
            <button
              className="button button--outline"
              type="button"
              onClick={onSync}
              disabled={!googleStatus?.connected || syncing}
            >
              {syncing ? "同步中…" : "同步日历"}
            </button>
          ) : null}
          <div className="calendar-create-actions" role="group" aria-label="新建内容">
            <button
              className="button button--outline"
              type="button"
              onClick={onCreateTask}
            >
              ＋ 新建任务
            </button>
            <button
              className="button button--primary"
              type="button"
              onClick={() => onCreate()}
            >
              ＋ 新建日程
            </button>
          </div>
        </div>
      </section>
      {mode === "week" ? (
        <WeekCalendar
          days={days}
          events={events}
          weekLabel={weekLabel}
          weekOffset={weekOffset}
          onPreviousWeek={() => setWeekOffset((value) => value - 1)}
          onNextWeek={() => setWeekOffset((value) => value + 1)}
          onCurrentWeek={() => setWeekOffset(0)}
          onCreate={onCreate}
          onEdit={onEdit}
        />
      ) : (
        <AgendaList
          events={events}
          tasks={tasks}
          projects={projects}
          onEdit={onEdit}
          onEditTask={onEditTask}
          onToggleTask={onToggleTask}
          onArchive={onArchive}
          onDelete={onDelete}
          onDeleteTask={onDeleteTask}
        />
      )}
    </div>
  );
}

function WeekCalendar({
  days,
  events,
  weekLabel,
  weekOffset,
  onPreviousWeek,
  onNextWeek,
  onCurrentWeek,
  onCreate,
  onEdit,
}: {
  days: ReturnType<typeof weekDays>;
  events: CalendarEvent[];
  weekLabel: string;
  weekOffset: number;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onCurrentWeek: () => void;
  onCreate: (defaults?: EditorDraft) => void;
  onEdit: (event: CalendarEvent) => void;
}) {
  const hours = Array.from({ length: 17 }, (_, index) => index + 8);
  const now = useCurrentTime();
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentPosition = nowPosition(now);

  useLayoutEffect(() => {
    const scrollArea = scrollRef.current;
    if (!scrollArea) return;
    // Start at Monday 08:00; the first time label and the full week stay visible.
    scrollArea.scrollTop = 0;
    scrollArea.scrollLeft = 0;
  }, [weekOffset]);

  function createFromDay(
    event: ReactMouseEvent<HTMLButtonElement>,
    dateKey: string,
  ) {
    const rect = event.currentTarget.getBoundingClientRect();
    const currentMinute = shanghaiClockMinutes(new Date(now));
    const requestedMinute =
      event.detail === 0
        ? dateKey === localDateKey(new Date(now))
          ? Math.ceil(currentMinute / 15) * 15
          : 9 * 60
        : 8 * 60 +
          Math.round(
            ((event.clientY - rect.top) / rect.height) * 64,
          ) *
            15;
    onCreate(eventDraft(dateKey, requestedMinute));
  }

  return (
    <section className="panel week-calendar" aria-label="周日程">
      <div className="week-calendar-meta">
        <div>
          <strong>{weekLabel}</strong>
          <span>08:00—24:00 · Asia / Shanghai · 点击空白处新建日程</span>
        </div>
        <div className="week-nav" role="group" aria-label="切换周">
          <button type="button" onClick={onPreviousWeek} title="上一周" aria-label="上一周">
            ← <span>上一周</span>
          </button>
          <button type="button" className="week-nav-current" onClick={onCurrentWeek} disabled={weekOffset === 0} title="回到本周">
            本周
          </button>
          <button type="button" onClick={onNextWeek} title="下一周" aria-label="下一周">
            <span>下一周</span> →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="week-calendar-scroll"
        tabIndex={0}
        aria-label="本周日程时间网格，早上八点至晚上十二点"
      >
        <div className="week-calendar-canvas">
          <div className="week-calendar-header" aria-hidden="true">
            <div className="week-calendar-corner">
              <span>时间</span>
              <small>GMT+8</small>
            </div>
            {days.map((day) => (
              <div
                key={day.key}
                className={`week-day-heading ${day.isToday ? "is-today" : ""}`}
              >
                <span>{day.weekday}</span>
                <strong>{day.day}</strong>
                {day.isToday ? <small>今天</small> : null}
              </div>
            ))}
          </div>
          <div className="week-calendar-body">
            <div className="week-time-gutter" aria-hidden="true">
              {hours.map((hour) => (
                <time
                  key={hour}
                  style={
                    {
                      "--week-hour-index": hour - 8,
                    } as CSSProperties
                  }
                >
                  {String(hour).padStart(2, "0")}:00
                </time>
              ))}
            </div>
            <div className="week-day-columns">
              {days.map((day) => {
                const dayEvents = layoutCalendarDayEvents(
                  events.filter(
                    (event) =>
                      !event.allDay &&
                      localDateKey(new Date(event.startAt)) === day.key,
                  ),
                );
                return (
                  <div
                    className={`week-day-column ${day.isToday ? "is-today" : ""}`}
                    key={day.key}
                  >
                    <button
                      className="week-day-create-layer"
                      type="button"
                      aria-label={`${day.weekday} ${day.day} 日，选择时间新建日程`}
                      onClick={(event) => createFromDay(event, day.key)}
                    />
                    {day.isToday && currentPosition ? (
                      <div
                        className="week-now-marker"
                        style={
                          {
                            "--now-position": currentPosition,
                          } as CSSProperties
                        }
                        aria-hidden="true"
                      />
                    ) : null}
                    {dayEvents.map(({ event, lane, laneCount }) => {
                      const geometry = eventGeometry(event);
                      return (
                        <button
                          type="button"
                          key={event.id}
                          className="week-calendar-event"
                          style={
                            {
                              "--event-top": geometry.top,
                              "--event-height": geometry.height,
                              "--event-color": event.color,
                              "--event-lane": lane,
                              "--event-lanes": laneCount,
                            } as CSSProperties
                          }
                          aria-label={`编辑日程 ${event.title}，${formatTime(event.startAt)} 至 ${formatTime(event.endAt)}`}
                          onClick={() => onEdit(event)}
                        >
                          <time>
                            {formatTime(event.startAt)}—{formatTime(event.endAt)}
                          </time>
                          <strong>{event.title}</strong>
                          <span>
                            {event.source === "google"
                              ? "Google Calendar"
                              : "站内日程"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgendaList({
  events,
  tasks,
  projects,
  onEdit,
  onEditTask,
  onToggleTask,
  onArchive,
  onDelete,
  onDeleteTask,
}: {
  events: CalendarEvent[];
  tasks: Task[];
  projects: Project[];
  onEdit: (event: CalendarEvent) => void;
  onEditTask: (task: Task) => void;
  onToggleTask: (task: Task) => void;
  onArchive: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
  onDeleteTask: (task: Task) => void;
}) {
  const now = useCurrentTime();
  const todayKey = localDateKey(new Date(now));
  const pendingTasks = tasks
    .filter((task) => task.status !== "done" && task.dueDate)
    .sort((left, right) =>
      (left.dueDate ?? "").localeCompare(right.dueDate ?? ""),
    );
  const upcomingEvents = events.filter(
    (event) => new Date(event.endAt).getTime() >= now,
  );
  const projectNames = new Map(
    projects.map((project) => [project.id, project.title]),
  );
  const agendaCount = pendingTasks.length + upcomingEvents.length;

  return (
    <section className="panel agenda-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">AGENDA</p>
          <h2>接下来要处理的事</h2>
        </div>
        <span>{agendaCount} 项</span>
      </div>
      <p className="agenda-description">
        这里只汇总未完成且设有 DDL 的任务，以及尚未结束的未来日程；普通时间记录仍留在周视图中。
      </p>
      <div className="agenda-groups">
        <section className="agenda-group" aria-labelledby="agenda-task-heading">
          <div className="agenda-group-heading">
            <div>
              <span className="agenda-kind agenda-kind--task">TASK</span>
              <h3 id="agenda-task-heading">待完成任务</h3>
            </div>
            <span>{pendingTasks.length} 项</span>
          </div>
          {pendingTasks.length ? (
            <div className="agenda-list">
              {pendingTasks.map((task) => {
                const overdue = (task.dueDate ?? "") < todayKey;
                return (
                  <article
                    key={task.id}
                    className={`agenda-row agenda-row--task ${overdue ? "is-overdue" : ""}`}
                  >
                    <time dateTime={task.dueDate ?? undefined}>
                      <strong>{formatShortDate(task.dueDate ?? "")}</strong>
                      <span>{overdue ? "已逾期" : "截止"}</span>
                    </time>
                    <input
                      className="agenda-check"
                      type="checkbox"
                      aria-label={`完成任务 ${task.title}`}
                      checked={false}
                      onChange={() => onToggleTask(task)}
                    />
                    <button
                      id={`agenda-task-${task.id}`}
                      className="agenda-open"
                      type="button"
                      onClick={() => onEditTask(task)}
                    >
                      <strong>{task.title}</strong>
                      <span>
                        {task.projectId
                          ? projectNames.get(task.projectId) ?? "项目子目标"
                          : "独立任务"}
                      </span>
                    </button>
                    <div className="row-actions">
                      <button
                        className="row-action row-action--delete"
                        type="button"
                        aria-label={`删除任务 ${task.title}`}
                        title="删除"
                        onClick={() => onDeleteTask(task)}
                      >
                        ×
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="agenda-empty">没有未完成且设有 DDL 的任务。</p>
          )}
        </section>

        <section className="agenda-group" aria-labelledby="agenda-event-heading">
          <div className="agenda-group-heading">
            <div>
              <span className="agenda-kind agenda-kind--event">CALENDAR</span>
              <h3 id="agenda-event-heading">未来日程</h3>
            </div>
            <span>{upcomingEvents.length} 项</span>
          </div>
          {upcomingEvents.length ? (
            <div className="agenda-list">
              {upcomingEvents.map((event) => (
            <article key={event.id} className="agenda-row">
              <time dateTime={event.startAt}>
                <strong>{formatMonthDay(event.startAt)}</strong>
                <strong>{formatTime(event.startAt)}</strong>
              </time>
              <span
                className="agenda-dot"
                style={{ background: event.color }}
              />
              <button
                className="agenda-open"
                type="button"
                onClick={() => onEdit(event)}
              >
                <strong>{event.title}</strong>
                <span>
                  {event.source === "google" ? "Google Calendar" : "站内日程"}
                </span>
              </button>
              <div className="row-actions">
                <button
                  className="row-action"
                  type="button"
                  onClick={() => onArchive(event)}
                >
                  归档
                </button>
                <button
                  className="row-action row-action--delete"
                  type="button"
                  aria-label={`删除日程 ${event.title}`}
                  title="删除"
                  onClick={() => onDelete(event)}
                >
                  ×
                </button>
              </div>
            </article>
              ))}
            </div>
          ) : (
            <p className="agenda-empty">目前没有尚未结束的未来日程。</p>
          )}
        </section>
      </div>
    </section>
  );
}

function ProjectsView({
  projects,
  tasks,
  onCreate,
  onEdit,
  onCreateSubgoal,
  onUpdate,
  onArchive,
  onDelete,
  onDeleteTask,
}: {
  projects: Project[];
  tasks: Task[];
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onCreateSubgoal: (projectId: string) => void;
  onUpdate: (
    entity: EntityName,
    id: string,
    data: Record<string, unknown>,
    message?: string,
  ) => void;
  onArchive: (project: Project) => void;
  onDelete: (project: Project) => void;
  onDeleteTask: (task: Task) => void;
}) {
  return (
    <div className="page-stack page-enter">
      <section className="page-intro page-intro--projects">
        <div>
          <p className="eyebrow">PROJECTS</p>
          <h2>把大型工程拆成可以完成的子目标</h2>
          <p>项目只在这里创建；普通日程和今日任务不会自动成为项目。</p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={onCreate}
        >
          ＋ 新建项目
        </button>
      </section>
      <div className="project-overview">
        {projects.length ? projects.map((project) => {
          const subgoals = tasks.filter(
            (task) => task.projectId === project.id,
          );
          const completed = subgoals.filter(
            (task) => task.status === "done",
          ).length;
          return (
          <article
            className="panel project-card"
            key={project.id}
            style={{ "--project-color": project.color } as CSSProperties}
          >
            <button
              id={`project-edit-${project.id}`}
              className="project-card-edit-target"
              type="button"
              aria-label={`编辑项目 ${project.title}`}
              onClick={() => onEdit(project)}
            />
            <div className="project-card-head">
              <span className="project-code">
                P-{project.id.slice(-2).toUpperCase()}
              </span>
              <div className="row-actions">
                <button
                  className="row-action"
                  type="button"
                  onClick={() => onArchive(project)}
                >
                  归档
                </button>
                <button
                  className="row-action row-action--delete"
                  type="button"
                  aria-label={`删除项目 ${project.title}`}
                  title="删除"
                  onClick={() => onDelete(project)}
                >
                  ×
                </button>
              </div>
            </div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="project-subgoal-heading">
              <div>
                <span>子目标</span>
                <strong>
                  {completed}/{subgoals.length} 已完成
                </strong>
              </div>
              <button
                className="text-button"
                type="button"
                onClick={() => onCreateSubgoal(project.id)}
              >
                ＋ 添加子目标
              </button>
            </div>
            <div className="project-subgoal-list">
              {subgoals.length ? (
                subgoals.map((task) => (
                  <div className="project-subgoal-row" key={task.id}>
                    <span className={task.status === "done" ? "is-done" : ""}>
                      {task.title}
                    </span>
                    {task.dueDate ? <time>{formatShortDate(task.dueDate)}</time> : null}
                    <button
                      className="row-action row-action--delete"
                      type="button"
                      aria-label={`删除子目标 ${task.title}`}
                      title="删除"
                      onClick={() => onDeleteTask(task)}
                    >
                      ×
                    </button>
                    <SubgoalStatusPicker
                      task={task}
                      onChange={(status) =>
                        onUpdate(
                          "task",
                          task.id,
                          { status: status.value },
                          `子目标已设为${status.label}`,
                        )
                      }
                    />
                  </div>
                ))
              ) : (
                <div className="project-subgoal-empty">
                  <span aria-hidden="true">○</span>
                  <p>还没有子目标。先拆出第一个可验证的结果。</p>
                </div>
              )}
            </div>
            <footer className="project-card-footer">
              <span>
                {project.deadline
                  ? `截止 ${formatShortDate(project.deadline)}`
                  : "未设置截止日期"}
              </span>
              <span className="project-edit-hint">点击卡片编辑项目详情</span>
            </footer>
          </article>
          );
        }) : (
          <section className="panel project-empty-state">
            <EmptyState
              title="还没有项目"
              description="项目用于需要多个阶段或多个交付结果的大型工程。"
              action="创建第一个项目"
              onAction={onCreate}
            />
          </section>
        )}
      </div>
    </div>
  );
}

function SubgoalStatusPicker({
  task,
  onChange,
}: {
  task: Task;
  onChange: (status: (typeof subgoalStatuses)[number]) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const currentStatus =
    subgoalStatuses.find((status) => status.value === task.status) ??
    subgoalStatuses[0];
  const optionsId = `subgoal-status-options-${task.id}`;

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div
      className={`project-subgoal-status-picker ${open ? "is-open" : ""}`}
      ref={rootRef}
    >
      <button
        className={`project-subgoal-status-trigger is-${currentStatus.value}`}
        type="button"
        ref={triggerRef}
        aria-expanded={open}
        aria-controls={optionsId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="project-subgoal-status-icon" aria-hidden="true">
          {currentStatus.icon}
        </span>
        <span>{currentStatus.label}</span>
        <span className="project-subgoal-status-chevron" aria-hidden="true" />
      </button>
      {open ? (
        <div
          id={optionsId}
          className="project-subgoal-status-options"
          role="group"
          aria-label={`设置子目标「${task.title}」的状态`}
        >
          {subgoalStatuses.map((status) => (
            <button
              key={status.value}
              className={`project-subgoal-status-option is-${status.value}`}
              type="button"
              aria-pressed={task.status === status.value}
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
                if (task.status !== status.value) onChange(status);
              }}
            >
              <span className="project-subgoal-status-icon" aria-hidden="true">
                {status.icon}
              </span>
              {status.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function LearningView({
  domains,
  logs,
  notes,
  onCreateDomain,
  onEditDomain,
  onCreateLog,
  onCreateNote,
  onEditNote,
  onUpdate,
}: {
  domains: Domain[];
  logs: LearningLog[];
  notes: KnowledgeNote[];
  onCreateDomain: () => void;
  onEditDomain: (domain: Domain) => void;
  onCreateLog: () => void;
  onCreateNote: (defaults: EditorDraft) => void;
  onEditNote: (note: KnowledgeNote) => void;
  onUpdate: (
    entity: EntityName,
    id: string,
    data: Record<string, unknown>,
    message?: string,
  ) => void;
}) {
  const [selectedId, setSelectedId] = useState(domains[0]?.id ?? "");
  const [noteScope, setNoteScope] = useState<"domain" | "cross">("domain");
  const selected =
    domains.find((domain) => domain.id === selectedId) ?? domains[0];
  const selectedNotes = selected
    ? notes.filter((note) => note.domainId === selected.id)
    : [];
  const insights = selectedNotes.filter((note) => note.kind === "insight");
  const branches = selectedNotes.filter((note) => note.kind === "branch");
  const stageSummaries = selectedNotes.filter((note) => note.kind === "stage");
  const domainNotes = selectedNotes.filter((note) => note.kind === "note");
  const crossDomainNotes = notes.filter(
    (note) => note.kind === "note" && !note.domainId,
  );
  const visibleNotes = noteScope === "domain" ? domainNotes : crossDomainNotes;

  function createKnowledgeNote(
    kind: KnowledgeNote["kind"],
    domainId = selected?.id ?? "",
  ) {
    onCreateNote({
      kind,
      domainId,
      stage: String(selected?.stage ?? 1),
    });
  }

  return (
    <div className="page-stack page-enter">
      <section className="page-intro page-intro--learning">
        <div>
          <p className="eyebrow">LEARNING DOMAINS</p>
          <h2>把学习压缩成可回顾的认知档案</h2>
          <p>按领域整理核心认知、知识分支与阶段总结，也保留跨领域连接。</p>
        </div>
        <div className="intro-actions">
          <button
            className="button button--outline"
            type="button"
            onClick={onCreateLog}
          >
            记录学习
          </button>
          <button
            className="button button--primary"
            type="button"
            onClick={onCreateDomain}
          >
            ＋ 新建领域
          </button>
        </div>
      </section>

      {domains.length ? (
        <section className="domain-library" aria-labelledby="domain-library-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">DOMAIN LIBRARY</p>
              <h2 id="domain-library-title">领域书架</h2>
            </div>
            <span>{domains.length} 个领域</span>
          </div>
          <div
            className="domain-shelf"
            role="region"
            aria-label={`领域书架，共 ${domains.length} 个领域，可横向滚动`}
            tabIndex={0}
          >
            {domains.map((domain) => {
              const domainKnowledge = notes.filter(
                (note) => note.domainId === domain.id && note.kind !== "note",
              ).length;
              return (
                <button
                  id={`domain-select-${domain.id}`}
                  className={`domain-shelf-card ${selected?.id === domain.id ? "is-selected" : ""}`}
                  type="button"
                  key={domain.id}
                  aria-pressed={selected?.id === domain.id}
                  style={{ "--domain-color": domain.color } as CSSProperties}
                  onClick={() => setSelectedId(domain.id)}
                >
                  <div className="domain-card-meta">
                    <span className="domain-card-stage">
                      阶段 {domain.stage} · {stageLabels[domain.stage - 1]}
                    </span>
                    <span className="domain-card-status">
                      {domain.stage >= 5 ? "已完成" : "学习中"}
                    </span>
                  </div>
                  <strong>{domain.title}</strong>
                  <p>{domain.summary || "还没有写下这一领域的核心理解。"}</p>
                  <small>{domainKnowledge} 条认知记录</small>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="panel learning-empty-state">
          <EmptyState
            title="还没有学习领域"
            description="创建一个领域，开始沉淀自己的认知框架。"
            action="新建领域"
            onAction={onCreateDomain}
          />
        </section>
      )}

      {selected ? (
        <div className="learning-workbench">
          <section className="panel knowledge-record" aria-labelledby="knowledge-record-title">
            <header className="knowledge-record-header">
              <div>
                <p className="eyebrow">COGNITIVE RECORD</p>
                <h2 id="knowledge-record-title">{selected.title}</h2>
                <span>
                  阶段 {String(selected.stage).padStart(2, "0")} / 05 ·{" "}
                  {stageLabels[selected.stage - 1]} · {selected.stage >= 5 ? "已完成" : "学习中"}
                </span>
              </div>
              <button
                className="button button--outline"
                type="button"
                onClick={() => onEditDomain(selected)}
              >
                编辑领域
              </button>
            </header>

            <div className="cognition-summary">
              <span>当前理解</span>
              <p>{selected.summary || "用一两句话写下你目前对这个领域最重要的理解。"}</p>
            </div>

            <section className="knowledge-section">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">KEY INSIGHTS</p>
                  <h3>核心认知</h3>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => createKnowledgeNote("insight")}
                >
                  ＋ 记录认知
                </button>
              </div>
              {insights.length ? (
                <div className="insight-grid">
                  {insights.map((note, index) => (
                    <KnowledgeNoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      onEdit={onEditNote}
                    />
                  ))}
                </div>
              ) : (
                <KnowledgeEmpty
                  text="把最能改变你思考方式的结论写在这里。"
                  action="记录第一条认知"
                  onAction={() => createKnowledgeNote("insight")}
                />
              )}
            </section>

            <section className="knowledge-section">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">KNOWLEDGE BRANCHES</p>
                  <h3>知识分支</h3>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => createKnowledgeNote("branch")}
                >
                  ＋ 新增分支
                </button>
              </div>
              {branches.length ? (
                <div className="branch-grid">
                  {branches.map((note, index) => (
                    <KnowledgeNoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      onEdit={onEditNote}
                    />
                  ))}
                </div>
              ) : (
                <KnowledgeEmpty
                  text="用高度凝练的分支整理这个领域的组成部分。"
                  action="添加第一个分支"
                  onAction={() => createKnowledgeNote("branch")}
                />
              )}
            </section>

            <section className="knowledge-section">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">STAGE NOTES</p>
                  <h3>分阶段总结</h3>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => createKnowledgeNote("stage")}
                >
                  ＋ 写阶段总结
                </button>
              </div>
              <div className="stage-timeline">
                {stageLabels.map((label, index) => {
                  const stage = index + 1;
                  const stageNotes = stageSummaries.filter(
                    (note) => note.stage === stage,
                  );
                  return (
                    <div
                      className={`stage-timeline-row ${stage < selected.stage ? "is-complete" : stage === selected.stage ? "is-current" : ""}`}
                      key={label}
                    >
                      <span className="stage-index">{String(stage).padStart(2, "0")}</span>
                      <div>
                        <strong>{label}</strong>
                        {stageNotes.length ? (
                          stageNotes.map((note) => (
                            <button
                              id={`knowledge-note-${note.id}`}
                              className="stage-note-link"
                              type="button"
                              key={note.id}
                              onClick={() => onEditNote(note)}
                            >
                              <span>{note.title}</span>
                              <small>{note.content || "打开补充这一阶段的总结"}</small>
                            </button>
                          ))
                        ) : (
                          <small>{stage <= selected.stage ? "尚未写总结" : "尚未到达"}</small>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </section>

          <aside className="learning-sidebar">
            <section className="panel learning-progress-card">
              <p className="eyebrow">LEARNING POSITION</p>
              <div className="stage-label">
                <span>当前阶段</span>
                <strong>{selected.stage} / 5</strong>
              </div>
              <StageMeter stage={selected.stage} />
              <div className="next-step-block">
                <span>下一步</span>
                <p>{selected.nextStep || "确定下一步具体的学习行动。"}</p>
              </div>
              <div className="stage-controls stage-controls--wide">
                <button
                  type="button"
                  disabled={selected.stage <= 1}
                  onClick={() =>
                    onUpdate(
                      "domain",
                      selected.id,
                      { stage: selected.stage - 1 },
                      "学习阶段已更新",
                    )
                  }
                >
                  上一阶段
                </button>
                <button
                  type="button"
                  disabled={selected.stage >= 5}
                  onClick={() =>
                    onUpdate(
                      "domain",
                      selected.id,
                      { stage: selected.stage + 1 },
                      "学习阶段已更新",
                    )
                  }
                >
                  推进阶段
                </button>
              </div>
            </section>

            <section className="panel knowledge-notebook">
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">NOTEBOOK</p>
                  <h3>笔记</h3>
                </div>
                <button
                  className="text-button"
                  type="button"
                  onClick={() =>
                    createKnowledgeNote(
                      "note",
                      noteScope === "domain" ? selected.id : "",
                    )
                  }
                >
                  ＋ 新建
                </button>
              </div>
              <div className="segmented notebook-tabs" role="group" aria-label="笔记范围">
                <button
                  type="button"
                  aria-pressed={noteScope === "domain"}
                  onClick={() => setNoteScope("domain")}
                >
                  领域内
                </button>
                <button
                  type="button"
                  aria-pressed={noteScope === "cross"}
                  onClick={() => setNoteScope("cross")}
                >
                  跨领域
                </button>
              </div>
              <div className="notebook-list">
                {visibleNotes.length ? (
                  visibleNotes.map((note) => (
                    <KnowledgeNoteCard
                      key={note.id}
                      note={note}
                      onEdit={onEditNote}
                    />
                  ))
                ) : (
                  <KnowledgeEmpty
                    text={
                      noteScope === "domain"
                        ? "保存与当前领域有关、但还不属于认知骨架的笔记。"
                        : "把跨越多个领域的连接与启发集中放在这里。"
                    }
                    action={noteScope === "domain" ? "写领域笔记" : "写跨领域笔记"}
                    onAction={() =>
                      createKnowledgeNote(
                        "note",
                        noteScope === "domain" ? selected.id : "",
                      )
                    }
                  />
                )}
              </div>
            </section>
          </aside>
        </div>
      ) : null}

      <section className="panel log-panel learning-log-panel">
        <div className="panel-heading">
          <h2>最近学习记录</h2>
          <span>{logs.length} 条</span>
        </div>
        {logs.length ? (
          logs.map((log) => (
            <article className="log-row" key={log.id}>
              <time>{formatMonthDay(log.occurredAt)}</time>
              <div>
                <strong>{log.title}</strong>
                <p>
                  {log.note ||
                    domains.find((domain) => domain.id === log.domainId)?.title}
                </p>
              </div>
              <span>{log.minutes} 分钟</span>
            </article>
          ))
        ) : (
          <EmptyState
            title="还没有学习记录"
            description="完成一次学习后，记录你理解发生了什么变化。"
            action="记录学习"
            onAction={onCreateLog}
          />
        )}
      </section>
    </div>
  );
}

function KnowledgeNoteCard({
  note,
  index,
  onEdit,
}: {
  note: KnowledgeNote;
  index?: number;
  onEdit: (note: KnowledgeNote) => void;
}) {
  return (
    <button
      id={`knowledge-note-${note.id}`}
      className={`knowledge-note-card knowledge-note-card--${note.kind}`}
      type="button"
      onClick={() => onEdit(note)}
    >
      {index !== undefined ? (
        <span className="knowledge-note-index">{String(index + 1).padStart(2, "0")}</span>
      ) : null}
      <strong>{note.title}</strong>
      <p>{note.content || "打开补充内容"}</p>
      <small>{knowledgeNoteKindLabel(note.kind)}</small>
    </button>
  );
}

function KnowledgeEmpty({
  text,
  action,
  onAction,
}: {
  text: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="knowledge-empty">
      <p>{text}</p>
      <button className="text-button" type="button" onClick={onAction}>
        {action}
      </button>
    </div>
  );
}

function IdeasView({
  ideas,
  projects,
  domains,
  onCreate,
  onEdit,
  onUpdate,
  onArchive,
  onDelete,
}: {
  ideas: Idea[];
  projects: Project[];
  domains: Domain[];
  onCreate: () => void;
  onEdit: (idea: Idea) => void;
  onUpdate: (
    entity: EntityName,
    id: string,
    data: Record<string, unknown>,
    message?: string,
  ) => void;
  onArchive: (idea: Idea) => void;
  onDelete: (idea: Idea) => void;
}) {
  const [filter, setFilter] = useState<"all" | "idea" | "question">("all");
  const filtered = ideas.filter(
    (idea) => filter === "all" || idea.type === filter,
  );
  return (
    <div className="page-stack page-enter">
      <section className="page-intro">
        <div>
          <p className="eyebrow">IDEAS & QUESTIONS</p>
          <h2>先捕捉，再决定它应该去哪里</h2>
          <p>把模糊想法变成问题、探索或下一步行动。</p>
        </div>
        <button
          className="button button--primary"
          type="button"
          onClick={onCreate}
        >
          ＋ 捕捉新线索
        </button>
      </section>
      <div className="filter-bar">
        <div className="segmented" role="group" aria-label="内容类型">
          {(["all", "idea", "question"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item === "all" ? "全部" : item === "idea" ? "Ideas" : "疑问"}
            </button>
          ))}
        </div>
        <span>{filtered.length} 条线索</span>
      </div>
      <div className="idea-grid">
        {filtered.map((idea) => (
          <article className="panel idea-card" key={idea.id}>
            <button
              id={`idea-edit-${idea.id}`}
              className="idea-card-edit-target"
              type="button"
              aria-label={`编辑${idea.type === "question" ? "疑问" : "Idea"} ${idea.title}`}
              onClick={() => onEdit(idea)}
            />
            <div className="idea-card-head">
              <span className={`type-badge type-badge--${idea.type}`}>
                {idea.type === "question" ? "疑问" : "Idea"}
              </span>
              <div className="row-actions">
                <button
                  className="icon-button"
                  type="button"
                  aria-label={`归档 ${idea.title}`}
                  title="归档"
                  onClick={() => onArchive(idea)}
                >
                  ···
                </button>
                <button
                  className="row-action row-action--delete"
                  type="button"
                  aria-label={`删除${idea.type === "question" ? "疑问" : "Idea"} ${idea.title}`}
                  title="删除"
                  onClick={() => onDelete(idea)}
                >
                  ×
                </button>
              </div>
            </div>
            <h3>{idea.title}</h3>
            <p>{idea.note || "还没有补充笔记。"}</p>
            <div className="relation-line">
              <span>
                {domains.find((domain) => domain.id === idea.domainId)?.title ??
                  "未关联领域"}
              </span>
              <span>
                {projects.find((project) => project.id === idea.projectId)
                  ?.title ?? "未关联项目"}
              </span>
            </div>
            <div className="status-actions">
              <button
                type="button"
                aria-pressed={idea.status === "exploring"}
                onClick={() =>
                  onUpdate(
                    "idea",
                    idea.id,
                    { status: "exploring" },
                    "已标记为探索中",
                  )
                }
              >
                探索中
              </button>
              <button
                type="button"
                aria-pressed={idea.status === "resolved"}
                onClick={() =>
                  onUpdate(
                    "idea",
                    idea.id,
                    { status: "resolved" },
                    "已标记为解决",
                  )
                }
              >
                已解决
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReviewView({ snapshot }: { snapshot: Snapshot }) {
  const completed = snapshot.tasks.filter(
    (task) => task.status === "done",
  ).length;
  const total = snapshot.tasks.length || 1;
  const minutes = snapshot.learningLogs.reduce(
    (sum, log) => sum + log.minutes,
    0,
  );
  const resolved = snapshot.ideas.filter(
    (idea) => idea.status === "resolved",
  ).length;
  const nextProjectGoal = snapshot.tasks.find(
    (task) => task.projectId && task.status !== "done",
  );
  return (
    <div className="page-stack page-enter">
      <section className="page-intro page-intro--review">
        <div>
          <p className="eyebrow">WEEKLY REVIEW</p>
          <h2>回顾不是打分，而是决定下周保留什么</h2>
          <p>聚合时间投入、项目推进和理解变化，帮助你调整下一步。</p>
        </div>
        <button
          className="button button--outline"
          type="button"
          onClick={() => window.print()}
        >
          打印本周回顾
        </button>
      </section>
      <div className="review-stats">
        <article>
          <span>任务完成</span>
          <strong>
            {completed}/{total}
          </strong>
          <small>{Math.round((completed / total) * 100)}%</small>
        </article>
        <article>
          <span>学习投入</span>
          <strong>{minutes}</strong>
          <small>分钟</small>
        </article>
        <article>
          <span>已解决问题</span>
          <strong>{resolved}</strong>
          <small>条</small>
        </article>
      </div>
      <section className="panel review-chart">
        <div className="panel-heading">
          <h2>本周时间投入</h2>
          <span>按工作类型</span>
        </div>
        <div
          className="allocation-chart"
          role="img"
          aria-label="本周时间投入：项目 55%，领域学习 30%，日常安排 15%"
        >
          <div>
            <span>项目推进</span>
            <i style={{ width: "55%" }} />
            <strong>55%</strong>
          </div>
          <div>
            <span>领域学习</span>
            <i style={{ width: "30%" }} />
            <strong>30%</strong>
          </div>
          <div>
            <span>日常安排</span>
            <i style={{ width: "15%" }} />
            <strong>15%</strong>
          </div>
        </div>
      </section>
      <section className="review-grid">
        <article className="panel">
          <p className="eyebrow">KEEP</p>
          <h3>下周继续保持</h3>
          <p>上午保留一段不被会议切开的深度工作时间。</p>
        </article>
        <article className="panel">
          <p className="eyebrow">ADJUST</p>
          <h3>需要调整</h3>
          <p>把“阅读资料”改写成可验证的理解目标或具体问题。</p>
        </article>
        <article className="panel">
          <p className="eyebrow">NEXT</p>
          <h3>最重要的下一步</h3>
          <p>
            {nextProjectGoal?.title || "为最重要的项目创建一个子目标。"}
          </p>
        </article>
      </section>
    </div>
  );
}

function SettingsView({
  viewer,
  profile,
  settings,
  semester,
  weekInfo,
  googleStatus,
  setGoogleStatus,
  onRefresh,
  onSync,
  syncing,
  notify,
  onSaveProfile,
  onSaveSettings,
  onSaveSemester,
  onCreateSemester,
  onLoadDemo,
  onReset,
}: {
  viewer: Viewer;
  profile: Profile | undefined;
  settings: Settings | undefined;
  semester: Semester | null;
  weekInfo: { week: number; inTerm: boolean } | null;
  googleStatus: GoogleStatus | null;
  setGoogleStatus: (status: GoogleStatus | null) => void;
  onRefresh: () => Promise<void>;
  onSync: () => void;
  syncing: boolean;
  notify: (message: string, tone?: Toast["tone"]) => void;
  onSaveProfile: (next: { nickname?: string }) => Promise<void>;
  onSaveSettings: (next: {
    reminders?: Partial<ReminderSettings>;
    periodTimes?: CoursePeriod[];
  }) => Promise<void>;
  onSaveSemester: (semester: Semester, patch: Record<string, unknown>) => Promise<void>;
  onCreateSemester: () => Promise<void>;
  onLoadDemo: () => Promise<void>;
  onReset: (mode: "empty" | "demo") => Promise<void>;
}) {
  const [updating, setUpdating] = useState("");
  const [nickname, setNickname] = useState(profile?.nickname ?? "FDUer");
  const [digestTime, setDigestTime] = useState(settings?.reminders?.digestTime ?? "08:00");
  const [semesterName, setSemesterName] = useState(semester?.name ?? "");
  const [semesterStart, setSemesterStart] = useState(
    semester?.startDate ?? mondayKeyOf(localDateKey(new Date())),
  );
  const [semesterWeeks, setSemesterWeeks] = useState(String(semester?.weekCount ?? 16));
  useEffect(() => {
    setNickname(profile?.nickname ?? "FDUer");
  }, [profile?.nickname]);
  useEffect(() => {
    setDigestTime(settings?.reminders?.digestTime ?? "08:00");
  }, [settings?.reminders?.digestTime]);
  useEffect(() => {
    setSemesterName(semester?.name ?? "");
    setSemesterStart(semester?.startDate ?? mondayKeyOf(localDateKey(new Date())));
    setSemesterWeeks(String(semester?.weekCount ?? 16));
  }, [semester?.id, semester?.name, semester?.startDate, semester?.weekCount]);
  const reminders = settings?.reminders;
  async function toggleCalendar(calendar: GoogleCalendar) {
    setUpdating(calendar.id);
    try {
      const response = await fetch("/api/dsh-workflow/google/calendars", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          calendarId: calendar.calendarId,
          selected: !calendar.selected,
        }),
      });
      if (!response.ok) throw new Error();
      setGoogleStatus(
        googleStatus
          ? {
              ...googleStatus,
              calendars: googleStatus.calendars.map((item) =>
                item.id === calendar.id
                  ? { ...item, selected: !item.selected }
                  : item,
              ),
            }
          : null,
      );
      notify("同步范围已更新");
    } catch {
      notify("同步范围未更新", "error");
    } finally {
      setUpdating("");
    }
  }
  async function disconnect() {
    setUpdating("disconnect");
    try {
      const response = await fetch("/api/dsh-workflow/google/disconnect", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      await onRefresh();
      notify("Google Calendar 已断开", "warning");
    } catch {
      notify("未能断开连接", "error");
    } finally {
      setUpdating("");
    }
  }
  return (
    <div className="settings-layout page-enter">
      <section className="page-intro page-intro--settings">
        <div>
          <p className="eyebrow">SETTINGS</p>
          <h2>数据与设置</h2>
          <p>个人身份、学期与课表、提醒，以及本地数据和 Google Calendar（本地版暂不启用）。</p>
        </div>
      </section>
      <section className="panel settings-panel settings-panel--profile">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              像
            </span>
            <div>
              <h3>个人画像</h3>
              <p>默认是空的，只保留一个 FDUer 身份。</p>
            </div>
          </div>
          <span className="connection-status">{profile?.claims?.length ? "已积累" : "空白"}</span>
        </div>
        <div className="settings-inline-form">
          <label className="settings-inline-field">
            <span>称呼</span>
            <input
              value={nickname}
              maxLength={40}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="FDUer"
            />
          </label>
          <button
            className="button button--outline"
            type="button"
            disabled={!nickname.trim() || nickname === profile?.nickname}
            onClick={() => onSaveProfile({ nickname: nickname.trim() })}
          >
            保存称呼
          </button>
        </div>
        <p className="settings-copy">
          画像本身还没有开始记录：目前只有「称呼」这一项身份信息。之后的作息、偏好、擅长科目会作为可编辑的声明加在这里，每一条都带来源和时效，可以随时否认。
        </p>
      </section>
      <section className="panel settings-panel settings-panel--semester">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              学
            </span>
            <div>
              <h3>学期与课表</h3>
              <p>
                {semester
                  ? `${semester.name} · 共 ${semester.weekCount} 周${
                      weekInfo?.inTerm ? ` · 本周第 ${weekInfo.week} 周` : " · 不在教学周"
                    }`
                  : "还没有学期，课表无法排布。"}
              </p>
            </div>
          </div>
          <span className="connection-status">{semester ? "已设置" : "未设置"}</span>
        </div>
        {semester ? (
          <div className="settings-inline-form settings-inline-form--wrap">
            <label className="settings-inline-field">
              <span>学期名称</span>
              <input value={semesterName} onChange={(event) => setSemesterName(event.target.value)} />
            </label>
            <label className="settings-inline-field">
              <span>第 1 周周一</span>
              <input
                type="date"
                value={semesterStart}
                onChange={(event) => setSemesterStart(event.target.value)}
              />
            </label>
            <label className="settings-inline-field settings-inline-field--narrow">
              <span>总周数</span>
              <input
                type="number"
                min={1}
                max={30}
                value={semesterWeeks}
                onChange={(event) => setSemesterWeeks(event.target.value)}
              />
            </label>
            <button
              className="button button--outline"
              type="button"
              onClick={() =>
                onSaveSemester(semester, {
                  name: semesterName.trim() || semester.name,
                  startDate: semesterStart,
                  weekCount: Number(semesterWeeks) || semester.weekCount,
                })
              }
            >
              保存学期
            </button>
          </div>
        ) : (
          <div className="settings-actions">
            <button className="button button--primary" type="button" onClick={onCreateSemester}>
              创建本学期
            </button>
            <button className="button button--outline" type="button" onClick={onLoadDemo}>
              载入示例课表
            </button>
          </div>
        )}
        <p className="settings-copy">
          课表按「第 1 周周一 + 总周数」计算周次；单双周、分段周次写在上课周次里。现在是 {settings?.periodTimes?.length ?? 13} 节制，默认按复旦夏令作息排布。
        </p>
      </section>
      <section className="panel settings-panel settings-panel--reminders">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              铃
            </span>
            <div>
              <h3>提醒</h3>
              <p>每日摘要与 DDL 提醒；打开知行台时生效。</p>
            </div>
          </div>
          <button
            className={`switch ${reminders?.enabled ? "is-on" : ""}`}
            type="button"
            role="switch"
            aria-checked={Boolean(reminders?.enabled)}
            aria-label="启用提醒"
            onClick={() => onSaveSettings({ reminders: { enabled: !reminders?.enabled } })}
          >
            <span />
          </button>
        </div>
        <div className="reminder-settings">
          <label className="reminder-setting">
            <input
              type="checkbox"
              checked={Boolean(reminders?.dailyDigest)}
              disabled={!reminders?.enabled}
              onChange={(event) =>
                onSaveSettings({ reminders: { dailyDigest: event.target.checked } })
              }
            />
            <span>
              <strong>每日摘要</strong>
              <small>当天第一次打开时，汇总课程与到期 DDL。</small>
            </span>
          </label>
          <div className="reminder-setting reminder-setting--time">
            <span>
              <strong>摘要时间</strong>
              <small>早于这个时间不提醒。</small>
            </span>
            <input
              type="time"
              value={digestTime}
              disabled={!reminders?.enabled || !reminders?.dailyDigest}
              onChange={(event) => setDigestTime(event.target.value)}
              onBlur={() => {
                if (/^\d{2}:\d{2}$/.test(digestTime) && digestTime !== reminders?.digestTime) {
                  onSaveSettings({ reminders: { digestTime } });
                }
              }}
            />
          </div>
          <div className="reminder-setting">
            <span>
              <strong>提前提醒</strong>
              <small>DDL 进入这个窗口时提醒一次。</small>
            </span>
            <div className="reminder-leads">
              {[24, 2].map((hour) => {
                const active = (reminders?.leadHours ?? []).includes(hour);
                return (
                  <button
                    key={hour}
                    type="button"
                    className={`chip-toggle ${active ? "is-on" : ""}`}
                    aria-pressed={active}
                    disabled={!reminders?.enabled}
                    onClick={() => {
                      const current = reminders?.leadHours ?? [];
                      const next = active
                        ? current.filter((item) => item !== hour)
                        : [...current, hour].sort((left, right) => right - left);
                      onSaveSettings({ reminders: { leadHours: next } });
                    }}
                  >
                    {hour} 小时
                  </button>
                );
              })}
            </div>
          </div>
          <div className="reminder-setting">
            <span>
              <strong>系统通知</strong>
              <small>
                {typeof Notification === "undefined"
                  ? "这个浏览器不支持系统通知。"
                  : Notification.permission === "granted"
                    ? "已授权，提醒会同时出现在系统通知里。"
                    : "未授权；申请后即使切到别的窗口也能看到提醒。"}
              </small>
            </span>
            <button
              className="button button--outline"
              type="button"
              disabled={
                typeof Notification === "undefined" ||
                Notification.permission === "granted" ||
                !reminders?.enabled
              }
              onClick={async () => {
                if (typeof Notification === "undefined") return;
                const permission = await Notification.requestPermission();
                notify(
                  permission === "granted" ? "系统通知已开启" : "未开启系统通知",
                  permission === "granted" ? "success" : "warning",
                );
              }}
            >
              申请权限
            </button>
          </div>
        </div>
      </section>
      <section className="panel settings-panel settings-panel--calendar">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              G
            </span>
            <div>
              <h3>Google Calendar</h3>
              <p>
                {googleStatus?.connected
                  ? `已连接 ${googleStatus.googleEmail}`
                  : "本地版暂不启用；数据仅保存在这台电脑。"}
              </p>
            </div>
          </div>
          <span
            className={`connection-status ${googleStatus?.connected ? "is-connected" : ""}`}
          >
            {googleStatus?.connected
              ? "已连接"
              : googleStatus?.configured
                ? "未连接"
                : "本地版"}
          </span>
        </div>
        {googleStatus?.connected ? (
          <>
            <div className="calendar-list">
              <h4>同步这些日历</h4>
              {googleStatus.calendars.map((calendar) => (
                <label className="calendar-option" key={calendar.id}>
                  <input
                    type="checkbox"
                    checked={calendar.selected}
                    disabled={updating === calendar.id}
                    onChange={() => toggleCalendar(calendar)}
                  />
                  <span
                    className="calendar-swatch"
                    style={{ background: calendar.color }}
                  />
                  <span>
                    <strong>{calendar.name}</strong>
                    <small>
                      {calendar.isPrimary
                        ? "主日历"
                        : calendar.writable
                          ? "可写入"
                          : "只读"}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            <div className="settings-actions">
              <button
                className="button button--primary"
                type="button"
                disabled={syncing}
                onClick={onSync}
              >
                {syncing ? "同步中…" : "立即同步"}
              </button>
              <button
                className="button button--ghost-danger"
                type="button"
                disabled={updating === "disconnect"}
                onClick={disconnect}
              >
                断开连接
              </button>
              <span>
                {googleStatus.lastSyncAt
                  ? `上次同步 ${formatRelative(googleStatus.lastSyncAt)}`
                  : "尚未同步"}
              </span>
            </div>
          </>
        ) : (
          <div className="settings-connect">
            <p>
              {googleStatus?.configured
                ? "授权时只请求日历和邮箱信息；授权令牌只保存在服务端。"
                : "本地版暂不启用 Google Calendar 同步。"}
            </p>
            {googleStatus?.configured ? (
              <a className="button button--primary" href="/api/dsh-workflow/google/connect">
                连接 Google Calendar
              </a>
            ) : (
              <button className="button button--outline" type="button" disabled>
                本地版暂不启用
              </button>
            )}
          </div>
        )}
      </section>
      <section className="panel settings-panel settings-panel--privacy">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              私
            </span>
            <div>
              <h3>本地身份</h3>
              <p>{viewer.displayName} · local@localhost</p>
            </div>
          </div>
          <span className="connection-status is-connected">仅自己</span>
        </div>
        <p className="settings-copy">
          应用只在本机运行；数据保存在本机 DSH profile，不经过云端账号校验。
        </p>
      </section>
      <section className="panel settings-panel settings-panel--data">
        <div className="settings-heading">
          <div>
            <span className="settings-icon" aria-hidden="true">
              数
            </span>
            <div>
              <h3>数据与时区</h3>
              <p>本地数据 · Asia/Shanghai · 公历</p>
            </div>
          </div>
        </div>
        <p className="settings-copy">
          课程、任务、项目、学习进度和 Ideas 保存在本机 profile 的 JSON 文件；浏览器只保存显示偏好和提醒记录。
        </p>
        <div className="settings-actions">
          <button
            className="button button--outline"
            type="button"
            onClick={() => onReset("demo")}
          >
            恢复示例数据
          </button>
          <button
            className="button button--ghost-danger"
            type="button"
            onClick={() => onReset("empty")}
          >
            清空为空白工作台
          </button>
        </div>
        <p className="settings-copy settings-copy--warning">
          清空会覆盖当前 JSON：课程、任务、项目、领域与 Ideas 都会回到空白，只保留一个 FDUer 身份。建议先导出备份。
        </p>
      </section>
    </div>
  );
}

function EditorDialog({
  entity,
  draft,
  setDraft,
  error,
  saving,
  editing,
  suspended,
  snapshot,
  onClose,
  onSubmit,
  onDelete,
}: {
  entity: EntityName;
  draft: EditorDraft;
  setDraft: (draft: EditorDraft) => void;
  error: string;
  saving: boolean;
  editing: boolean;
  suspended: boolean;
  snapshot: Snapshot | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const titleRef = useRef<HTMLElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, titleRef, onClose, !suspended);
  const label =
    entity === "task" && draft.projectId ? "子目标" : entityLabel(entity);

  useEffect(() => {
    if (!(titleRef.current instanceof HTMLTextAreaElement)) return;
    titleRef.current.style.height = "auto";
    titleRef.current.style.height = `${Math.min(titleRef.current.scrollHeight, 144)}px`;
  }, [draft.title, entity]);

  const titleFieldProps = {
    id: "editor-title",
    value: draft.title ?? "",
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setDraft({ ...draft, title: event.target.value }),
    "aria-invalid": Boolean(error && !draft.title?.trim()),
    "aria-describedby": error ? "editor-error" : undefined,
    placeholder:
      entity === "idea" ? "记录一个想法或疑问…" : `填写${label}标题…`,
  };
  return (
    <div
      className="modal-backdrop"
      aria-hidden={suspended || undefined}
      inert={suspended || undefined}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target && !saving) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="editor-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-dialog-title"
      >
        <header>
          <div>
            <p className="eyebrow">QUICK CAPTURE</p>
            <h2 id="editor-dialog-title">
              {editing ? `编辑${label}` : `创建${label}`}
            </h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="关闭编辑器"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </header>
        <form noValidate onSubmit={onSubmit}>
          <div className="field-group">
            <label htmlFor="editor-title">标题</label>
            {entity === "idea" ? (
              <textarea
                {...titleFieldProps}
                ref={(node) => {
                  titleRef.current = node;
                }}
                className="editor-title-textarea resize-none"
                rows={2}
              />
            ) : (
              <input
                {...titleFieldProps}
                ref={(node) => {
                  titleRef.current = node;
                }}
              />
            )}
          </div>
          {entity === "idea" ? (
            <div
              className="segmented field-segment"
              role="group"
              aria-label="记录类型"
            >
              <button
                type="button"
                aria-pressed={draft.type !== "question"}
                onClick={() => setDraft({ ...draft, type: "idea" })}
              >
                Idea
              </button>
              <button
                type="button"
                aria-pressed={draft.type === "question"}
                onClick={() => setDraft({ ...draft, type: "question" })}
              >
                疑问
              </button>
            </div>
          ) : null}
          {entity === "idea" ? (
            <div className="field-row field-row--two">
              <div className="field-group">
                <label htmlFor="idea-domain">关联领域</label>
                <select
                  id="idea-domain"
                  value={draft.domainId ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, domainId: event.target.value })
                  }
                >
                  <option value="">未关联领域</option>
                  {snapshot?.domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label htmlFor="idea-project">关联项目</label>
                <select
                  id="idea-project"
                  value={draft.projectId ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, projectId: event.target.value })
                  }
                >
                  <option value="">未关联项目</option>
                  {snapshot?.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : null}
          {entity === "event" ? (
            <>
              <div className="field-row">
                <TypedField
                  id="event-date"
                  label="日期"
                  hint="YYYY-MM-DD"
                  value={draft.date ?? ""}
                  onChange={(value) => setDraft({ ...draft, date: value })}
                />
                <TypedField
                  id="event-start"
                  label="开始"
                  hint="HH:mm"
                  value={draft.start ?? ""}
                  onChange={(value) => setDraft({ ...draft, start: value })}
                />
                <TypedField
                  id="event-end"
                  label="结束"
                  hint="HH:mm"
                  value={draft.end ?? ""}
                  onChange={(value) => setDraft({ ...draft, end: value })}
                />
              </div>
            </>
          ) : null}
          {entity === "project" ? (
            <TypedField
              id="project-deadline"
              label="截止日期"
              hint="YYYY-MM-DD，可选"
              value={draft.deadline ?? ""}
              onChange={(value) => setDraft({ ...draft, deadline: value })}
            />
          ) : null}
          {entity === "domain" ? (
            <div className="field-group">
              <label htmlFor="domain-stage">理解阶段</label>
              <select
                id="domain-stage"
                value={draft.stage ?? "1"}
                onChange={(event) =>
                  setDraft({ ...draft, stage: event.target.value })
                }
              >
                {stageLabels.map((item, index) => (
                  <option key={item} value={index + 1}>
                    {index + 1} · {item}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
          {entity === "knowledgeNote" ? (
            <>
              <div className="field-row field-row--two">
                <div className="field-group">
                  <label htmlFor="knowledge-kind">条目类型</label>
                  <select
                    id="knowledge-kind"
                    value={draft.kind ?? "insight"}
                    onChange={(event) =>
                      setDraft({ ...draft, kind: event.target.value })
                    }
                  >
                    <option value="insight">核心认知</option>
                    <option value="branch">知识分支</option>
                    <option value="stage">阶段总结</option>
                    <option value="note">普通笔记</option>
                  </select>
                </div>
                <div className="field-group">
                  <label htmlFor="knowledge-domain">所属领域</label>
                  <select
                    id="knowledge-domain"
                    value={draft.domainId ?? ""}
                    onChange={(event) =>
                      setDraft({ ...draft, domainId: event.target.value })
                    }
                  >
                    <option value="">
                      {draft.kind === "note" ? "跨领域" : "选择领域"}
                    </option>
                    {snapshot?.domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {draft.kind === "stage" ? (
                <div className="field-group">
                  <label htmlFor="knowledge-stage">对应阶段</label>
                  <select
                    id="knowledge-stage"
                    value={draft.stage ?? "1"}
                    onChange={(event) =>
                      setDraft({ ...draft, stage: event.target.value })
                    }
                  >
                    {stageLabels.map((item, index) => (
                      <option key={item} value={index + 1}>
                        {index + 1} · {item}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </>
          ) : null}
          {entity === "learningLog" ? (
            <>
              <div className="field-group">
                <label htmlFor="log-domain">学习领域</label>
                <select
                  id="log-domain"
                  value={draft.domainId ?? ""}
                  onChange={(event) =>
                    setDraft({ ...draft, domainId: event.target.value })
                  }
                >
                  <option value="">选择领域</option>
                  {snapshot?.domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-row">
                <TypedField
                  id="log-date"
                  label="日期"
                  hint="YYYY-MM-DD"
                  value={draft.occurredDate ?? ""}
                  onChange={(value) =>
                    setDraft({ ...draft, occurredDate: value })
                  }
                />
                <TypedField
                  id="log-minutes"
                  label="投入时间"
                  hint="分钟"
                  value={draft.minutes ?? "45"}
                  onChange={(value) => setDraft({ ...draft, minutes: value })}
                />
              </div>
            </>
          ) : null}
          {entity === "task" ? (
            <>
              {draft.projectId ? (
                <div className="editor-context" role="status">
                  <span>所属项目</span>
                  <strong>
                    {snapshot?.projects.find(
                      (project) => project.id === draft.projectId,
                    )?.title ?? "当前项目"}
                  </strong>
                </div>
              ) : null}
              {draft.projectId ? (
                <TypedField
                  id="task-due-date"
                  label="子目标 DDL"
                  hint="YYYY-MM-DD，可选"
                  value={draft.dueDate ?? ""}
                  onChange={(value) => setDraft({ ...draft, dueDate: value })}
                />
              ) : (
                <div className="field-row">
                  <TypedField
                    id="task-planned-date"
                    label="行动日期"
                    hint="从哪天开始进入行动栏"
                    value={draft.plannedDate ?? ""}
                    onChange={(value) =>
                      setDraft({ ...draft, plannedDate: value })
                    }
                  />
                  <TypedField
                    id="task-due-date"
                    label="任务 DDL"
                    hint="YYYY-MM-DD，可选"
                    value={draft.dueDate ?? ""}
                    onChange={(value) =>
                      setDraft({ ...draft, dueDate: value })
                    }
                  />
                </div>
              )}
            </>
          ) : null}
          <div className="field-group">
            <label htmlFor="editor-notes">
              {entity === "domain"
                ? "当前理解"
                : entity === "project"
                  ? "项目笔记"
                  : entity === "task" && draft.projectId
                    ? "子目标说明"
                    : entity === "knowledgeNote"
                      ? "内容"
                      : "笔记"}
            </label>
            <textarea
              className="resize-none"
              id="editor-notes"
              rows={4}
              value={draft.note ?? draft.description ?? draft.summary ?? ""}
              onChange={(event) =>
                setDraft({
                  ...draft,
                  ...(entity === "project"
                    ? { description: event.target.value }
                    : entity === "domain"
                      ? { summary: event.target.value }
                      : { note: event.target.value }),
                })
              }
              placeholder="补充必要的上下文，不必一次写完。"
            />
          </div>
          {entity === "domain" ? (
            <div className="field-group">
              <label htmlFor="editor-next">下一步</label>
              <input
                id="editor-next"
                value={draft.nextStep ?? ""}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    nextStep: event.target.value,
                  })
                }
                placeholder="写下一个具体行动…"
              />
            </div>
          ) : null}
          {error ? (
            <div id="editor-error" className="form-error" role="alert">
              {error}
            </div>
          ) : (
            <div className="form-error form-error--empty" aria-hidden="true" />
          )}
          <footer>
            {onDelete ? (
              <button
                className="button button--outline editor-delete-action"
                type="button"
                onClick={onDelete}
                disabled={saving}
              >
                删除
              </button>
            ) : null}
            <button
              className="button button--outline"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              取消
            </button>
            <button
              className="button button--primary"
              type="submit"
              disabled={saving}
            >
              {saving
                ? editing
                  ? "正在保存…"
                  : "正在创建…"
                : editing
                  ? "保存更改"
                  : `创建${label}`}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function SearchDialog({
  snapshot,
  query,
  setQuery,
  onClose,
  onNavigate,
}: {
  snapshot: Snapshot | null;
  query: string;
  setQuery: (value: string) => void;
  onClose: () => void;
  onNavigate: (view: ViewKey) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, inputRef, onClose);
  const normalized = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!snapshot || !normalized) return [];
    return [
      ...snapshot.projects.map((item) => ({
        id: item.id,
        title: item.title,
        meta: "项目",
        view: "projects" as ViewKey,
      })),
      ...snapshot.tasks.map((item) => ({
        id: item.id,
        title: item.title,
        meta: "任务",
        view: "projects" as ViewKey,
      })),
      ...snapshot.domains.map((item) => ({
        id: item.id,
        title: item.title,
        meta: "学习领域",
        view: "learning" as ViewKey,
      })),
      ...snapshot.ideas.map((item) => ({
        id: item.id,
        title: item.title,
        meta: item.type === "question" ? "疑问" : "Idea",
        view: "ideas" as ViewKey,
      })),
      ...snapshot.events.map((item) => ({
        id: item.id,
        title: item.title,
        meta: "日程",
        view: "calendar" as ViewKey,
      })),
    ]
      .filter((item) => item.title.toLowerCase().includes(normalized))
      .slice(0, 12);
  }, [normalized, snapshot]);
  return (
    <div
      className="modal-backdrop modal-backdrop--command"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="command-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
      >
        <h2 id="search-title" className="sr-only">
          全局搜索
        </h2>
        <div className="command-input">
          <span aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event: ReactKeyboardEvent<HTMLInputElement>) => {
              if (
                event.key === "Enter" &&
                !event.nativeEvent.isComposing &&
                results.length === 1
              )
                onNavigate(results[0].view);
            }}
            placeholder="搜索任务、项目、领域或问题…"
            aria-label="全局搜索"
          />
          {query ? (
            <button
              type="button"
              aria-label="清除搜索"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              ×
            </button>
          ) : null}
          <kbd>ESC</kbd>
        </div>
        <div className="command-results" role="status">
          {!query ? (
            <p className="command-hint">输入关键词搜索全部工作台内容</p>
          ) : results.length ? (
            results.map((result) => (
              <button
                type="button"
                key={`${result.meta}-${result.id}`}
                onClick={() => onNavigate(result.view)}
              >
                <span>{result.title}</span>
                <small>{result.meta}</small>
              </button>
            ))
          ) : (
            <EmptyState
              title="没有匹配结果"
              description="尝试更短的关键词，或清除搜索。"
              action="清除搜索"
              onAction={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({
  tone = "warning",
  mark = "归",
  title,
  description,
  confirmLabel,
  savingLabel = "正在归档…",
  error = "",
  saving,
  onCancel,
  onConfirm,
}: {
  tone?: "warning" | "danger";
  mark?: string;
  title: string;
  description: string;
  confirmLabel: string;
  savingLabel?: string;
  error?: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogFocus(dialogRef, cancelRef, onCancel);
  return (
    <div className="modal-backdrop">
      <div
        ref={dialogRef}
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
      >
        <span className={`confirm-mark confirm-mark--${tone}`} aria-hidden="true">
          {mark}
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p id="confirm-description">{description}</p>
        {error ? (
          <div className="confirm-error" role="alert">
            {error}
          </div>
        ) : null}
        <div>
          <button
            ref={cancelRef}
            className="button button--outline"
            type="button"
            onClick={onCancel}
            disabled={saving}
          >
            取消
          </button>
          <button
            className={`button button--${tone}`}
            type="button"
            onClick={onConfirm}
            disabled={saving}
          >
            {saving ? savingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function useDialogFocus(
  dialogRef: React.RefObject<HTMLDivElement | null>,
  initialRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
  active = true,
) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!active) return;
    const prior = document.activeElement as HTMLElement | null;
    const backgrounds = Array.from(
      document.querySelectorAll<HTMLElement>(
        ".workspace-frame, .sidebar, .mobile-nav",
      ),
    );
    backgrounds.forEach((background) => background.setAttribute("inert", ""));
    window.setTimeout(() => initialRef.current?.focus(), 0);
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])",
        ),
      );
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      backgrounds.forEach((background) => background.removeAttribute("inert"));
      prior?.focus();
    };
  }, [active, dialogRef, initialRef]);
}

function TypedField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="field-group">
      <label htmlFor={id}>
        {label}
        <span>{hint}</span>
      </label>
      <input
        id={id}
        value={value}
        inputMode="numeric"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function LoadingRegion() {
  return (
    <div className="loading-region" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>正在整理工作台…</p>
    </div>
  );
}
function EmptyState({
  title,
  description,
  action,
  onAction,
}: {
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="empty-state">
      <span aria-hidden="true">○</span>
      <strong>{title}</strong>
      <p>{description}</p>
      {action && onAction ? (
        <button className="text-button" type="button" onClick={onAction}>
          {action}
        </button>
      ) : null}
    </div>
  );
}
function StageMeter({ stage }: { stage: number }) {
  return (
    <div className="stage-meter" aria-label={`理解阶段 ${stage} / 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < stage ? "is-filled" : ""} />
      ))}
    </div>
  );
}

function entityLabel(entity: EntityName) {
  return {
    project: "项目",
    task: "任务",
    domain: "学习领域",
    idea: "线索",
    event: "日程",
    learningLog: "学习记录",
    knowledgeNote: "认知条目",
  }[entity];
}
function knowledgeNoteKindLabel(kind: KnowledgeNote["kind"]) {
  return {
    insight: "核心认知",
    branch: "知识分支",
    stage: "阶段总结",
    note: "笔记",
  }[kind];
}
function localDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
function taskAppearsInToday(task: Task, todayKey: string) {
  const plannedDate = task.plannedDate ?? "";
  const dueDate = task.dueDate ?? "";
  const timedForToday = Boolean(
    task.startAt && localDateKey(new Date(task.startAt)) === todayKey,
  );
  const explicitlyToday = plannedDate === todayKey || dueDate === todayKey;
  const hasStarted = plannedDate
    ? plannedDate <= todayKey
    : Boolean(dueDate && dueDate <= todayKey);

  return (
    timedForToday ||
    explicitlyToday ||
    (task.status !== "done" && hasStarted)
  );
}
function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}
function formatShortDate(value: string) {
  const [, month = "", day = ""] = value.split("-");
  return month && day ? `${Number(month)}月${Number(day)}日` : value;
}
function formatTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}
function formatMonthDay(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
function formatRelative(value: string) {
  const minutes = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / 60_000),
  );
  return minutes < 1
    ? "刚刚"
    : minutes < 60
      ? `${minutes} 分钟前`
      : `${Math.round(minutes / 60)} 小时前`;
}
function parseShanghaiDateTime(date: string, time: string) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date || "") ||
    !/^\d{2}:\d{2}$/.test(time || "")
  )
    return null;
  const value = new Date(`${date}T${time}:00+08:00`);
  return Number.isNaN(value.getTime()) ? null : value.toISOString();
}
function clockLabel(minutes: number) {
  const bounded = Math.max(0, Math.min(24 * 60, minutes));
  const hour = Math.floor(bounded / 60);
  const minute = bounded % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}
function eventDraft(date: string, requestedMinute: number): EditorDraft {
  const startMinute = Math.max(8 * 60, Math.min(23 * 60, requestedMinute));
  return {
    date,
    start: clockLabel(startMinute),
    end: clockLabel(startMinute + 60),
  };
}
function shanghaiClockMinutes(value: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Shanghai",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value ?? 0,
  );
  return hour * 60 + minute;
}
function nowPosition(now: number) {
  const minute = shanghaiClockMinutes(new Date(now));
  if (minute < 8 * 60) return null;
  return `${Math.min(100, ((minute - 8 * 60) / (16 * 60)) * 100)}%`;
}
function eventGeometry(event: CalendarEvent) {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  const startMinute = shanghaiClockMinutes(start);
  const top = Math.max(
    0,
    Math.min(100, ((startMinute - 8 * 60) / (16 * 60)) * 100),
  );
  const duration = Math.max(30, (end.getTime() - start.getTime()) / 60_000);
  return {
    top: `${top}%`,
    height: `${Math.max(3.125, Math.min(100 - top, (duration / (16 * 60)) * 100))}%`,
  };
}

function layoutCalendarDayEvents(events: CalendarEvent[]) {
  const laneEnds: number[] = [];
  const positioned = [...events]
    .sort(
      (left, right) =>
        new Date(left.startAt).getTime() - new Date(right.startAt).getTime(),
    )
    .map((event) => {
      const start = new Date(event.startAt).getTime();
      const end = Math.max(start + 30 * 60_000, new Date(event.endAt).getTime());
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(end);
      } else {
        laneEnds[lane] = end;
      }
      return { event, lane };
    });
  const laneCount = Math.max(1, laneEnds.length);
  return positioned.map((item) => ({ ...item, laneCount }));
}

function useCurrentTime() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);
  return now;
}
function weekDays(date: Date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date(monday);
    value.setDate(monday.getDate() + index);
    const key = localDateKey(value);
    return {
      key,
      weekday: new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        weekday: "short",
      }).format(value),
      day: new Intl.DateTimeFormat("zh-CN", {
        timeZone: "Asia/Shanghai",
        day: "numeric",
      }).format(value),
      isToday: key === localDateKey(new Date()),
    };
  });
}

/* Timetable ---------------------------------------------------------------- */

const FALLBACK_PERIOD_TIMES: CoursePeriod[] = [
  ["08:00", "08:45"], ["08:55", "09:40"],
  ["10:00", "10:45"], ["10:55", "11:40"],
  ["12:00", "12:45"], ["12:55", "13:40"],
  ["13:55", "14:40"], ["14:50", "15:35"],
  ["15:55", "16:40"], ["16:50", "17:35"],
  ["18:30", "19:15"], ["19:25", "20:10"], ["20:20", "21:05"],
].map(([start, end], index) => ({ index: index + 1, start, end }));

function periodTimesOf(settings: Settings | undefined) {
  const rows = settings?.periodTimes ?? [];
  return rows.length ? rows : FALLBACK_PERIOD_TIMES;
}
function activeSemesterOf(snapshot: Snapshot | null): Semester | null {
  if (!snapshot) return null;
  const semesters = snapshot.semesters ?? [];
  if (!semesters.length) return null;
  return (
    semesters.find((item) => item.id === snapshot.activeSemesterId) ??
    semesters[semesters.length - 1]
  );
}
function semesterWeekAt(semester: Semester, dateKey: string) {
  const start = Date.parse(`${semester.startDate}T00:00:00Z`);
  const day = Date.parse(`${dateKey}T00:00:00Z`);
  const week = Math.floor((day - start) / 86_400_000 / 7) + 1;
  return { week, inTerm: week >= 1 && week <= semester.weekCount };
}
function isoWeekdayOf(dateKey: string) {
  const day = new Date(`${dateKey}T00:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}
function addDaysToKey(dateKey: string, amount: number) {
  const value = new Date(`${dateKey}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + amount);
  return value.toISOString().slice(0, 10);
}
function mondayKeyOf(dateKey: string) {
  return addDaysToKey(dateKey, 1 - isoWeekdayOf(dateKey));
}
function clockMinutesOf(value: string) {
  const [hour = "0", minute = "0"] = value.split(":");
  return Number(hour) * 60 + Number(minute);
}
/** Every timetable occurrence on one calendar day, resolved against the semester week. */
function sessionsForDate(snapshot: Snapshot | null, dateKey: string): CourseSession[] {
  const semester = activeSemesterOf(snapshot);
  if (!snapshot || !semester) return [];
  const { week, inTerm } = semesterWeekAt(semester, dateKey);
  if (!inTerm) return [];
  const weekday = isoWeekdayOf(dateKey);
  const periods = periodTimesOf(snapshot.settings);
  const courses = new Map(
    snapshot.courses
      .filter((course) => course.semesterId === semester.id)
      .map((course) => [course.id, course]),
  );
  return (snapshot.courseSlots ?? [])
    .filter(
      (slot) => slot.weekday === weekday && slot.weeks.includes(week) && courses.has(slot.courseId),
    )
    .map((slot) => {
      const course = courses.get(slot.courseId) as Course;
      const start = periods[slot.startPeriod - 1]?.start ?? "08:00";
      const end = periods[slot.endPeriod - 1]?.end ?? start;
      return {
        slotId: slot.id,
        courseId: course.id,
        dateKey,
        title: course.name,
        teacher: course.teacher,
        location: slot.location,
        color: course.color,
        start,
        end,
        startMinute: clockMinutesOf(start),
        endMinute: Math.max(clockMinutesOf(start) + 45, clockMinutesOf(end)),
        periods:
          slot.startPeriod === slot.endPeriod
            ? `第 ${slot.startPeriod} 节`
            : `第 ${slot.startPeriod}–${slot.endPeriod} 节`,
      } satisfies CourseSession;
    })
    .sort((left, right) => left.startMinute - right.startMinute);
}
/** Unfinished tasks whose DDL falls inside the next `days` calendar days. */
function upcomingDeadlines(tasks: Task[], fromKey: string, days: number) {
  const limit = addDaysToKey(fromKey, days);
  return tasks
    .filter(
      (task) =>
        task.status !== "done" && task.dueDate && task.dueDate >= fromKey && task.dueDate <= limit,
    )
    .sort((left, right) => String(left.dueDate).localeCompare(String(right.dueDate)));
}
function hoursUntilDate(dueDate: string, now: number) {
  const due = Date.parse(`${dueDate}T23:59:00+08:00`);
  return (due - now) / 3_600_000;
}
function blockGeometryFromMinutes(startMinute: number, endMinute: number) {
  const top = Math.max(0, Math.min(100, ((startMinute - 8 * 60) / (16 * 60)) * 100));
  const duration = Math.max(20, endMinute - startMinute);
  return {
    top: `${top}%`,
    height: `${Math.max(3.125, Math.min(100 - top, (duration / (16 * 60)) * 100))}%`,
  };
}
/** Lane layout for overlapping blocks inside one weekday column. */
function layoutTimetableDay(slots: Array<CourseSlot & { course: Course }>) {
  const laneEnds: number[] = [];
  const positioned = [...slots]
    .sort((left, right) => left.startPeriod - right.startPeriod)
    .map((slot) => {
      let lane = laneEnds.findIndex((laneEnd) => laneEnd <= slot.startPeriod);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(slot.endPeriod + 1);
      } else {
        laneEnds[lane] = slot.endPeriod + 1;
      }
      return { slot, lane };
    });
  const laneCount = Math.max(1, laneEnds.length);
  return positioned.map((item) => ({ ...item, laneCount }));
}
function courseWeekLabel(slot: CourseSlot) {
  const weeks = [...slot.weeks].sort((left, right) => left - right);
  if (!weeks.length) return "未设置周次";
  if (weeks.length === 1) return `第 ${weeks[0]} 周`;
  const isContiguous = weeks.every(
    (week, index) => index === 0 || week === weeks[index - 1] + 1,
  );
  const parity = weeks.length > 2 && weeks.every((week) => week % 2 === weeks[0] % 2);
  if (isContiguous) return `第 ${weeks[0]}–${weeks[weeks.length - 1]} 周`;
  if (parity) return `第 ${weeks[0]}–${weeks[weeks.length - 1]} 周（${weeks[0] % 2 ? "单" : "双"}周）`;
  return weeks.map((week) => `第 ${week} 周`).join("、");
}

