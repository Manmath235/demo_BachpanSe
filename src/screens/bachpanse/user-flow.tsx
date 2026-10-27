import { useEffect, useState } from "react";
import { GitBranch, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import flowsHtml from "./user-flows.html?raw";

/** Full-screen viewer for the uploaded BachpanSe user-flows document, opened from a fixed corner button. */
export function UserFlowButton() {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const show = () => {
    setOpened(true);
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={show}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 text-[13px] font-bold text-foreground shadow-lg backdrop-blur-sm ring-1 ring-foreground/10 transition hover:bg-white hover:shadow-xl"
        aria-haspopup="dialog"
      >
        <GitBranch className="h-4 w-4 text-primary" />
        User Flow
      </button>

      {opened && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed inset-0 z-[60] flex flex-col bg-white"
              role="dialog"
              aria-modal="true"
              aria-label="BachpanSe User Flows"
            >
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-foreground/10 px-4">
                <p className="text-[13px] font-extrabold tracking-wide">
                  BachpanSe <span className="text-primary">User Flows</span>
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-1.5 text-[12px] font-bold text-foreground/70 transition hover:bg-foreground/10 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                  Close
                </button>
              </div>
              <iframe
                title="BachpanSe User Flows"
                srcDoc={flowsHtml}
                className="min-h-0 w-full flex-1 border-0 bg-white"
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );
}
