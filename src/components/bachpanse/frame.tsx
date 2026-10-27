import { useEffect, useState, type ReactNode } from "react";
import { Wifi, Signal, BatteryMedium } from "lucide-react";

export function useFrameScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () =>
      setScale(
        Math.min(
          (window.innerHeight * 0.92) / 900,
          (window.innerWidth * 0.92) / 440
        )
      );
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return scale;
}

export function StatusBar() {
  return (
    <div className="relative z-30 flex h-[54px] shrink-0 items-end justify-between px-8 pb-2 text-foreground">
      <span className="text-[15px] font-semibold tracking-wide">9:41</span>
      <div className="flex items-center gap-1.5">
        <Signal className="h-4 w-4" strokeWidth={2.5} />
        <Wifi className="h-4 w-4" strokeWidth={2.5} />
        <BatteryMedium className="h-5 w-5" strokeWidth={2.5} />
      </div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: ReactNode }) {
  const scale = useFrameScale();
  return (
    <div
      style={{ transform: `scale(${scale})` }}
      className="phone-shadow rounded-[56px] bg-foreground p-[11px]"
    >
      <div className="relative flex h-[858px] w-[398px] flex-col overflow-hidden rounded-[46px] bg-background">
        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-[12px] z-40 h-[30px] w-[112px] -translate-x-1/2 rounded-full bg-foreground" />
        {children}
        {/* Home indicator */}
        <div className="pointer-events-none absolute bottom-[8px] left-1/2 z-40 h-[5px] w-[128px] -translate-x-1/2 rounded-full bg-foreground/30" />
      </div>
    </div>
  );
}
