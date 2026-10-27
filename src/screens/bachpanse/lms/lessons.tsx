import { useState } from "react";
import {
  Plus,
  Pencil,
  Eye,
  Trash2,
  ArrowLeft,
  Upload,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { todayISO } from "@/lib/bachpanse/format";
import {
  AGE_BANDS,
  CARD_ARTS,
  type AgeBand,
  type LmsLesson,
  type StoryCardData,
} from "@/lib/bachpanse/content";
import { LessonArt } from "../child-learn";
import { useLmsUi } from "./state";
import {
  LmsButton,
  StatusPill,
  TableWrap,
  Th,
  Td,
  Tr,
  PageHead,
  CenterDialog,
  Field,
  TextInput,
  TextArea,
  Select,
  ReorderButtons,
  SkeletonRows,
  useListSkeleton,
  lmsInputCls,
} from "./ui";
import { cn } from "@/lib/utils";

const newLessonId = () => "l-" + Math.random().toString(36).slice(2, 8);

function blankLesson(moduleId: number, order: number): LmsLesson {
  return {
    id: newLessonId(),
    moduleId,
    order,
    title: "",
    emoji: "✨",
    description: "",
    minutes: 5,
    contentType: "story",
    cards: [{ title: "", text: "", art: "coin" }],
    videoName: "",
    videoDuration: "",
    status: "draft",
    updatedAt: todayISO(),
  };
}

/* ---------- Live phone preview ---------- */
export function PhoneLessonPreview({ lesson }: { lesson: LmsLesson }) {
  const [idx, setIdx] = useState(0);
  const cards = lesson.contentType === "story" ? lesson.cards : [];
  const safeIdx = Math.min(idx, Math.max(0, cards.length - 1));
  const card = cards[safeIdx];
  const last = lesson.contentType === "video" || safeIdx >= cards.length - 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex h-[540px] w-[248px] flex-col overflow-hidden rounded-[30px] border-[7px] border-foreground bg-background shadow-xl">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-[11px] font-bold text-primary">
            {lesson.emoji} {lesson.title || "Untitled lesson"}
          </span>
          <span className="rounded-full bg-violet-soft px-2 py-0.5 text-[9px] font-bold text-primary">
            {lesson.minutes} min
          </span>
        </div>
        {lesson.contentType === "story" && cards.length > 0 && (
          <div className="mt-2 flex justify-center gap-1">
            {cards.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 rounded-full transition-all",
                  i === safeIdx ? "w-4 bg-primary" : "w-1 bg-primary/25"
                )}
              />
            ))}
          </div>
        )}
        <div className="flex min-h-0 flex-1 items-center justify-center px-4">
          <div className="flex w-full flex-col items-center rounded-2xl bg-card p-4 text-center shadow-md">
            {lesson.contentType === "video" ? (
              <>
                <div className="flex h-[90px] w-[120px] items-center justify-center rounded-xl bg-violet-soft">
                  <Film className="h-10 w-10 text-primary" />
                </div>
                <h3 className="mt-3 line-clamp-2 font-display text-[15px] font-extrabold">
                  {lesson.title || "Video lesson"}
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {lesson.videoName ? `${lesson.videoName} · ${lesson.videoDuration}` : "No video uploaded yet"}
                </p>
              </>
            ) : card ? (
              <>
                <LessonArt art={card.art} />
                <h3 className="mt-3 line-clamp-2 font-display text-[16px] font-extrabold">
                  {card.title || "Card title"}
                </h3>
                <p className="mt-1.5 line-clamp-5 text-[12px] leading-relaxed text-muted-foreground">
                  {card.text || "Card text…"}
                </p>
              </>
            ) : (
              <p className="py-10 text-[12px] text-muted-foreground">Add a story card to preview it here.</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            onClick={() => setIdx(Math.max(0, safeIdx - 1))}
            disabled={safeIdx === 0}
            className="rounded-full bg-violet-soft px-3 py-1.5 text-[11px] font-bold text-primary disabled:opacity-40"
          >
            Back
          </button>
          <span className="text-[10px] font-bold text-muted-foreground">
            {lesson.contentType === "story" && cards.length > 0 ? `${safeIdx + 1} / ${cards.length}` : "Video"}
          </span>
          <button
            onClick={() => setIdx(safeIdx + 1)}
            disabled={last}
            className="rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-primary-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        Live preview — child's phone
      </p>
    </div>
  );
}

