import { useEffect } from "react";
import { startAdminSync } from "@/lib/bachpanse/sync";
import { useLmsUi } from "./state";
import { LmsLogin } from "./login";
import { LmsLayout } from "./layout";
import { LmsToasts, LmsComingSoon } from "./ui";

/** The standalone admin panel: full-viewport, signed in against Supabase. */
export function AdminApp() {
  const signedIn = useLmsUi((s) => s.signedIn);
  const restoreSession = useLmsUi((s) => s.restoreSession);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    if (!signedIn) return;
    return startAdminSync();
  }, [signedIn]);

  return (
    <div className="relative flex h-screen min-h-0 flex-col overflow-hidden bg-background">
      {signedIn ? <LmsLayout /> : <LmsLogin />}
      <LmsToasts />
      <LmsComingSoon />
    </div>
  );
}
