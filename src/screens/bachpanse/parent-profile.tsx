import { useState } from "react";
import { motion } from "framer-motion";
import { LogOut, RotateCcw, Bell, HelpCircle, ShieldCheck, RefreshCw, Copy } from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { childAge } from "@/lib/bachpanse/types";
import { formatDateTime } from "@/lib/bachpanse/format";
import { Button, BottomSheet, MockQR, InfoPill } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <motion.span
        layout
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
          on ? "left-[18px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

export function ParentProfileScreen() {
  const { data, withdrawConsent, resetDemo, setRole, reset, logout } = useApp();
  const toast = useToast((s) => s.show);
  const [notify, setNotify] = useState({ tasks: true, goals: true, weekly: false });
  const [withdraw, setWithdraw] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const age = childAge(data.childDob);

  return (
    <Screen>
      <AppHeader title="Profile" subtitle={data.parentName} />
      <ScrollArea className="space-y-4 px-4 pb-6">
        {/* Parent card */}
        <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft text-2xl">
            👩
          </div>
          <div className="min-w-0">
            <p className="truncate text-[15px] font-extrabold">{data.parentName}</p>
            <p className="text-[12px] text-muted-foreground">+91 {data.parentPhone} · Parent</p>
          </div>
        </div>

        {/* Child card */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-soft text-2xl">
              {data.childAvatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-extrabold">{data.childName}</p>
              <p className="text-[12px] text-muted-foreground">Age {age} · linked</p>
            </div>
            <InfoPill tone="mint">🟢 Active</InfoPill>
          </div>
          <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-3.5 py-2.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Invite code
              </p>
              <p className="font-display text-lg font-extrabold tracking-widest text-primary">
                {data.inviteCode}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <MockQR seed={data.inviteCode} size={54} />
              <button
                onClick={() => toast("Code copied (demo)", "📋")}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-soft text-primary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & consent */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
            <ShieldCheck className="h-4 w-4 text-primary" /> Privacy & consent
          </h3>
          {data.consentGivenAt ? (
            <>
              <p className="mt-2 text-[13px] text-muted-foreground">
                Consent given on{" "}
                <span className="font-bold text-foreground">
                  {formatDateTime(data.consentGivenAt)}
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 border-coral/40 text-coral"
                onClick={() => setWithdraw(true)}
              >
                Withdraw consent
              </Button>
            </>
          ) : (
            <p className="mt-2 text-[13px] text-muted-foreground">
              Consent not given yet in this demo run.
            </p>
          )}
          {data.consentWithdrawn && (
            <p className="mt-2 rounded-xl bg-coral-soft px-3 py-2 text-[12px] font-semibold text-coral">
              Consent withdrawn (demo). Data would be erased after 30 days in the
              real app.
            </p>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-2xl bg-card p-4 shadow-sm">
          <h3 className="flex items-center gap-2 text-[15px] font-extrabold">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </h3>
          <div className="mt-2 space-y-2">
            {(
              [
                ["tasks", "Task updates"],
                ["goals", "Goal milestones"],
                ["weekly", "Weekly summary"],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className="flex items-center justify-between">
                <span className="text-[13px] font-semibold">{label}</span>
                <Toggle on={notify[k]} onChange={() => setNotify({ ...notify, [k]: !notify[k] })} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => useApp.getState().go("help")}
          className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 shadow-sm"
        >
          <HelpCircle className="h-5 w-5 text-primary" />
          <span className="text-[14px] font-bold">Help & FAQ</span>
        </button>

        <div className="space-y-2">
          <Button
            variant="soft"
            className="w-full"
            onClick={() => {
              setRole("child");
              reset("childHome");
            }}
          >
            <RefreshCw className="h-4 w-4" /> Switch to Child demo
          </Button>
          <Button
            variant="sunny"
            className="w-full"
            onClick={() => setConfirmReset(true)}
          >
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </Button>
          <Button
            variant="outline"
            className="w-full border-coral/40 text-coral"
            onClick={() => {
              logout();
              toast("Logged out of demo", "👋");
            }}
          >
            <LogOut className="h-4 w-4" /> Log out
          </Button>
        </div>
      </ScrollArea>

      {/* Withdraw consent */}
      <BottomSheet open={withdraw} onClose={() => setWithdraw(false)} title="Withdraw consent?">
        <div className="space-y-3 pb-2">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            If you withdraw consent, your child's account will pause and demo
            data would be erased after 30 days. Learning progress and money
            entries will no longer be visible.
          </p>
          <p className="rounded-xl bg-sunny-soft px-3.5 py-2.5 text-[12px] font-semibold">
            This is a prototype — nothing real is deleted.
          </p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setWithdraw(false)}>
              Keep consent
            </Button>
            <Button
              variant="coral"
              className="flex-1"
              onClick={() => {
                withdrawConsent();
                setWithdraw(false);
                toast("Consent withdrawn (demo)", "📝");
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Reset confirm */}
      <BottomSheet open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset demo data?">
        <div className="space-y-3 pb-2">
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            This restores the original demo data: Aditya, Divya, the seed
            transactions, goals and tasks. Anything you added in this demo is
            erased.
          </p>
          <div className="flex gap-2 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                resetDemo();
                setConfirmReset(false);
                toast("Demo data reset", "🔄");
              }}
            >
              Reset now
            </Button>
          </div>
        </div>
      </BottomSheet>
    </Screen>
  );
}
