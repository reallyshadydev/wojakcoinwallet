"use client";

import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";
import { WojakCoinLogo } from "@/components/ui/wojakcoin-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useWallet } from "@/lib/wallet-context";
import { useLocale } from "@/lib/i18n/locale-provider";

export function LockScreen() {
  const { t } = useLocale();
  const { unlockWallet, staySignedIn } = useWallet();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [stayChecked, setStayChecked] = useState(staySignedIn);
  useEffect(() => setStayChecked(staySignedIn), [staySignedIn]);

  async function handleUnlock() {
    setIsUnlocking(true);
    setError("");
    const success = await unlockWallet(password, stayChecked);
    if (!success) {
      setError(t("lock.error_incorrect"));
    }
    setIsUnlocking(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <WojakCoinLogo size={38} className="text-primary-foreground" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">{t("lock.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("lock.subtitle")}</p>
          </div>

          <form
            className="flex w-full flex-col gap-3"
            autoComplete="off"
            onSubmit={(e) => { e.preventDefault(); handleUnlock(); }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="unlock-password" className="text-xs text-muted-foreground">{t("lock.password_label")}</Label>
              <Input
                id="unlock-password"
                name="wallet-unlock"
                type="password"
                placeholder={t("lock.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                autoComplete="off"
                autoFocus
                data-1p-ignore
                data-lpignore="true"
                data-form-type="other"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="stay-signed-in"
                checked={stayChecked}
                onCheckedChange={(c) => setStayChecked(!!c)}
              />
              <Label htmlFor="stay-signed-in" className="text-xs cursor-pointer">
                {t("lock.stay_signed_in")}
              </Label>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isUnlocking ? t("lock.unlocking") : t("lock.unlock")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
