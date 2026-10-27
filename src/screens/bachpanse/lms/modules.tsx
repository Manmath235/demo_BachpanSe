import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { AGE_BANDS, type AgeBand, type LmsModule } from "@/lib/bachpanse/content";
import {
  LmsButton,
  StatusPill,
  TableWrap,
  Th,
  Td,
  Tr,
  PageHead,
  SideDrawer,
  Field,
  TextInput,
  TextArea,
  Select,
  ReorderButtons,
  SkeletonRows,
  useListSkeleton,
} from "./ui";


export function ModulesPage() {
  const data = useApp((s) => s.data);
  const addModule = useApp((s) => s.addModule);
  const updateModule = useApp((s) => s.updateModule);
  const reorderModule = useApp((s) => s.reorderModule);
  const show = useToast((s) => s.show);
  const loading = useListSkeleton();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<LmsModule | null>(null);

  const modules = [...data.content.modules].sort((a, b) => a.order - b.order);
  const maxId = data.content.modules.reduce((a, m) => Math.max(a, m.id), 0);

  const openNew = () => {
    setDraft({
      id: maxId + 1,
      order: modules.length + 1,
      title: "",
      emoji: "📘",
      blurb: "",
      description: "",
      ageBand: "10–12",
      status: "draft",
    });
    setDrawerOpen(true);
  };
  const openEdit = (m: LmsModule) => {
    setDraft({ ...m });
    setDrawerOpen(true);
  };

  const save = () => {
    if (!draft || !draft.title.trim()) return;
    if (data.content.modules.some((m) => m.id === draft.id)) {
      updateModule(draft.id, draft);
    } else {
      addModule(draft);
    }
    setDrawerOpen(false);
    show("Module saved", "✅");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHead
        title="Modules"
        subtitle={`${modules.length} modules · reorder with the arrows`}
        action={
          <LmsButton onClick={openNew}>
            <Plus className="h-4 w-4" /> New module
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
              <Th className="w-[70px]">Order</Th>
              <Th>Module</Th>
              <Th className="w-[110px]">Age band</Th>
              <Th className="w-[110px]">Lessons</Th>
              <Th className="w-[130px]">Status</Th>
              <Th className="w-[150px]">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {modules.map((m, i) => (
              <Tr key={m.id}>
                <Td>
                  <span className="flex items-center gap-2">
                    <span className="font-display text-[15px] font-extrabold text-primary">{m.order}</span>
                    <ReorderButtons
                      onUp={() => reorderModule(m.id, -1)}
                      onDown={() => reorderModule(m.id, 1)}
                      disableUp={i === 0}
                      disableDown={i === modules.length - 1}
                    />
                  </span>
                </Td>
                <Td>
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-[15px]">{m.emoji}</span>
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-foreground">{m.title}</span>
                      <span className="block truncate text-[11px] text-muted-foreground">{m.blurb}</span>
                    </span>
                  </span>
                </Td>
                <Td>{m.ageBand}</Td>
                <Td>{data.content.lessons.filter((l) => l.moduleId === m.id).length}</Td>
                <Td><StatusPill status={m.status} /></Td>
                <Td>
                  <span className="flex items-center gap-1">
                    <LmsButton variant="outline" size="sm" onClick={() => openEdit(m)}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </LmsButton>
                  </span>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      )}

      <SideDrawer
        open={drawerOpen && draft !== null}
        onClose={() => setDrawerOpen(false)}
        title={draft && data.content.modules.some((m) => m.id === draft.id) ? "Edit module" : "New module"}
        footer={
          <>
            <LmsButton variant="outline" onClick={() => setDrawerOpen(false)}>Cancel</LmsButton>
            <LmsButton onClick={save} disabled={!draft?.title.trim()}>Save module</LmsButton>
          </>
        }
      >
        {draft && (
          <>
            <Field label="Module name">
              <TextInput
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. What is money"
              />
            </Field>
            <Field label="Short description">
              <TextArea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value, blurb: e.target.value })}
                placeholder="One line shown under the module name"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age band">
                <Select
                  value={draft.ageBand}
                  onChange={(v) => setDraft({ ...draft, ageBand: v as AgeBand })}
                  options={AGE_BANDS.map((a) => ({ value: a, label: a }))}
                />
              </Field>
              <Field label="Order">
                <Select
                  value={String(draft.order)}
                  onChange={(v) => setDraft({ ...draft, order: Number(v) })}
                  options={modules
                    .filter((m) => m.id !== draft.id)
                    .map((m) => ({ value: String(m.order), label: `Position ${m.order}` }))
                    .concat([{ value: String(modules.length + 1), label: `Position ${modules.length + 1}` }])
                    .sort((a, b) => Number(a.value) - Number(b.value))}
                />
              </Field>
            </div>
            <p className="rounded-lg bg-sunny-soft px-3 py-2 text-[11px] font-semibold text-foreground">
              Modules set to Draft are hidden in the child's Learn tab until published.
            </p>
          </>
        )}
      </SideDrawer>
    </div>
  );
}

