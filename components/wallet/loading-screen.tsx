"use client";

import { Loader2 } from "lucide-react";
import { WojakCoinLogo } from "@/components/ui/wojakcoin-logo";

export function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
        <WojakCoinLogo size={38} className="text-primary-foreground" />
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm font-medium">Loading wallet...</span>
      </div>
    </div>
  );
}
