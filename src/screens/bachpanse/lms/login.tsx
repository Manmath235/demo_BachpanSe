import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, KeyRound } from "lucide-react";
import { useLmsUi } from "./state";
import { LmsButton, lmsInputCls } from "./ui";
import { Logo } from "../shared";
import { cloudEnabled } from "@/lib/bachpanse/cloud";

export function LmsLogin() {
  const signInWith = useLmsUi((s) => s.signInWith);
  const authBusy = useLmsUi((s) => s.authBusy);
  const authError = useLmsUi((s) => s.authError);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void signInWith(email, password);
  };

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-[400px] flex-col items-center rounded-2xl border border-border bg-white p-8 shadow-sm"
      >
        <Logo size="lg" />
        <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Admin Panel · LMS
        </p>
        <h1 className="mt-4 font-display text-xl font-extrabold">Log in to the content studio</h1>
        <form onSubmit={submit} className="mt-5 w-full space-y-3">
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bachpanse.in"
                className={`${lmsInputCls} pl-9`}
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-bold">Password</span>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`${lmsInputCls} pl-9`}
              />
            </div>
          </label>
          {authError && (
            <p role="alert" className="rounded-lg bg-coral-soft px-3 py-2 text-[12px] font-semibold text-coral">
              {authError}
            </p>
          )}
          <LmsButton type="submit" disabled={authBusy} className="mt-1 h-10 w-full text-[14px]">
            {authBusy ? "Logging in…" : "Log in"}
          </LmsButton>
          <p className="text-center text-[11px] font-semibold text-muted-foreground">
            {cloudEnabled ? "Use your admin account" : "Demo mode (no Supabase set up): any email and password"}
          </p>
        </form>
      </motion.div>
    </div>
  );
}
