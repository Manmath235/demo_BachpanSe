import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { HelpCircle } from "lucide-react";
import { useApp, type ScreenId } from "@/lib/bachpanse/store";
import { startPwaSync } from "@/lib/bachpanse/sync";
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
import { UserFlowButton } from "./user-flow";
import { InstallPrompt, registerServiceWorker } from "./pwa";

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
          ["Is this a real app?", "No — it's an interactive prototype. Lessons come from the BachpanSe content team; your family's activity is demo data."],
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

const PHONE_QUERY = "(max-width: 520px)";

/** null until mounted, so the server never renders the wrong layout. */
function useIsPhone(): boolean | null {
  const [isPhone, setIsPhone] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia(PHONE_QUERY);
    const update = () => setIsPhone(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isPhone;
}

export function BachpanSeApp() {
  const stack = useApp((s) => s.stack);
  const direction = useApp((s) => s.direction);
  const reset = useApp((s) => s.reset);
  const isPhone = useIsPhone();
  const current = stack[stack.length - 1] ?? { screen: "splash" as ScreenId };
  const Screen = SCREENS[current.screen] ?? RoleSelectScreen;
  const tabs = [...PARENT_TABS, ...CHILD_TABS];
  const tab = tabs.find((t) => t.id === current.screen);

  useEffect(() => {
    registerServiceWorker();
    return startPwaSync();
  }, []);

  if (isPhone === null) {
    return <div className="fixed inset-0 bg-background" />;
  }

  const screens = (
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
  );

  // Installed / on a phone: the app is the screen. No device frame, real safe areas.
  if (isPhone) {
    return (
      <div
        className="fixed inset-0 flex flex-col overflow-hidden bg-background"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {screens}
        <Toasts />
        <Confetti />
        <ComingSoonSheet />
        <InstallPrompt />
      </div>
    );
  }

  // Desktop browser: show the app inside a phone frame, as in the original prototype.
  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.93_0.05_285)] via-[oklch(0.96_0.04_180)] to-[oklch(0.96_0.07_86)]">
      <PhoneFrame>
        <StatusBar />
        {screens}
        <Toasts />
        <Confetti />
        <ComingSoonSheet />
      </PhoneFrame>
      <UserFlowButton />
      <InstallPrompt />
    </div>
  );
}
