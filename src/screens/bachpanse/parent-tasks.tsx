import { useState } from "react";
import { Plus, Check, X } from "lucide-react";
import { useApp, useToast, useFx } from "@/lib/bachpanse/store";
import { todayISO } from "@/lib/bachpanse/format";
import type { Task } from "@/lib/bachpanse/types";
import { Button, BottomSheet, Keypad, EmptyArt } from "@/components/bachpanse/ui";
import { AppHeader, TaskCard } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls } from "./shared";

export function ParentTasksScreen() {
  const { data } = useApp();
  const { createTask, approveTask, rejectTask } = useApp();
  const toast = useToast((s) => s.show);
  const fire = useFx((s) => s.fire);

  const [sheet, setSheet] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [reward, setReward] = useState("");
  const [due, setDue] = useState(todayISO().slice(0, 10));

  const groups: [string, Task[], string][] = [
    ["To do", data.tasks.filter((t) => t.status === "todo"), "☀️"],
    ["Waiting for your approval", data.tasks.filter((t) => t.status === "waiting"), "⏳"],
    ["Completed", data.tasks.filter((t) => t.status === "completed"), "✅"],
  ];

  const save = () => {
    const r = parseInt(reward || "0", 10);
    if (!title.trim() || !r) return;
    createTask({
      title: title.trim(),
      description: desc.trim() || "No description",
      reward: r,
      dueDate: new Date(due + "T12:00:00").toISOString(),
    });
    setSheet(false);
    setTitle("");
    setDesc("");
    setReward("");
    toast("Task sent to your child", "📨");
  };

  return (
    <Screen>
      <AppHeader
        title="Tasks"
        subtitle="Chores with rewards for your child"
        right={
          <Button size="sm" onClick={() => setSheet(true)}>
            <Plus className="h-4 w-4" /> Create
          </Button>
        }
      />
      <ScrollArea className="space-y-5 px-4 pb-6">
        {groups.map(([label, items, emoji]) =>
          items.length === 0 ? null : (
            <div key={label}>
              <p className="mb-2 px-1 text-[13px] font-extrabold text-muted-foreground">
                {emoji} {label}
              </p>
              <div className="space-y-2">
                {items.map((t) => (
                  <TaskCard key={t.id} task={t}>
                    {t.status === "waiting" && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="mint"
                          className="flex-1"
                          onClick={() => {
                            approveTask(t.id);
                            fire();
                            toast("Approved! Reward added", "✅");
                          }}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            rejectTask(t.id);
                            toast("Sent back to To do", "↩️");
                          }}
                        >
                          <X className="h-4 w-4" /> Not yet
                        </Button>
                      </div>
                    )}
                  </TaskCard>
                ))}
              </div>
            </div>
          )
        )}
        {data.tasks.length === 0 && (
          <div className="flex flex-col items-center pt-16">
            <EmptyArt className="w-48" />
            <p className="mt-2 text-[13px] font-semibold text-muted-foreground">
              No tasks yet. Create the first one!
            </p>
          </div>
        )}
      </ScrollArea>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Create task">
        <div className="space-y-4 pb-2">
          <Field label="Task title">
            <input
              className={inputCls}
              placeholder="e.g. Water the plants for a week"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Field label="Description">
            <input
              className={inputCls}
              placeholder="What exactly should be done?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </Field>
          <div>
            <p className="mb-1 text-[13px] font-bold">Reward amount</p>
            <Keypad value={reward} onChange={setReward} prefix="₹" maxLength={5} />
          </div>
          <Field label="Due date">
            <input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} />
          </Field>
          <Button size="lg" className="w-full" disabled={!title.trim() || !reward} onClick={save}>
            Send task
          </Button>
        </div>
      </BottomSheet>
    </Screen>
  );
}
