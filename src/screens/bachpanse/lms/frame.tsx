import { useEffect, useState, type ReactNode } from "react";
import { Lock, Globe } from "lucide-react";

export function useLmsScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () =>
      setScale(
        Math.min(
          (window.innerHeight * 0.88) / 860,
          (window.innerWidth * 0.94) / 1300
        )
      );
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return scale;
}

/**
 * Fixed logical size of 1280 x 800 for the LMS content area, plus browser
 * chrome. The whole frame is scaled with a CSS transform so browser zoom
 * never changes its visual size.
 */
export function BrowserFrame({ children }: { children: ReactNode }) {
  const scale = useLmsScale();
  return (
    <div
      style={{ transform: `scale(${scale})` }}
      className="phone-shadow overflow-hidden rounded-2xl bg-foreground p-[10px]"
    >
      <div className="relative flex h-[840px] w-[1300px] flex-col overflow-hidden rounded-xl bg-card">
        {/* Browser chrome */}
        <div className="flex h-[40px] shrink-0 items-center gap-3 border-b border-border bg-muted px-4">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-coral" />
            <span className="h-3 w-3 rounded-full bg-sunny" />
            <span className="h-3 w-3 rounded-full bg-mint" />
          </div>
          <div className="mx-auto flex h-[26px] w-[420px] items-center justify-center gap-1.5 rounded-full bg-card px-3 text-[12px] font-semibold text-muted-foreground">
            <Lock className="h-3 w-3" />
            <Globe className="h-3 w-3" />
            BachpanSe Admin
          </div>
          <span className="w-[62px]" />
        </div>
        {/* Content area — only this scrolls */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
