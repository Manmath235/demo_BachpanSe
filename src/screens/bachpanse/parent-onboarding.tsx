import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Share2, QrCode, MessageCircle, Link2, Copy } from "lucide-react";
import { useApp, useToast } from "@/lib/bachpanse/store";
import { childAge } from "@/lib/bachpanse/types";
import { Button, BottomSheet, MockQR } from "@/components/bachpanse/ui";
import { AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea, Field, inputCls } from "./shared";

function OnboardShell({
  children,
  onBack,
}: {
  children: React.ReactNode;
  onBack?: () => void;
}) {
  return (
    <Screen>
      <AppHeader onBack={onBack} title="" />
      <ScrollArea className="px-6 pb-8">{children}</ScrollArea>
    </Screen>
  );
}

/* ---------- Parent name ---------- */
export function ParentNameScreen() {
  const { go, setParentProfile, session } = useApp();
  const [name, setName] = useState("");
  return (
    <OnboardShell onBack={() => go("loginOtp")}>
      <div className="pt-2">
        <h2 className="font-display text-2xl font-extrabold">What's your name?</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          This is how you'll appear to your child in the app.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Your full name">
          <input
            autoFocus
            placeholder="e.g. Aditya Sharma"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Button
          size="lg"
          className="w-full"
          disabled={name.trim().length < 2}
          onClick={() => {
            setParentProfile(name.trim(), session.phone);
            go("parentConsent");
          }}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </OnboardShell>
  );
}

/* ---------- Consent ---------- */
const PRIVACY_TEXT = [
  "We collect only what we need: your child's name, date of birth, learning progress, and the money entries you and your child record.",
  "We never show ads to children, never sell data, and never track behaviour across other apps.",
  "You can withdraw consent at any time from your Profile. All demo data stays in this browser only.",
];

