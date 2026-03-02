"use client";

import React from "react"

import {
  LayoutDashboard,
  Send,
  Download,
  History,
  Settings,
  BookOpen,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWallet, type WalletView } from "@/lib/wallet-context";

const mobileNavItems: { label: string; view: WalletView; icon: React.ElementType }[] = [
  { label: "Home", view: "dashboard", icon: LayoutDashboard },
  { label: "Send", view: "send", icon: Send },
  { label: "Receive", view: "receive", icon: Download },
  { label: "Addresses", view: "addressbook", icon: BookOpen },
  { label: "History", view: "transactions", icon: History },
  { label: "Settings", view: "settings", icon: Settings },
];

export function MobileNav() {
  const { activeView, setActiveView, lockWallet } = useWallet();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1 md:hidden">
      <div className="grid grid-cols-7 overflow-hidden rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-card/90">
        {mobileNavItems.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={cn(
              "flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 py-3 text-[10px] font-medium leading-tight transition-colors",
              activeView === view
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="w-full truncate text-center">{label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={lockWallet}
          className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 py-3 text-[10px] font-medium leading-tight text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
        >
          <Lock className="h-5 w-5 shrink-0" />
          <span className="w-full truncate text-center">Lock</span>
        </button>
      </div>
    </nav>
  );
}
