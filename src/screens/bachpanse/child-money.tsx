import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useApp, selectBalance, monthTotals, useToast } from "@/lib/bachpanse/store";
import { inr, todayISO } from "@/lib/bachpanse/format";
import type { Transaction } from "@/lib/bachpanse/types";
import { Button, BottomSheet, Keypad, Chip, EmptyArt } from "@/components/bachpanse/ui";
import { AppHeader, BalanceCard, TransactionRow, CATEGORY_EMOJI } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls } from "./shared";

const SPEND_CATEGORIES = ["Food", "Stationery", "Games", "Travel", "Gifts", "Other"];

/* ---------- Add spending sheet (shared by Home & Money tabs) ---------- */
export function AddSpendingSheet({
  open,
  onClose,
  editTx,
}: {
  open: boolean;
  onClose: () => void;
  editTx?: Transaction | null;
}) {
  const { data } = useApp();
  const { addSpending, updateTransaction } = useApp();
  const toast = useToast((s) => s.show);
  const [amount, setAmount] = useState(editTx ? String(editTx.amount) : "");
  const [category, setCategory] = useState(editTx?.category ?? "Food");
  const [note, setNote] = useState(editTx?.note ?? "");
  const [date, setDate] = useState(
    (editTx ? editTx.date : todayISO()).slice(0, 10)
  );

  const balance = selectBalance(data);
  const amt = parseInt(amount || "0", 10);
  const over = amt > balance;

  const save = () => {
    if (!amt) return;
    const iso = new Date(date + "T12:00:00").toISOString();
    if (editTx) {
      updateTransaction(editTx.id, { amount: amt, category, note: note.trim() || category, date: iso });
      toast("Spending updated", "✏️");
    } else {
      addSpending({ amount: amt, category, note: note.trim() || category, date: iso });
      toast("Spending added", "💸");
    }
    onClose();
    if (!editTx) {
      setAmount("");
      setNote("");
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={editTx ? "Edit spending" : "Add spending"}>
      <div className="space-y-4 pb-2">
        <Keypad value={amount} onChange={setAmount} prefix="₹" />
        {over && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 rounded-xl bg-sunny-soft px-3.5 py-2.5"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            <p className="text-[12px] font-semibold">
              That's more than your balance ({inr(balance)}). You can still save
              it, but try to spend within your money!
            </p>
          </motion.div>
        )}
        <div>
          <p className="mb-1.5 text-[13px] font-bold">Category</p>
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SPEND_CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {CATEGORY_EMOJI[c] ?? "📦"} {c}
              </Chip>
            ))}
          </div>
        </div>
        <Field label="Note">
          <input
            className={inputCls}
            placeholder="e.g. Samosa and juice"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
        <Field label="Date">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Button size="lg" className="w-full" disabled={!amt} onClick={save}>
          {editTx ? "Save changes" : "Save spending"}
        </Button>
      </div>
    </BottomSheet>
  );
}

