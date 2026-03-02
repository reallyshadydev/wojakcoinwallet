"use client";

import { useEffect, useState } from "react";
import { Smartphone } from "lucide-react";

function isLikelyMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const ua = navigator.userAgent || "";
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  return coarsePointer || mobileUA;
}

function isLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: landscape)").matches;
}

export function OrientationGuard() {
  const [blockLandscape, setBlockLandscape] = useState(false);

  useEffect(() => {
    const mobile = isLikelyMobileDevice();

    const update = () => {
      setBlockLandscape(mobile && isLandscape());
    };

    const tryLockPortrait = async () => {
      if (!mobile) return;
      try {
        if (screen.orientation?.lock) {
          await screen.orientation.lock("portrait");
        }
      } catch {
        // Not all browsers allow orientation lock outside full-screen/PWA.
      }
    };

    update();
    void tryLockPortrait();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        update();
        void tryLockPortrait();
      }
    };

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  if (!blockLandscape) return null;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-background p-6 text-center">
      <div className="rounded-full border border-border bg-card p-3">
        <Smartphone className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Portrait Mode Required</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        Please rotate your device to portrait orientation to continue using the wallet.
      </p>
    </div>
  );
}

