import { WalletProvider } from "@/lib/wallet-context";
import { WalletShell } from "@/components/wallet/wallet-shell";

export default function Page() {
  return (
    <WalletProvider>
      <WalletShell />
    </WalletProvider>
  );
}
