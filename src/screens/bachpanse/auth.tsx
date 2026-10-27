import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useApp, useComingSoon, findDemoAccount } from "@/lib/bachpanse/store";
import { Button, CodeBoxes } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls, Logo } from "./shared";

/* ---------- Login / Sign up: mobile number ---------- */
export function LoginPhoneScreen() {
  const { go, back, signInStart, account, authMode, setAuthMode } = useApp();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const valid = phone.length === 10;
  const isLogin = authMode === "login";
  const registered =
    findDemoAccount(phone) !== undefined || (account !== null && account.phone === phone);

  const sendOtp = () => {
    if (!valid) return;
    if (isLogin && !registered) {
      setError("No account found with this number.");
      return;
    }
    if (!isLogin && registered) {
      setError("This number already has an account.");
      return;
    }
    setError(null);
    signInStart(phone);
    go("loginOtp");
  };

  return (
    <Screen>
      <AppHeader title="" onBack={back} />
      <ScrollArea className="px-6 pb-8">
        <div className="pt-4">
          <Logo size="lg" />
          <h2 className="mt-5 font-display text-2xl font-extrabold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {isLogin
              ? "Log in with your registered mobile number."
              : "One number for the whole family. We'll use it only for demo purposes — nothing is really sent."}
          </p>
        </div>
        <div className="mt-5 flex rounded-2xl bg-muted/60 p-1">
          {(["login", "signup"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                setAuthMode(mode);
                setError(null);
              }}
              className={`flex-1 rounded-xl py-2 text-[13px] font-extrabold transition-colors ${
                authMode === mode
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              {mode === "login" ? "Log in" : "Sign up"}
            </button>
          ))}
        </div>
        <div className="mt-5 space-y-4">
          <Field
            label="Mobile number"
            hint={isLogin ? "Demo: Parent: 98765 43210\nChild 98765 43211" : "Demo: any 10 digits work."}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-violet-soft px-3 py-2.5 text-[14px] font-extrabold text-primary">
                +91
              </span>
              <input
                autoFocus
                inputMode="numeric"
                placeholder="98765 43210"
                className={inputCls}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError(null);
                }}
              />
            </div>
          </Field>
          {error && (
            <div className="rounded-2xl bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-600">
              {error}{" "}
              <button
                className="underline"
                onClick={() => setAuthMode(isLogin ? "signup" : "login")}
              >
                {isLogin ? "Try Sign up" : "Log in instead"}
              </button>
            </div>
          )}
          <Button
            size="lg"
            className="w-full"
            disabled={!valid}
            onClick={sendOtp}
          >
            Send OTP <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Login: OTP ---------- */
export function LoginOtpScreen() {
  const { go, back, reset, session, account, authMode, signInComplete } = useApp();
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const isLogin = authMode === "login";
  useEffect(() => {
    const t = setInterval(() => setTimer((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const verify = () => {
    if (otp.length !== 6) return;
    if (isLogin) {
      // Role comes from the number used: the demo child number logs in as the child.
      const role = findDemoAccount(session.phone)?.role ?? account?.role ?? "parent";
      signInComplete(role);
      reset(role === "parent" ? "parentHome" : "childHome");
    } else {
      go("roleSelect");
    }
  };
  return (
    <Screen>
      <AppHeader title="" onBack={back} />
      <ScrollArea className="px-6 pb-8">
        <div className="pt-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-soft text-3xl">
            💬
          </div>
          <h2 className="mt-4 font-display text-2xl font-extrabold">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            OTP sent to +91 {session.phone} (demo only)
          </p>
          <p className="mt-2 inline-block rounded-full bg-sunny-soft px-3 py-1 text-[12px] font-bold text-foreground">
            Demo OTP: any 6 digits
          </p>
        </div>
        <div className="mt-6 space-y-4">
          <CodeBoxes length={6} value={otp} onChange={setOtp} />
          <Button
            size="lg"
            className="w-full"
            disabled={otp.length !== 6}
            onClick={verify}
          >
            {isLogin ? "Log in" : "Verify & continue"} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-[13px] text-muted-foreground">
            {timer > 0 ? (
              <>Resend OTP in {timer}s</>
            ) : (
              <button className="font-bold text-primary" onClick={() => setTimer(30)}>
                Resend OTP
              </button>
            )}
          </p>
        </div>
      </ScrollArea>
    </Screen>
  );
}

/* ---------- Role question (after OTP) ---------- */
export function RoleSelectScreen() {
  const { go, back, session, signInComplete } = useApp();
  const openSheet = useComingSoon((s) => s.openSheet);
  return (
    <Screen>
      <AppHeader title="" onBack={back} />
      <div className="flex min-h-0 flex-1 flex-col px-6 pt-3 pb-6">
        <div className="flex flex-col items-center">
          <Logo size="md" />
          <h2 className="mt-4 text-center font-display text-xl font-extrabold">
            Who's using BachpanSe today?
          </h2>
          <p className="mt-1 text-center text-[13px] text-muted-foreground">
            Signed in as +91 {session.phone}. Pick a role to continue.
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center space-y-3">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              signInComplete("parent");
              go("parentName");
            }}
            className="flex w-full items-center gap-4 rounded-3xl bg-primary p-4 text-left text-primary-foreground shadow-lg shadow-primary/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
              👩‍👧
            </div>
            <div>
              <span className="block font-display text-[16px] font-extrabold">
                I'm a Parent
              </span>
              <span className="text-[12px] opacity-80">
                Set up your child, send tasks & track progress
              </span>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              signInComplete("child");
              go("childCode");
            }}
            className="flex w-full items-center gap-4 rounded-3xl bg-mint p-4 text-left text-primary-foreground shadow-lg shadow-mint/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-2xl">
              🧒
            </div>
            <div>
              <span className="block font-display text-[16px] font-extrabold">
                I'm a Child
              </span>
              <span className="text-[12px] opacity-90">
                Learn, earn and save for your goals
              </span>
            </div>
          </motion.button>
        </div>
        <div className="pt-6 text-center">
          <button
            onClick={() => openSheet("Real accounts with sign-in come in a later phase. This prototype uses shared demo data you can reset anytime.")}
            className="text-[11px] font-semibold text-muted-foreground underline"
          >
            How does demo data work?
          </button>
        </div>
      </div>
    </Screen>
  );
}
