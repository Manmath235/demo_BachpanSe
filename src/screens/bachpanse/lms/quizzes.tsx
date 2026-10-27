import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { todayISO } from "@/lib/bachpanse/format";
import type { Quiz, QuizQuestionData } from "@/lib/bachpanse/content";
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
} from "./ui";
import { cn } from "@/lib/utils";

const newQuizId = () => "q-" + Math.random().toString(36).slice(2, 8);

const blankQuestion = (): QuizQuestionData => ({
  q: "",
  options: ["", ""],
  answer: -1,
  explain: "",
});

function blankQuiz(lessonId: string): Quiz {
  return {
    id: newQuizId(),
    lessonId,
    passMark: 2,
    questions: [blankQuestion()],
    status: "draft",
  };
}

/* ---------- Quizzes list ---------- */
export function QuizzesPage() {
  const data = useApp((s) => s.data);
  const show = useToast((s) => s.show);
  const openQuizEditor = useLmsUi((s) => s.openQuizEditor);
  const quizDraft = useLmsUi((s) => s.quizDraft);
  const loading = useListSkeleton();

  const [deleteTarget, setDeleteTarget] = useState<Quiz | null>(null);

  const lessonById = new Map(data.content.lessons.map((l) => [l.id, l]));
  const quizzes = [...data.content.quizzes].filter((q) => lessonById.has(q.lessonId));

  if (quizDraft) return <QuizEditor />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHead
        title="Quizzes"
        subtitle={`${quizzes.length} quizzes · one per lesson`}
        action={
          <LmsButton onClick={() => openQuizEditor(blankQuiz(data.content.lessons[0]?.id ?? ""))}>
            <Plus className="h-4 w-4" /> New quiz
          </LmsButton>
        }
      />
      {loading ? (
        <div className="rounded-xl border border-border bg-white">
          <SkeletonRows cols={6} />
        </div>
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>Quiz</Th>
              <Th className="w-[240px]">Linked lesson</Th>
              <Th className="w-[130px]">Questions</Th>
              <Th className="w-[130px]">Pass mark</Th>
              <Th className="w-[120px]">Status</Th>
              <Th className="w-[110px]">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((q) => {
              const lesson = lessonById.get(q.lessonId);
              return (
                <Tr key={q.id}>
                  <Td className="font-bold text-foreground">Quiz · {lesson?.title ?? "Unknown"}</Td>
                  <Td className="truncate">{lesson?.title}</Td>
                  <Td>{q.questions.length}</Td>
                  <Td>
                    {q.passMark} of {q.questions.length}
                  </Td>
                  <Td><StatusPill status={q.status} /></Td>
                  <Td>
                    <LmsButton variant="outline" size="sm" onClick={() => openQuizEditor(q)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </LmsButton>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}

      <CenterDialog
        open={deleteTarget !== null}
        title="Delete this quiz?"
        actions={
          <>
            <LmsButton variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</LmsButton>
            <LmsButton
              variant="danger"
              onClick={() => {
                if (deleteTarget) useApp.getState().deleteQuiz(deleteTarget.id);
                setDeleteTarget(null);
                show("Quiz deleted", "🗑️");
              }}
            >
              Delete
            </LmsButton>
          </>
        }
      >
        The quiz for "{deleteTarget && lessonById.get(deleteTarget.lessonId)?.title}" will be removed.
      </CenterDialog>
    </div>
  );
}

/* ---------- Quiz editor ---------- */
export function QuizEditor() {
  const data = useApp((s) => s.data);
  const addQuiz = useApp((s) => s.addQuiz);
  const updateQuiz = useApp((s) => s.updateQuiz);
  const show = useToast((s) => s.show);

  const draft = useLmsUi((s) => s.quizDraft)!;
  const dirty = useLmsUi((s) => s.quizDirty);
  const error = useLmsUi((s) => s.quizError);
  const leaveAsk = useLmsUi((s) => s.quizLeaveAsk);
  const patch = useLmsUi((s) => s.patchQuizDraft);
  const close = useLmsUi((s) => s.closeQuizEditor);
  const askLeave = useLmsUi((s) => s.askLeaveQuiz);
  const cancelLeave = useLmsUi((s) => s.cancelLeaveQuiz);

  const lessons = [...data.content.lessons].sort(
    (a, b) => a.moduleId - b.moduleId || a.order - b.order
  );
  const isNew = !data.content.quizzes.some((q) => q.id === draft.id);

  const setQuestion = (i: number, question: QuizQuestionData) =>
    patch({ questions: draft.questions.map((old, j) => (j === i ? question : old)) });
  const addQuestion = () => patch({ questions: [...draft.questions, blankQuestion()] });
  const delQuestion = (i: number) => patch({ questions: draft.questions.filter((_, j) => j !== i) });
  const moveQuestion = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= draft.questions.length) return;
    const questions = [...draft.questions];
    [questions[i], questions[j]] = [questions[j]!, questions[i]!];
    patch({ questions });
  };

  const validate = (): string => {
    for (let i = 0; i < draft.questions.length; i++) {
      const question = draft.questions[i]!;
      if (question.answer < 0 || question.answer >= question.options.length)
        return `Mark the correct answer for question ${i + 1}`;
      if (!question.q.trim()) return `Write the question text for question ${i + 1}`;
      if (question.options.filter((o) => o.trim()).length < 2)
        return `Give at least two answer options for question ${i + 1}`;
      if (!question.explain.trim())
        return `Write the explanation shown to the child for question ${i + 1}`;
    }
    if (!draft.lessonId) return "Link the quiz to a lesson";
    return "";
  };

  const save = (status: "draft" | "published") => {
    if (status === "published") {
      const err = validate();
      if (err) {
        useLmsUi.setState({ quizError: err });
        return;
      }
    }
    const next: Quiz = { ...draft, status };
    if (isNew) addQuiz(next);
    else updateQuiz(next.id, next);
    close();
    show(status === "published" ? "Published. Switch to Mobile App to see it in the child's Learn tab." : "Saved as draft", status === "published" ? "🚀" : "💾");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 pb-3">
        <LmsButton variant="ghost" size="sm" onClick={() => (dirty ? askLeave() : close())}>
          ← Back to quizzes
        </LmsButton>
        {dirty && (
          <span className="flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1 text-[11px] font-bold text-foreground">
            <span className="h-2 w-2 rounded-full bg-sunny" /> Unsaved changes
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-coral/40 bg-coral-soft px-4 py-2.5 text-[13px] font-bold text-coral">
          {error}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-primary/80">Quiz setup</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Linked lesson">
              <Select
                value={draft.lessonId}
                onChange={(v) => patch({ lessonId: v })}
                options={lessons.map((l) => ({ value: l.id, label: l.title }))}
              />
            </Field>
            <Field label={`Pass mark (of ${draft.questions.length})`}>
              <Select
                value={String(draft.passMark)}
                onChange={(v) => patch({ passMark: Number(v) })}
                options={Array.from({ length: Math.max(1, draft.questions.length) }, (_, i) => ({
                  value: String(i + 1),
                  label: `${i + 1} of ${draft.questions.length}`,
                }))}
              />
            </Field>
          </div>
        </div>

        {draft.questions.map((question, i) => (
          <div key={i} className="rounded-xl border border-border bg-white p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[12px] font-extrabold text-muted-foreground">Question {i + 1}</span>
              <span className="flex items-center gap-1">
                <ReorderButtons
                  onUp={() => moveQuestion(i, -1)}
                  onDown={() => moveQuestion(i, 1)}
                  disableUp={i === 0}
                  disableDown={i === draft.questions.length - 1}
                />
                <button
                  onClick={() => delQuestion(i)}
                  disabled={draft.questions.length <= 1}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-coral hover:bg-coral-soft disabled:opacity-30"
                  aria-label="Delete question"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            <Field label="Question text">
              <TextInput
                value={question.q}
                onChange={(e) => setQuestion(i, { ...question, q: e.target.value })}
                placeholder="What do you want to ask?"
              />
            </Field>
            <div className="mt-3 space-y-2">
              <span className="block text-[12px] font-bold">Answer options — tap the circle to mark the correct one</span>
              {question.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <button
                    onClick={() => setQuestion(i, { ...question, answer: oi })}
                    aria-label={`Mark option ${oi + 1} correct`}
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      question.answer === oi ? "border-mint bg-mint" : "border-border bg-white hover:border-primary/40"
                    )}
                  >
                    {question.answer === oi && <span className="h-2 w-2 rounded-full bg-white" />}
                  </button>
                  <TextInput
                    value={o}
                    onChange={(e) =>
                      setQuestion(i, {
                        ...question,
                        options: question.options.map((old, k) => (k === oi ? e.target.value : old)),
                      })
                    }
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      onClick={() => {
                        const options = question.options.filter((_, k) => k !== oi);
                        setQuestion(i, {
                          ...question,
                          options,
                          ...(question.answer === oi
                            ? { answer: -1 }
                            : question.answer > oi
                              ? { answer: question.answer - 1 }
                              : {}),
                        });
                      }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-coral hover:bg-coral-soft"
                      aria-label="Remove option"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {question.options.length < 4 && (
                <LmsButton
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setQuestion(i, { ...question, options: [...question.options, ""] })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add option
                </LmsButton>
              )}
            </div>
            <div className="mt-3">
              <Field label="Explanation shown to the child after answering">
                <TextArea
                  value={question.explain}
                  onChange={(e) => setQuestion(i, { ...question, explain: e.target.value })}
                  placeholder="A short, friendly explanation"
                />
              </Field>
            </div>
          </div>
        ))}

        <LmsButton variant="outline" onClick={addQuestion}>
          <Plus className="h-4 w-4" /> Add question
        </LmsButton>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-border bg-white px-4 py-3">
        <span className="text-[12px] font-semibold text-muted-foreground">
          {isNew ? "New quiz" : "Editing quiz"}
        </span>
        <div className="flex gap-2">
          <LmsButton variant="outline" onClick={() => save("draft")}>Save as draft</LmsButton>
          <LmsButton onClick={() => save("published")}>Publish</LmsButton>
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
        You have unsaved changes in this quiz. They will be lost if you leave now.
      </CenterDialog>
    </div>
  );
}