/* ---------- Detail sheet with edit/delete ---------- */
export function ChildTxSheet({
  tx,
  onClose,
}: {
  tx: Transaction | null;
  onClose: () => void;
}) {
  const { deleteTransaction } = useApp();
  const toast = useToast((s) => s.show);
  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <>
      <BottomSheet open={!!tx && !editing} onClose={onClose} title={tx?.type === "in" ? "Money in" : "Money out"}>
        {tx && (
          <div className="space-y-3 pb-3">
            <div className={`rounded-2xl p-4 text-center ${tx.type === "in" ? "bg-mint-soft" : "bg-coral-soft"}`}>
              <p className={`font-display text-3xl font-extrabold ${tx.type === "in" ? "text-primary" : "text-coral"}`}>
                {inr(tx.amount)}
              </p>
            </div>
            {[
              ["Title", tx.note],
              ["Category", tx.category],
              ["Recorded by", tx.recordedBy],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-xl bg-muted px-3.5 py-2.5 text-[13px]">
                <span className="font-semibold text-muted-foreground">{k}</span>
                <span className="max-w-[60%] truncate text-right font-bold">{v}</span>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (tx.recordedBy === "Child") {
                    setEditing(true);
                  } else {
                    toast("Parent-recorded entries can't be edited", "🔒");
                  }
                }}
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-coral/40 text-coral"
                onClick={() => {
                  if (tx.recordedBy === "Child") {
                    setConfirmDel(true);
                  } else {
                    toast("Parent-recorded entries can't be deleted", "🔒");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        )}
      </BottomSheet>

      <BottomSheet open={confirmDel} onClose={() => setConfirmDel(false)} title="Delete this entry?">
        <div className="space-y-3 pb-2">
          <p className="text-[14px] text-muted-foreground">
            This will remove the entry and update your balance.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDel(false)}>
              Keep it
            </Button>
            <Button
              variant="coral"
              className="flex-1"
              onClick={() => {
                if (tx) deleteTransaction(tx.id);
                setConfirmDel(false);
                onClose();
                toast("Entry deleted", "🗑️");
              }}
            >
              Delete
            </Button>
          </div>
        </div>
      </BottomSheet>

      {editing && tx && (
        <AddSpendingSheet
          key={tx.id}
          open={editing}
          editTx={tx}
          onClose={() => {
            setEditing(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

/* ---------- Money tab ---------- */
export function ChildMoneyScreen() {
  const { data, back } = useApp();
  const [spend, setSpend] = useState(false);
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");

  const balance = selectBalance(data);
  const totals = monthTotals(data);
  const balanceVal = Math.max(1, balance);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of data.transactions)
      if (t.type === "out") map.set(t.category, (map.get(t.category) ?? 0) + t.amount);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [data.transactions]);

  const filtered = useMemo(
    () =>
      data.transactions
        .filter((t) => filter === "all" || t.type === filter)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date)),
    [data.transactions, filter]
  );

  return (
    <Screen>
      <AppHeader title="Money" subtitle="What you have, in and out" />
      <ScrollArea className="space-y-4 px-4 pb-6">
        <BalanceCard balance={balance} moneyIn={totals.moneyIn} moneyOut={totals.moneyOut} />

        <Button size="lg" className="w-full" onClick={() => setSpend(true)}>
          <Plus className="h-5 w-5" /> Add spending
        </Button>

        {/* Category chart */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="text-[15px] font-extrabold">Where money went</h3>
          <div className="mt-3 space-y-2.5">
            {byCategory.map(([cat, amt], i) => (
              <div key={cat}>
                <div className="flex justify-between text-[12px] font-bold">
                  <span>
                    {CATEGORY_EMOJI[cat] ?? "📦"} {cat}
                  </span>
                  <span className="text-coral">{inr(amt)}</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-violet-soft">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(amt / Math.max(...byCategory.map((c) => c[1]))) * 100}%` }}
                    transition={{ duration: 0.7, delay: i * 0.07 }}
                    className="h-full rounded-full bg-coral"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex h-4 overflow-hidden rounded-full">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totals.moneyIn / (totals.moneyIn + totals.moneyOut)) * 100}%` }}
              className="bg-mint"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(totals.moneyOut / (totals.moneyIn + totals.moneyOut)) * 100}%` }}
              className="bg-coral"
            />
          </div>
          <div className="mt-1 flex justify-between text-[11px] font-bold">
            <span className="text-mint">In {inr(totals.moneyIn)}</span>
            <span className="text-coral">Out {inr(totals.moneyOut)}</span>
          </div>
        </div>

        {/* History */}
        <div>
          <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
            {(
              [
                ["all", "All"],
                ["in", "Money in"],
                ["out", "Money out"],
              ] as const
            ).map(([id, label]) => (
              <Chip key={id} active={filter === id} onClick={() => setFilter(id)}>
                {label}
              </Chip>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyArt className="mx-auto w-40" />
          ) : (
            <div className="space-y-2">
              {filtered.map((t) => (
                <TransactionRow key={t.id} t={t} onClick={() => setDetail(t)} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AddSpendingSheet open={spend} onClose={() => setSpend(false)} />
      <ChildTxSheet tx={detail} onClose={() => setDetail(null)} />
    </Screen>
  );
}
