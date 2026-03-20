import { WalletProvider } from "@/lib/wallet-context";
import { WalletShell } from "@/components/wallet/wallet-shell";
import { LocaleProvider } from "@/lib/i18n/locale-provider";

export default function Page() {
  return (
    <LocaleProvider>
      <WalletProvider>
        <WalletShell />
      </WalletProvider>
    </LocaleProvider>
  );
}
