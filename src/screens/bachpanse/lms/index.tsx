import { useLmsUi } from "./state";
import { BrowserFrame } from "./frame";
import { LmsLogin } from "./login";
import { LmsLayout } from "./layout";
import { LmsToasts, LmsComingSoon } from "./ui";

export function LmsApp() {
  const signedIn = useLmsUi((s) => s.signedIn);
  return (
    <BrowserFrame>
      {signedIn ? <LmsLayout /> : <LmsLogin />}
      <LmsToasts />
      <LmsComingSoon />
    </BrowserFrame>
  );
}
