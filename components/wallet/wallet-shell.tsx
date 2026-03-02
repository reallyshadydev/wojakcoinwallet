"use client";

import { useWallet } from "@/lib/wallet-context";
import { SidebarNav } from "./sidebar-nav";
import { MobileNav } from "./mobile-nav";
import { DashboardView } from "./dashboard-view";
import { SendView } from "./send-view";
import { ReceiveView } from "./receive-view";
import { TransactionsView } from "./transactions-view";
import { SettingsView } from "./settings-view";
import { AddressBookView } from "./addressbook-view";
import { LockScreen } from "./lock-screen";
import { LoadingScreen } from "./loading-screen";
import { SetupView } from "./setup-view";
import { ScrollArea } from "@/components/ui/scroll-area";

function ActiveViewContent() {
  const { activeView } = useWallet();
  switch (activeView) {
    case "dashboard":
      return <DashboardView />;
    case "send":
      return <SendView />;
    case "receive":
      return <ReceiveView />;
    case "transactions":
      return <TransactionsView />;
    case "settings":
      return <SettingsView />;
    case "addressbook":
      return <AddressBookView />;
    default:
      return <DashboardView />;
  }
}

export function WalletShell() {
  const { isLoaded, isLocked, hasStoredWallet } = useWallet();

  if (!isLoaded) return <LoadingScreen />;
  if (!hasStoredWallet) return <SetupView />;
  if (isLocked) return <LockScreen />;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden md:block">
        <SidebarNav />
      </div>
      <main className="flex flex-1 flex-col overflow-hidden">
        <ScrollArea className="flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 pb-[calc(8rem+env(safe-area-inset-bottom))] md:px-8 md:py-8 md:pb-8">
            <ActiveViewContent />
          </div>
        </ScrollArea>
      </main>
      <MobileNav />
    </div>
  );
}