/* ---------- Lessons list ---------- */
export function LessonsPage() {
  const data = useApp((s) => s.data);
  const setLessonStatus = useApp((s) => s.setLessonStatus);
  const deleteLesson = useApp((s) => s.deleteLesson);
  const show = useToast((s) => s.show);
  const loading = useListSkeleton();

  const openLessonEditor = useLmsUi((s) => s.openLessonEditor);
  const lessonDraft = useLmsUi((s) => s.lessonDraft);

  const [q, setQ] = useState("");
  const [moduleF, setModuleF] = useState("all");
  const [ageF, setAgeF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<LmsLesson | null>(null);
  const [previewTarget, setPreviewTarget] = useState<LmsLesson | null>(null);

  const moduleById = new Map(data.content.modules.map((m) => [m.id, m]));
  const modules = [...data.content.modules].sort((a, b) => a.order - b.order);

  const lessons = data.content.lessons
    .map((l) => ({ l, m: moduleById.get(l.moduleId) }))
    .filter(({ m }) => m)
    .sort((a, b) => a.m!.order - b.m!.order || a.l.order - b.l.order)
    .filter(({ l, m }) => {
      if (q && !(`${l.title} ${l.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (moduleF !== "all" && l.moduleId !== Number(moduleF)) return false;
      if (ageF !== "all" && m!.ageBand !== ageF) return false;
      if (statusF !== "all" && l.status !== statusF) return false;
      return true;
    });

  if (lessonDraft) return <LessonEditor />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHead
        title="Lessons"
        subtitle={`${data.content.lessons.length} lessons · drafts never appear in the child app`}
        action={
          <LmsButton onClick={() => openLessonEditor("new", blankLesson(modules[0]?.id ?? 1, 1))}>
            <Plus className="h-4 w-4" /> New lesson
          </LmsButton>
        }
      />
      <div className="flex flex-wrap items-center gap-2 pb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search lessons…"
          className={cn(lmsInputCls, "w-[220px]")}
        />
        <Select
          className="w-[170px]"
          value={moduleF}
          onChange={setModuleF}
          options={[
            { value: "all", label: "All modules" },
            ...modules.map((m) => ({ value: String(m.id), label: m.title })),
          ]}
        />
        <Select
          className="w-[130px]"
          value={ageF}
          onChange={setAgeF}
          options={[{ value: "all", label: "All ages" }, ...AGE_BANDS.map((a) => ({ value: a, label: a }))]}
        />
        <Select
          className="w-[140px]"
          value={statusF}
          onChange={setStatusF}
          options={[
            { value: "all", label: "All statuses" },
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
          ]}
        />
      </div>
      {loading ? (
        <div className="rounded-xl border border-border bg-white">
          <SkeletonRows cols={7} />
        </div>
      ) : lessons.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-xl border border-border bg-white text-[13px] text-muted-foreground">
          No lessons match these filters.
        </div>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Lesson</Th>
              <Th className="w-[170px]">Module</Th>
              <Th className="w-[90px]">Age band</Th>
              <Th className="w-[150px]">Content type</Th>
              <Th className="w-[120px]">Status</Th>
              <Th className="w-[120px]">Updated</Th>
              <Th className="w-[250px]">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {lessons.map(({ l, m }) => (
              <Tr key={l.id}>
                <Td>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-[15px]">{l.emoji}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-foreground">{l.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{l.description}</span>
                    </span>
                  </span>
                </Td>
                <Td className="truncate">{m!.title}</Td>
                <Td>{m!.ageBand}</Td>
                <Td>{l.contentType === "story" ? "Animated story cards" : "Video"}</Td>
                <Td><StatusPill status={l.status} /></Td>
                <Td className="whitespace-nowrap text-[12px] text-muted-foreground">{l.updatedAt.slice(0, 10)}</Td>
                <Td>
                  <span className="flex items-center gap-1">
                    <LmsButton variant="outline" size="sm" onClick={() => openLessonEditor(l.id, l)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </LmsButton>
                    <LmsButton variant="ghost" size="sm" onClick={() => setPreviewTarget(l)}>
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </LmsButton>
                    {l.status === "published" ? (
                      <LmsButton variant="sunny" size="sm" onClick={() => { setLessonStatus(l.id, "draft"); show("Unpublished. Switch to Mobile App to see it in the child's Learn tab."); }}>
                        Unpublish
                      </LmsButton>
                    ) : (
                      <LmsButton size="sm" onClick={() => { setLessonStatus(l.id, "published"); show("Published. Switch to Mobile App to see it in the child's Learn tab.", "🚀"); }}>
                        Publish
                      </LmsButton>
                    )}
                    <LmsButton variant="danger" size="sm" onClick={() => setDeleteTarget(l)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </LmsButton>
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <CenterDialog
        open={deleteTarget !== null}
        title="Delete this lesson?"
        actions={
          <>
            <LmsButton variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</LmsButton>
            <LmsButton
              variant="danger"
              onClick={() => {
                if (deleteTarget) deleteLesson(deleteTarget.id);
                setDeleteTarget(null);
                show("Lesson deleted", "🗑️");
              }}
            >
              Delete
            </LmsButton>
          </>
        }
      >
        "{deleteTarget?.title}" and its quiz will be removed from the content library. This cannot be undone.
      </CenterDialog>

      <CenterDialog
        open={previewTarget !== null}
        title="Preview lesson"
        actions={<LmsButton onClick={() => setPreviewTarget(null)}>Close</LmsButton>}
      >
        {previewTarget && (
          <div className="flex justify-center">
            <PhoneLessonPreview lesson={previewTarget} />
          </div>
        )}
      </CenterDialog>
    </div>
  );
}

/* ---------- Lesson editor ---------- */
export function LessonEditor() {
  const data = useApp((s) => s.data);
  const addLesson = useApp((s) => s.addLesson);
  const updateLesson = useApp((s) => s.updateLesson);
  const show = useToast((s) => s.show);

  const draft = useLmsUi((s) => s.lessonDraft)!;
  const isNew = useLmsUi((s) => s.lessonIsNew);
  const dirty = useLmsUi((s) => s.lessonDirty);
  const leaveAsk = useLmsUi((s) => s.lessonLeaveAsk);
  const patch = useLmsUi((s) => s.patchLessonDraft);
  const close = useLmsUi((s) => s.closeLessonEditor);
  const askLeave = useLmsUi((s) => s.askLeaveLesson);
  const cancelLeave = useLmsUi((s) => s.cancelLeaveLesson);

  const [videoPct, setVideoPct] = useState<number | null>(null);
  const [videoTimer, setVideoTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const modules = [...data.content.modules].sort((a, b) => a.order - b.order);
  const moduleOf = modules.find((m) => m.id === draft.moduleId) ?? modules[0];
  const siblings = data.content.lessons.filter((l) => l.moduleId === draft.moduleId && l.id !== draft.id).length;

  const startUpload = (file: File) => {
    patch({ videoName: file.name, videoDuration: "0:42" });
    setVideoPct(0);
    if (videoTimer) clearInterval(videoTimer);
    const t = setInterval(() => {
      setVideoPct((p) => {
        if (p === null) return null;
        if (p >= 100) {
          clearInterval(t);
          setVideoTimer(null);
          return 100;
        }
        return Math.min(100, p + 7);
      });
    }, 90);
    setVideoTimer(t);
  };

  const removeVideo = () => {
    if (videoTimer) clearInterval(videoTimer);
    setVideoTimer(null);
    setVideoPct(null);
    patch({ videoName: "", videoDuration: "" });
  };

  const setCard = (i: number, c: StoryCardData) =>
    patch({ cards: draft.cards.map((old, j) => (j === i ? c : old)) });
  const addCard = () => patch({ cards: [...draft.cards, { title: "", text: "", art: "piggy" }] });
  const delCard = (i: number) => patch({ cards: draft.cards.filter((_, j) => j !== i) });
  const moveCard = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.cards.length) return;
    const cards = [...draft.cards];
    [cards[i], cards[j]] = [cards[j]!, cards[i]!];
    patch({ cards });
  };

  const save = (status: "draft" | "published") => {
    const next: LmsLesson = { ...draft, status, updatedAt: todayISO(), order: draft.order || siblings + 1 };
    if (isNew) addLesson(next);
    else updateLesson(next.id, next);
    close();
    show(status === "published" ? "Published. Switch to Mobile App to see it in the child's Learn tab." : "Saved as draft", status === "published" ? "🚀" : "💾");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 pb-3">
        <LmsButton
          variant="ghost"
          size="sm"
          onClick={() => (dirty ? askLeave() : close())}
        >
          <ArrowLeft className="h-4 w-4" /> Back to lessons
        </LmsButton>
        {dirty && (
          <span className="flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1 text-[11px] font-bold text-foreground">
            <span className="h-2 w-2 rounded-full bg-sunny" /> Unsaved changes
          </span>
        )}
      </div>
      <div className="flex min-h-0 flex-1 gap-4">
        {/* Form column */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-primary/80">Lesson details</h3>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Title">
                <TextInput value={draft.title} onChange={(e) => patch({ title: e.target.value })} placeholder="Lesson title" />
              </Field>
              <Field label="Emoji">
                <TextInput value={draft.emoji} onChange={(e) => patch({ emoji: e.target.value })} maxLength={4} />
              </Field>
              <Field label="Module">
                <Select
                  value={String(draft.moduleId)}
                  onChange={(v) => patch({ moduleId: Number(v), order: siblings + 1 })}
                  options={modules.map((m) => ({ value: String(m.id), label: m.title }))}
                />
              </Field>
              <Field label="Age band (from module)">
                <TextInput value={moduleOf?.ageBand ?? ""} disabled />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Short description">
                <TextArea value={draft.description} onChange={(e) => patch({ description: e.target.value })} placeholder="Shown under the lesson title in the child app" />
              </Field>
            </div>
            <div className="mt-3 w-[140px]">
              <Field label="Estimated time (minutes)">
                <TextInput
                  type="number"
                  min={1}
                  max={30}
                  value={draft.minutes}
                  onChange={(e) => patch({ minutes: Math.max(1, Number(e.target.value) || 1) })}
                />
              </Field>
            </div>
          </div>

          {/* Content type */}
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-primary/80">Content type</h3>
            <div className="flex gap-2">
              {(["story", "video"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => patch({ contentType: t })}
                  className={cn(
                    "flex-1 rounded-lg border-2 px-3 py-2.5 text-[13px] font-bold transition-colors",
                    draft.contentType === t
                      ? "border-primary bg-violet-soft text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {t === "story" ? "Animated story cards" : "Video"}
                </button>
              ))}
            </div>

            {draft.contentType === "story" ? (
              <div className="mt-4 space-y-3">
                {draft.cards.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border bg-background/60 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] font-extrabold text-muted-foreground">Card {i + 1}</span>
                      <span className="flex items-center gap-1">
                        <ReorderButtons
                          onUp={() => moveCard(i, -1)}
                          onDown={() => moveCard(i, 1)}
                          disableUp={i === 0}
                          disableDown={i === draft.cards.length - 1}
                        />
                        <button
                          onClick={() => delCard(i)}
                          disabled={draft.cards.length <= 1}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-coral hover:bg-coral-soft disabled:opacity-30"
                          aria-label="Delete card"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    </div>
                    {/* Illustration picker */}
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {CARD_ARTS.map((a) => (
                        <button
                          key={a.id}
                          title={a.label}
                          onClick={() => setCard(i, { ...c, art: a.id })}
                          className={cn(
                            "rounded-md border-2 bg-white p-0.5 transition-colors",
                            c.art === a.id ? "border-primary" : "border-border hover:border-primary/40"
                          )}
                        >
                          <div className="h-8 w-[52px] overflow-hidden rounded">
                            <div className="origin-top-left scale-[0.44]">
                              <LessonArt art={a.id} />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-[90px_1fr] gap-2">
                      <TextInput value={c.title} onChange={(e) => setCard(i, { ...c, title: e.target.value })} placeholder="Card title" />
                      <TextInput value={c.text} onChange={(e) => setCard(i, { ...c, text: e.target.value })} placeholder="What the child reads on this card" />
                    </div>
                  </div>
                ))}
                <LmsButton variant="outline" size="sm" onClick={addCard}>
                  <Plus className="h-3.5 w-3.5" /> Add card
                </LmsButton>
              </div>
            ) : (
              <div className="mt-4">
                {draft.videoName && videoPct === 100 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-3">
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg bg-violet-soft">
                      <Film className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-bold">{draft.videoName}</p>
                      <p className="text-[11px] text-muted-foreground">Duration {draft.videoDuration}</p>
                    </div>
                    <LmsButton variant="danger" size="sm" onClick={removeVideo}>Remove</LmsButton>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-violet-soft/30 px-4 py-8 text-center">
                    <Upload className="h-6 w-6 text-primary" />
                    <p className="mt-2 text-[13px] font-bold text-primary">
                      {videoPct !== null ? `Uploading… ${videoPct}%` : "Upload video"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">MP4 or WebM · demo only, nothing is really uploaded</p>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && startUpload(e.target.files[0])}
                    />
                  </label>
                )}
                {videoPct !== null && videoPct < 100 && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-soft">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-100"
                      style={{ width: `${videoPct}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview column */}
        <div className="hidden w-[300px] shrink-0 overflow-y-auto border-l border-border bg-muted/40 p-4 lg:block">
          <PhoneLessonPreview lesson={draft} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-border bg-white px-4 py-3">
        <span className="text-[12px] font-semibold text-muted-foreground">
          {isNew ? "New lesson" : `Editing "${draft.title}"`}
        </span>
        <div className="flex gap-2">
          <LmsButton variant="outline" onClick={() => save("draft")}>Save as draft</LmsButton>
          <LmsButton onClick={() => save("published")} disabled={!draft.title.trim()}>
            Publish
          </LmsButton>
        </div>
      </div>

      <CenterDialog
        open={leaveAsk}
        title="Leave without saving?"
        actions={
          <>
            <LmsButton variant="outline" onClick={cancelLeave}>Keep editing</LmsButton>
            <LmsButton variant="danger" onClick={close}>Discard changes</LmsButton>
          </>
        }
      >
        You have unsaved changes in this lesson. They will be lost if you leave now.
      </CenterDialog>
    </div>
  );
}
