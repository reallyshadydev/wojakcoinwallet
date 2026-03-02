"use client";

import { useState } from "react";
import { Key, Download, Loader2, AlertTriangle } from "lucide-react";
import { WojakCoinLogo } from "@/components/ui/wojakcoin-logo";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/lib/wallet-context";
import { generatePrivateKey, isValidWif } from "@/lib/wojakcoin-crypto";

export function SetupView() {
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
      setError("Passwords do not match");
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
      const msg = e instanceof Error ? e.message : "Failed to create wallet";
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
      setError("Enter your private key (WIF)");
      return;
    }
    if (!isValidWif(wif)) {
      setError("Invalid private key. Must be valid WojakCoin WIF format.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await importWallet(wif, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import wallet");
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
              Backup Your Private Key
            </CardTitle>
            <CardDescription>
              Save this private key securely. It is the only way to recover your wallet.
              Anyone with this key can steal your funds. Never share it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 font-mono text-sm break-all select-all">
              {newWif}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={handleBackupConfirmed} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Creating..." : "I have saved my private key"}
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
          <CardTitle className="text-xl">WojakCoin Wallet</CardTitle>
          <CardDescription>Create a new wallet or import with private key</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => { setMode(v as "create" | "import"); setError(""); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Generate a new private key. You will be shown the key once — save it securely.
              </p>
              <div className="space-y-2">
                <Label>Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave empty for no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
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
                {loading ? "Creating..." : "Create Wallet"}
              </Button>
            </TabsContent>
            <TabsContent value="import" className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste your existing WojakCoin private key (WIF format).
              </p>
              <div className="space-y-2">
                <Label>Private Key (WIF)</Label>
                <Input
                  type="password"
                  placeholder="Wjngi9yNyLCMzXfWZpRgHPKQ..."
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="font-mono"
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>Password (optional)</Label>
                <Input
                  type="password"
                  placeholder="Leave empty if wallet has no password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  data-1p-ignore
                  data-lpignore="true"
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
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
                {loading ? "Importing..." : "Import Wallet"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
