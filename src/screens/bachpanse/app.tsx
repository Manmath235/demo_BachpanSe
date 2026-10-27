import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { Smartphone, Monitor, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp, type ScreenId } from "@/lib/bachpanse/store";
import { PhoneFrame, StatusBar } from "@/components/bachpanse/frame";
import { Toasts, Confetti, ComingSoonSheet } from "@/components/bachpanse/ui";
import { BottomTabBar, PARENT_TABS, CHILD_TABS, AppHeader } from "@/components/bachpanse/cards";
import { Screen, ScrollArea } from "./shared";

import {
  SplashScreen,
  WelcomeScreen,
} from "./shared";
import {
  LoginPhoneScreen,
  LoginOtpScreen,
  RoleSelectScreen,
} from "./auth";
import {
  ParentNameScreen,
  ParentConsentScreen,
  AddChildScreen,
  ParentInviteScreen,
} from "./parent-onboarding";
import { ParentHomeScreen } from "./parent-home";
import { ParentActivityScreen } from "./parent-activity";
import { ParentTasksScreen } from "./parent-tasks";
import { ParentProfileScreen } from "./parent-profile";
import {
  ChildCodeScreen,
  ChildScanScreen,
  ChildWelcomeScreen,
  ChildPinScreen,
  ChildAvatarScreen,
} from "./child-onboarding";
import { ChildHomeScreen, ChildTasksScreen } from "./child-home";
import { ChildMoneyScreen } from "./child-money";
import { ChildGoalsScreen } from "./child-goals";
import {
  ChildLearnScreen,
  ModuleDetailScreen,
  LessonPlayerScreen,
  QuizScreen,
  BadgesScreen,
} from "./child-learn";
import { ChildMeScreen, ChildPrivacyScreen, ChangePinScreen } from "./child-me";
import {
  PracticeHomeScreen,
  PracticeShopScreen,
  PracticeSaveScreen,
} from "./practice";
import { LmsApp } from "./lms";
import { useLmsUi } from "./lms/state";
import { UserFlowButton } from "./user-flow";

function HelpScreen() {
  const back = useApp((s) => s.back);
  return (
    <Screen>
      <AppHeader title="Help & FAQ" onBack={back} />
      <ScrollArea className="space-y-2 px-5 pb-8">
        <div className="flex flex-col items-center py-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-soft">
            <HelpCircle className="h-7 w-7 text-primary" />
          </div>
        </div>
        {[
          ["Is this a real app?", "No — it's an interactive prototype. All data is demo data in your browser."],
          ["Is my money real?", "Nothing here touches real money, banks or payments."],
          ["How do I reset everything?", "Parents: Profile → Reset demo data."],
          ["What's next for BachpanSe?", "Real accounts, more modules and games are coming in later phases."],
        ].map(([q, a]) => (
          <div key={q} className="rounded-2xl bg-card p-4 shadow-sm">
            <p className="text-[14px] font-extrabold">{q}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{a}</p>
          </div>
        ))}
      </ScrollArea>
    </Screen>
  );
}

const SCREENS: Record<ScreenId, () => ReactNode> = {
  splash: SplashScreen,
  welcome: WelcomeScreen,
  loginPhone: LoginPhoneScreen,
  loginOtp: LoginOtpScreen,
  roleSelect: RoleSelectScreen,
  parentName: ParentNameScreen,
  parentConsent: ParentConsentScreen,
  addChild: AddChildScreen,
  parentInvite: ParentInviteScreen,
  parentHome: ParentHomeScreen,
  parentActivity: ParentActivityScreen,
  parentTasks: ParentTasksScreen,
  parentProfile: ParentProfileScreen,
  childCode: ChildCodeScreen,
  childScan: ChildScanScreen,
  childWelcome: ChildWelcomeScreen,
  childPin: ChildPinScreen,
  childAvatar: ChildAvatarScreen,
  childHome: ChildHomeScreen,
  childLearn: ChildLearnScreen,
  childMoney: ChildMoneyScreen,
  childGoals: ChildGoalsScreen,
  childMe: ChildMeScreen,
  moduleDetail: ModuleDetailScreen,
  lessonPlayer: LessonPlayerScreen,
  quiz: QuizScreen,
  badges: BadgesScreen,
  practiceHome: PracticeHomeScreen,
  practiceShop: PracticeShopScreen,
  practiceSave: PracticeSaveScreen,
  childTasks: ChildTasksScreen,
  childPrivacy: ChildPrivacyScreen,
  changePin: ChangePinScreen,
  help: HelpScreen,
};

const TAB_IDS = new Set([...PARENT_TABS, ...CHILD_TABS].map((t) => t.id));
const TAB_MAP = new Map([...PARENT_TABS, ...CHILD_TABS].map((t) => [t.id, t]));

function ViewToggle() {
  const view = useLmsUi((s) => s.view);
  const setView = useLmsUi((s) => s.setView);
  const options = [
    { id: "mobile" as const, label: "Mobile App", icon: <Smartphone className="h-3.5 w-3.5" /> },
    { id: "lms" as const, label: "Admin Panel (LMS)", icon: <Monitor className="h-3.5 w-3.5" /> },
  ];
  return (
    <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/70 p-1 shadow-sm backdrop-blur-sm">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => setView(o.id)}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[12px] font-bold transition-colors",
            view === o.id ? "bg-primary text-primary-foreground shadow" : "text-foreground/70 hover:text-foreground"
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function BachpanSeApp() {
  const stack = useApp((s) => s.stack);
  const direction = useApp((s) => s.direction);
  const reset = useApp((s) => s.reset);
  const view = useLmsUi((s) => s.view);
  const current = stack[stack.length - 1] ?? { screen: "splash" as ScreenId };
  const Screen = SCREENS[current.screen] ?? RoleSelectScreen;
  const tab = TAB_MAP.get(current.screen);

  return (
    <div className="fixed inset-0 flex flex-col items-center gap-3 overflow-hidden bg-gradient-to-br from-[oklch(0.93_0.05_285)] via-[oklch(0.96_0.04_180)] to-[oklch(0.96_0.07_86)]">
      <div className="pt-4">
        <ViewToggle />
      </div>
      <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
        {/* Mobile app view */}
        <motion.div
          animate={{ opacity: view === "mobile" ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            view !== "mobile" && "pointer-events-none"
          )}
          aria-hidden={view !== "mobile"}
        >
          <PhoneFrame>
            <StatusBar />
            <div className="flex min-h-0 flex-1 flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.screen + stack.length}
                  initial={{ opacity: 0, x: direction * 48 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -48 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex min-h-0 flex-1 flex-col"
                >
                  <Screen />
                </motion.div>
              </AnimatePresence>
              {tab && (
                <BottomTabBar
                  tabs={PARENT_TABS.some((t) => t.id === current.screen) ? PARENT_TABS : CHILD_TABS}
                  active={current.screen}
                  onTab={(id) => reset(id as ScreenId)}
                />
              )}
            </div>
            <Toasts />
            <Confetti />
            <ComingSoonSheet />
          </PhoneFrame>
        </motion.div>

        {/* Admin panel (LMS) view */}
        <motion.div
          initial={false}
          animate={{ opacity: view === "lms" ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={cn(
            "absolute inset-0 flex items-center justify-center",
            view !== "lms" && "pointer-events-none"
          )}
          aria-hidden={view !== "lms"}
        >
          <LmsApp />
        </motion.div>
      </div>
      <UserFlowButton />
    </div>
  );
}