export function ParentConsentScreen() {
  const { go } = useApp();
  const [ok, setOk] = useState(false);
  const [sheet, setSheet] = useState<null | "privacy" | "data">(null);
  return (
    <Screen>
      <AppHeader title="Parent consent" onBack={() => go("parentName")} />
      <ScrollArea className="px-6 pb-4">
        <div className="flex items-center gap-3 rounded-2xl bg-violet-soft p-4">
          <ShieldCheck className="h-8 w-8 shrink-0 text-primary" />
          <p className="text-[13px] font-semibold text-primary">
            Plain-language consent, DPDP style. You stay in control.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <h3 className="text-[14px] font-extrabold">What we collect</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Child's name, date of birth, learning progress, and the money
              entries you and your child record.
            </p>
          </div>
          <div className="rounded-2xl bg-card p-4 shadow-sm">
            <h3 className="text-[14px] font-extrabold">What we never do</h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              ❌ No ads targeted at children ❌ No selling data ❌ No behaviour
              tracking
            </p>
          </div>
        </div>
        <button
          onClick={() => setOk(!ok)}
          className="mt-5 flex w-full items-start gap-3 rounded-2xl bg-card p-4 text-left shadow-sm"
        >
          <div
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
              ok ? "border-primary bg-primary" : "border-border bg-card"
            }`}
          >
            {ok && <span className="text-[14px] font-black text-primary-foreground">✓</span>}
          </div>
          <span className="text-[13px] font-semibold leading-relaxed text-foreground">
            I am the parent or legal guardian and I give consent for my child to
            use BachpanSe.
          </span>
        </button>
        <div className="mt-4 flex gap-4">
          <button
            onClick={() => setSheet("privacy")}
            className="text-[13px] font-bold text-primary underline"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setSheet("data")}
            className="text-[13px] font-bold text-primary underline"
          >
            How we use data
          </button>
        </div>
      </ScrollArea>
      <div className="px-6 pb-6">
        <Button
          size="lg"
          className="w-full"
          disabled={!ok}
          onClick={() => go("addChild")}
        >
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <BottomSheet open={sheet !== null} onClose={() => setSheet(null)} title={sheet === "privacy" ? "Privacy Policy" : "How we use data"}>
        <div className="space-y-3 pb-2">
          {PRIVACY_TEXT.map((p, i) => (
            <p key={i} className="text-[13px] leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </BottomSheet>
    </Screen>
  );
}

/* ---------- Add child ---------- */
export function AddChildScreen() {
  const { go, setChildProfile } = useApp();
  const toast = useToast((s) => s.show);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (name.trim().length < 2 || !dob || phone.length !== 10) {
      setError(
        "Please enter your child's name, date of birth and a 10-digit mobile number."
      );
      return;
    }
    const age = childAge(dob);
    if (age < 10) {
      setError(
        "BachpanSe currently supports ages 10 to 17. Support for younger children is coming soon."
      );
      return;
    }
    if (age >= 18) {
      setError(
        "Users aged 18 and above will be able to sign up on their own soon."
      );
      return;
    }
    setError(null);
    setChildProfile({ childName: name.trim(), childDob: dob, childPhone: phone });
    go("parentInvite");
  };

  return (
    <OnboardShell onBack={() => go("parentConsent")}>
      <div className="pt-2">
        <h2 className="font-display text-2xl font-extrabold">Add your child</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          BachpanSe supports children aged 10 to 17.
        </p>
      </div>
      <div className="mt-6 space-y-4">
        <Field label="Child's name">
          <input
            placeholder="e.g. Divya Sharma"
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Date of birth">
          <input type="date" className={inputCls} value={dob} onChange={(e) => setDob(e.target.value)} />
        </Field>
        <Field label="Child's mobile number" hint="Demo: any 10 digits work.">
          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-mint-soft px-3 py-2.5 text-[14px] font-extrabold text-foreground">
              +91
            </span>
            <input
              inputMode="numeric"
              placeholder="98765 43211"
              className={inputCls}
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>
        </Field>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-coral-soft px-3.5 py-2.5 text-[13px] font-semibold text-coral"
          >
            {error}
          </motion.p>
        )}
        <Button size="lg" className="w-full" onClick={submit}>
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </OnboardShell>
  );
}

/* ---------- Invite screen ---------- */
export function ParentInviteScreen() {
  const { data, setRole, reset, setConsent } = useApp();
  const toast = useToast((s) => s.show);
  const [share, setShare] = useState(false);
  const code = data.inviteCode;

  useEffect(() => {
    setConsent();
    toast("You're all set, " + data.parentName.split(" ")[0] + "! 🎉");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Screen>
      <AppHeader title="Invite your child" />
      <ScrollArea className="flex flex-col px-6 pb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          className="mx-auto mt-2 flex h-20 w-20 items-center justify-center rounded-full bg-mint text-4xl shadow-lg shadow-mint/40"
        >
          ✅
        </motion.div>
        <h2 className="mt-4 text-center font-display text-xl font-extrabold">
          {data.childName} is ready to join!
        </h2>
        <p className="mt-1 text-center text-[13px] text-muted-foreground">
          Share this code on your child's device to link them.
        </p>
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-card p-5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Invite code
          </p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-widest text-primary">
            {code}
          </p>
          <div className="mt-4">
            <MockQR seed={code} size={140} />
          </div>
        </div>
        <div className="mt-5 space-y-3">
          <Button size="lg" variant="soft" className="w-full" onClick={() => setShare(true)}>
            <Share2 className="h-4 w-4" /> Share code
          </Button>
          <Button
            size="lg"
            className="w-full"
            onClick={() => {
              setRole("parent");
              reset("parentHome");
            }}
          >
            Go to dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </ScrollArea>
      <BottomSheet open={share} onClose={() => setShare(false)} title="Share invite">
        <div className="space-y-2 pb-2">
          {[
            { icon: <MessageCircle className="h-5 w-5" />, label: "WhatsApp" },
            { icon: <Link2 className="h-5 w-5" />, label: "Copy link" },
            { icon: <QrCode className="h-5 w-5" />, label: "Show QR again" },
          ].map((o) => (
            <button
              key={o.label}
              onClick={() => {
                setShare(false);
                toast("Shared (demo) — " + o.label, "📤");
              }}
              className="flex w-full items-center gap-3 rounded-2xl bg-violet-soft px-4 py-3 text-left text-[14px] font-bold text-primary"
            >
              {o.icon}
              {o.label}
              <Copy className="ml-auto h-4 w-4 opacity-50" />
            </button>
          ))}
        </div>
      </BottomSheet>
    </Screen>
  );
}
