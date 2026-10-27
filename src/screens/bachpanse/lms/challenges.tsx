import { Plus, Pencil, Trash2, Info } from "lucide-react";
import { useApp, useToast, useComingSoon } from "@/lib/bachpanse/store";
import type { Challenge, Scenario, ScenarioOption, ShopItem } from "@/lib/bachpanse/content";
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
  SkeletonRows,
  useListSkeleton,
} from "./ui";
import { cn } from "@/lib/utils";

/* ---------- Challenges list ---------- */
export function ChallengesPage() {
  const data = useApp((s) => s.data);
  const openChallengeEditor = useLmsUi((s) => s.openChallengeEditor);
  const challengeDraft = useLmsUi((s) => s.challengeDraft);
  const comingSoon = useComingSoon((s) => s.openSheet);
  const loading = useListSkeleton();

  const moduleById = new Map(data.content.modules.map((m) => [m.id, m]));
  const challenges = [...data.content.challenges];

  if (challengeDraft) return <ChallengeEditor />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-start gap-2 rounded-xl border border-sunny bg-sunny-soft px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
        <p className="text-[13px] font-bold text-foreground">
          Practice coins are not real money and do not affect the child's wallet.
        </p>
      </div>
      <PageHead
        title="Challenges"
        subtitle="Practice money activities for the child app"
        action={
          <LmsButton onClick={() => comingSoon("More challenge types like 'Detect the scam' come in a later phase!")}>
            <Plus className="h-4 w-4" /> New challenge
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
              <Th>Challenge</Th>
              <Th className="w-[150px]">Type</Th>
              <Th className="w-[190px]">Linked module</Th>
              <Th className="w-[150px]">Coin budget</Th>
              <Th className="w-[120px]">Status</Th>
              <Th className="w-[110px]">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {challenges.map((c) => (
              <Tr key={c.id}>
                <Td className="font-bold text-foreground">{c.name}</Td>
                <Td>{c.type === "shop" ? "Shop smart" : "Save or spend"}</Td>
                <Td className="truncate">{moduleById.get(c.moduleId)?.title ?? "—"}</Td>
                <Td>{c.type === "shop" ? `${c.budget} coins` : "—"}</Td>
                <Td><StatusPill status={c.status} /></Td>
                <Td>
                  <LmsButton variant="outline" size="sm" onClick={() => openChallengeEditor(c)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </LmsButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

/* ---------- Challenge editor ---------- */
export function ChallengeEditor() {
  const data = useApp((s) => s.data);
  const updateChallenge = useApp((s) => s.updateChallenge);
  const setChallengeStatus = useApp((s) => s.setChallengeStatus);
  const show = useToast((s) => s.show);

  const draft = useLmsUi((s) => s.challengeDraft)!;
  const dirty = useLmsUi((s) => s.challengeDirty);
  const leaveAsk = useLmsUi((s) => s.challengeLeaveAsk);
  const patch = useLmsUi((s) => s.patchChallengeDraft);
  const close = useLmsUi((s) => s.closeChallengeEditor);
  const askLeave = useLmsUi((s) => s.askLeaveChallenge);
  const cancelLeave = useLmsUi((s) => s.cancelLeaveChallenge);

  const modules = [...data.content.modules].sort((a, b) => a.order - b.order);

  const setItem = (i: number, item: ShopItem) =>
    patch({ items: draft.items.map((old, j) => (j === i ? item : old)) });
  const addItem = () =>
    patch({
      items: [
        ...draft.items,
        { id: "i-" + Math.random().toString(36).slice(2, 7), emoji: "🛍️", name: "", price: 50, need: false },
      ],
    });
  const delItem = (i: number) => patch({ items: draft.items.filter((_, j) => j !== i) });

  const setScenario = (i: number, s: Scenario) =>
    patch({ scenarios: draft.scenarios.map((old, j) => (j === i ? s : old)) });
  const addScenario = () =>
    patch({
      scenarios: [
        ...draft.scenarios,
        { emoji: "🤔", q: "", options: [{ text: "", good: true, outcome: "" }, { text: "", good: false, outcome: "" }] },
      ],
    });
  const delScenario = (i: number) => patch({ scenarios: draft.scenarios.filter((_, j) => j !== i) });

  const setOption = (si: number, oi: number, o: ScenarioOption) =>
    setScenario(si, {
      ...draft.scenarios[si]!,
      options: draft.scenarios[si]!.options.map((old, k) => (k === oi ? o : old)),
    });

  const save = (status: "draft" | "published") => {
    if (status === "published") setChallengeStatus(draft.id, "published");
    updateChallenge(draft.id, { ...draft, status });
    close();
    show(status === "published" ? "Published. Switch to Mobile App to see it in the child's Learn tab." : "Saved as draft", status === "published" ? "🚀" : "💾");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 pb-3">
        <LmsButton variant="ghost" size="sm" onClick={() => (dirty ? askLeave() : close())}>
          ← Back to challenges
        </LmsButton>
        {dirty && (
          <span className="flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1 text-[11px] font-bold text-foreground">
            <span className="h-2 w-2 rounded-full bg-sunny" /> Unsaved changes
          </span>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl border border-border bg-white p-4">
          <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-primary/80">
            {draft.type === "shop" ? "Shop smart" : "Save or spend"} · setup
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Challenge name">
              <TextInput value={draft.name} onChange={(e) => patch({ name: e.target.value })} />
            </Field>
            <Field label="Linked module">
              <Select
                value={String(draft.moduleId)}
                onChange={(v) => patch({ moduleId: Number(v) })}
                options={modules.map((m) => ({ value: String(m.id), label: m.title }))}
              />
            </Field>
            {draft.type === "shop" && (
              <Field label="Practice coin budget">
                <TextInput
                  type="number"
                  min={100}
                  value={draft.budget}
                  onChange={(e) => patch({ budget: Math.max(100, Number(e.target.value) || 100) })}
                />
              </Field>
            )}
          </div>
          <div className="mt-3">
            <Field label="Scoring message (shown in the child's result screen)">
              <TextArea value={draft.scoringMessage} onChange={(e) => patch({ scoringMessage: e.target.value })} />
            </Field>
          </div>
        </div>

        {draft.type === "shop" ? (
          <div className="rounded-xl border border-border bg-white p-4">
            <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-wide text-primary/80">
              Items ({draft.items.length}) — mark each as Need or Want
            </h3>
            <div className="space-y-2">
              {draft.items.map((item, i) => (
                <div key={item.id} className="flex items-center gap-2">
                  <span className="w-8 text-center text-[16px]">{item.emoji}</span>
                  <TextInput
                    value={item.name}
                    onChange={(e) => setItem(i, { ...item, name: e.target.value })}
                    placeholder="Item name"
                    className="flex-1"
                  />
                  <TextInput
                    type="number"
                    min={1}
                    value={item.price}
                    onChange={(e) => setItem(i, { ...item, price: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-[90px]"
                  />
                  <Select
                    className="w-[110px]"
                    value={item.need ? "need" : "want"}
                    onChange={(v) => setItem(i, { ...item, need: v === "need" })}
                    options={[
                      { value: "need", label: "Need" },
                      { value: "want", label: "Want" },
                    ]}
                  />
                  <button
                    onClick={() => delItem(i)}
                    disabled={draft.items.length <= 3}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-coral hover:bg-coral-soft disabled:opacity-30"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <LmsButton variant="outline" size="sm" className="mt-3" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" /> Add item
            </LmsButton>
          </div>
        ) : (
          <div className="space-y-3">
            {draft.scenarios.map((s, si) => (
              <div key={si} className="rounded-xl border border-border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[12px] font-extrabold text-muted-foreground">
                    Scenario {si + 1}
                  </span>
                  <button
                    onClick={() => delScenario(si)}
                    disabled={draft.scenarios.length <= 2}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-coral hover:bg-coral-soft disabled:opacity-30"
                    aria-label="Delete scenario"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  <TextInput
                    value={s.emoji}
                    onChange={(e) => setScenario(si, { ...s, emoji: e.target.value })}
                    className="w-[70px] text-center"
                    maxLength={4}
                  />
                  <TextArea
                    value={s.q}
                    onChange={(e) => setScenario(si, { ...s, q: e.target.value })}
                    placeholder="Situation the child faces…"
                  />
                </div>
                <div className="mt-3 space-y-2">
                  <span className="block text-[12px] font-bold">Choices — tap the circle to mark the smart one</span>
                  {s.options.map((o, oi) => (
                    <div key={oi} className="flex items-start gap-2">
                      <button
                        onClick={() =>
                          setScenario(si, {
                            ...s,
                            options: s.options.map((old, k) => ({ ...old, good: k === oi })),
                          })
                        }
                        aria-label={`Mark choice ${oi + 1} as the smart choice`}
                        className={cn(
                          "mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          o.good ? "border-mint bg-mint" : "border-border bg-white hover:border-primary/40"
                        )}
                      >
                        {o.good && <span className="h-2 w-2 rounded-full bg-white" />}
                      </button>
                      <div className="flex-1 space-y-1">
                        <TextInput
                          value={o.text}
                          onChange={(e) => setOption(si, oi, { ...o, text: e.target.value })}
                          placeholder={`Choice ${oi + 1}`}
                        />
                        <TextInput
                          value={o.outcome}
                          onChange={(e) => setOption(si, oi, { ...o, outcome: e.target.value })}
                          placeholder="Outcome text shown after choosing"
                          className="text-[12px]"
                        />
                      </div>
                      {s.options.length > 2 && (
                        <button
                          onClick={() =>
                            setScenario(si, {
                              ...s,
                              options: s.options.filter((_, k) => k !== oi),
                            })
                          }
                          className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-coral hover:bg-coral-soft"
                          aria-label="Remove choice"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {s.options.length < 3 && (
                    <LmsButton
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setScenario(si, {
                          ...s,
                          options: [...s.options, { text: "", good: false, outcome: "" }],
                        })
                      }
                    >
                      <Plus className="h-3.5 w-3.5" /> Add choice
                    </LmsButton>
                  )}
                </div>
              </div>
            ))}
            <LmsButton variant="outline" onClick={addScenario}>
              <Plus className="h-4 w-4" /> Add scenario
            </LmsButton>
          </div>
        )}
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-border bg-white px-4 py-3">
        <span className="text-[12px] font-semibold text-muted-foreground">Editing "{draft.name}"</span>
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
        You have unsaved changes in this challenge. They will be lost if you leave now.
      </CenterDialog>
    </div>
  );
}
