"use client";

import React from "react"

import {
  LayoutDashboard,
  Send,
  Download,
  History,
  Settings,
  Lock,
  RefreshCw,
  Loader2,
  BookOpen,
} from "lucide-react";
import { WojakCoinLogo } from "@/components/ui/wojakcoin-logo";
import { cn } from "@/lib/utils";
import { useWallet, type WalletView } from "@/lib/wallet-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatWjk } from "@/lib/wojakcoin-api";

const navItems: { label: string; view: WalletView; icon: React.ElementType }[] = [
  { label: "Dashboard", view: "dashboard", icon: LayoutDashboard },
  { label: "Send", view: "send", icon: Send },
  { label: "Receive", view: "receive", icon: Download },
  { label: "Address Book", view: "addressbook", icon: BookOpen },
  { label: "Transactions", view: "transactions", icon: History },
  { label: "Settings", view: "settings", icon: Settings },
];

export function SidebarNav() {
  const { activeView, setActiveView, balanceTotal, lockWallet, refreshWallet, lastSynced, network, blockHeight, isSyncing } = useWallet();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <WojakCoinLogo className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">WojakCoin Wallet</h1>
          <p className="text-xs text-muted-foreground capitalize">{network}</p>
        </div>
      </div>

      <Separator />

      {/* Balance Summary */}
      <div className="px-6 py-4">
        <p className="text-xs font-medium text-muted-foreground">Total Balance</p>
        <p className="mt-1 text-lg font-bold text-foreground font-mono">
          {formatWjk(balanceTotal)} <span className="text-xs text-muted-foreground">WJK</span>
        </p>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {navItems.map(({ label, view, icon: Icon }) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              activeView === view
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4">
        <Separator className="mb-4" />
        <div className="mb-3 px-3">
          <p className="text-xs text-muted-foreground">
            Block: <span className="font-mono text-foreground">{blockHeight.toLocaleString()}</span>
          </p>
          {lastSynced && (
            <p className="mt-1 text-xs text-muted-foreground">
              Synced {lastSynced.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs bg-transparent"
            disabled={isSyncing}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              refreshWallet();
            }}
          >
            {isSyncing ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3 w-3" />
            )}
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs bg-transparent"
            onClick={lockWallet}
          >
            <Lock className="mr-1.5 h-3 w-3" />
            Lock
          </Button>
        </div>
      </div>
    </aside>
  );
}
