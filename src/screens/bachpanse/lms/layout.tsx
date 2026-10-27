import { BookOpen, Layers, ListChecks, Gamepad2, LogOut, Users } from "lucide-react";
import { useLmsUi, type LmsPage } from "./state";
import { LmsButton, CenterDialog } from "./ui";
import { LearnersPage } from "./learners";
import { SyncBadge } from "./sync-badge";
import { ModulesPage } from "./modules";
import { LessonsPage } from "./lessons";
import { QuizzesPage } from "./quizzes";
import { ChallengesPage } from "./challenges";
import { cn } from "@/lib/utils";

const NAV: { id: LmsPage; label: string; icon: React.ReactNode }[] = [
  { id: "modules", label: "Modules", icon: <Layers className="h-4 w-4" /> },
  { id: "lessons", label: "Lessons", icon: <BookOpen className="h-4 w-4" /> },
  { id: "quizzes", label: "Quizzes", icon: <ListChecks className="h-4 w-4" /> },
  { id: "challenges", label: "Challenges", icon: <Gamepad2 className="h-4 w-4" /> },
  { id: "learners", label: "Learners", icon: <Users className="h-4 w-4" /> },
];

export function LmsLayout() {
  const page = useLmsUi((s) => s.page);
  const confirmNav = useLmsUi((s) => s.confirmNav);
  const pendingPage = useLmsUi((s) => s.pendingPage);
  const cancelNav = useLmsUi((s) => s.cancelNav);
  const acceptNav = useLmsUi((s) => s.acceptNav);
  const signOut = useLmsUi((s) => s.signOut);

  return (
    <div className="flex min-h-0 flex-1">
      {/* Sidebar */}
      <aside className="flex w-[210px] shrink-0 flex-col border-r border-border bg-violet-soft/40 p-3">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary font-display text-[13px] font-extrabold text-primary-foreground">
            BS
          </div>
          <div>
            <p className="text-[12px] font-extrabold leading-tight text-foreground">BachpanSe</p>
            <p className="text-[10px] font-semibold text-muted-foreground">Content studio</p>
          </div>
        </div>
        <nav className="mt-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => confirmNav(n.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors",
                page === n.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/80 hover:bg-white"
              )}
            >
              {n.icon}
              {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto px-2">
          <SyncBadge />
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-h-0 flex-1 flex-col bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-5">
          <p className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">
            Content studio · {NAV.find((n) => n.id === page)?.label}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-mint-soft text-[12px] font-extrabold text-primary">
              CT
            </div>
            <span className="text-[13px] font-bold text-foreground">BachpanSe Content Team</span>
            <LmsButton variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-3.5 w-3.5" /> Log out
            </LmsButton>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-hidden p-5">
          <div key={page} className="flex min-h-0 h-full flex-col" style={{ animation: "lms-fade 0.25s ease-out" }}>
            {page === "modules" && <ModulesPage />}
            {page === "lessons" && <LessonsPage />}
            {page === "quizzes" && <QuizzesPage />}
            {page === "challenges" && <ChallengesPage />}
            {page === "learners" && <LearnersPage />}
          </div>
        </main>
      </div>

      {/* Unsaved-changes guard when switching pages */}
      <CenterDialog
        open={pendingPage !== null}
        title="Leave with unsaved changes?"
        actions={
          <>
            <LmsButton variant="outline" onClick={cancelNav}>Stay here</LmsButton>
            <LmsButton variant="danger" onClick={acceptNav}>Discard and leave</LmsButton>
          </>
        }
      >
        Your draft in the open editor has not been saved. Leaving this page will discard those changes.
      </CenterDialog>
    </div>
  );
}
