"use client";

import { useState } from "react";
import { Download, Loader2, AlertTriangle } from "lucide-react";
import { WojakCoinLogo } from "@/components/ui/wojakcoin-logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/lib/wallet-context";
import { generatePrivateKey, isValidWif } from "@/lib/wojakcoin-crypto";
import { useLocale } from "@/lib/i18n/locale-provider";

export function SetupView() {
  const { t } = useLocale();
  const { createWallet, importWallet } = useWallet();
  const [mode, setMode] = useState<"create" | "import">("create");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backupShown, setBackupShown] = useState(false);
  const [newWif, setNewWif] = useState("");

  function handleCreate() {
    setError("");
    if (password !== confirmPassword) {
      setError(t("setup.err_password_match"));
      return;
    }
    const wif = generatePrivateKey();
    setNewWif(wif);
    setBackupShown(true);
  }

  async function handleBackupConfirmed() {
    if (!newWif) return;
    setLoading(true);
    setError("");
    try {
      await createWallet(newWif, password);
      setBackupShown(false);
      setNewWif("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("setup.err_create");
      setError(msg);
      console.error("Wallet creation failed:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleImport() {
    setError("");
    const wif = privateKey.trim();
    if (!wif) {
      setError(t("setup.err_enter_wif"));
      return;
    }
    if (!isValidWif(wif)) {
      setError(t("setup.err_invalid_wif"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("setup.err_password_match"));
      return;
    }
    setLoading(true);
    try {
      await importWallet(wif, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("setup.err_import"));
    } finally {
      setLoading(false);
    }
  }

  if (backupShown && newWif) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("setup.backup_title")}
            </CardTitle>
            <CardDescription>
              {t("setup.backup_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm break-all select-all">
              {newWif}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleBackupConfirmed} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? t("setup.creating") : t("setup.saved_key")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <WojakCoinLogo size={34} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{t("setup.title")}</CardTitle>
          <CardDescription>{t("setup.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => { setMode(v as "create" | "import"); setError(""); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">{t("setup.create")}</TabsTrigger>
              <TabsTrigger value="import">{t("setup.import")}</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("setup.create_desc")}
              </p>
              <div className="space-y-2">
                <Label>{t("setup.password_optional")}</Label>
                <Input
                  type="password"
                  placeholder={t("setup.password_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("setup.confirm_password")}</Label>
                <Input
                  type="password"
                  placeholder={t("setup.repeat_password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {loading ? t("setup.creating") : t("setup.create_wallet")}
              </Button>
            </TabsContent>
            <TabsContent value="import" className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("setup.import_desc")}
              </p>
              <div className="space-y-2">
                <Label>{t("setup.private_key_wif")}</Label>
                <Input
                  type="password"
                  placeholder={t("setup.wif_placeholder")}
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="font-mono"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("setup.password_optional")}</Label>
                <Input
                  type="password"
                  placeholder={t("setup.password_import_placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("setup.confirm_password")}</Label>
                <Input
                  type="password"
                  placeholder={t("setup.repeat_password")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button
                className="w-full"
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {loading ? t("setup.importing") : t("setup.import_wallet")}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
