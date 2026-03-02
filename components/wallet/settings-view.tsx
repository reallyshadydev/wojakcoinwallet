"use client";

import { useState } from "react";
import { Shield, Server, Copy, Check, Wallet, AlertTriangle, Key, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from "@/lib/wallet-context";
import { deleteWallet, STORAGE_BACKEND, isWalletEncrypted } from "@/lib/wallet-storage";
import { copyToClipboard } from "@/lib/clipboard";
import { HardDrive } from "lucide-react";

export function SettingsView() {
  const { network, address, utxos, getPrivateKey } = useWallet();
  const [electrsUrl, setElectrsUrl] = useState("https://api.wojakcoin.cash");
  const [explorerUrl, setExplorerUrl] = useState("https://explorer.wojakcoin.cash");
  const [copied, setCopied] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [keyCopied, setKeyCopied] = useState(false);

  const handleCopyAddress = async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteWallet = () => {
    if (typeof window !== "undefined" && confirm("Delete wallet? You will need your private key to recover. This cannot be undone.")) {
      deleteWallet();
      window.location.reload();
    }
  };

  const handleCopyPrivateKey = async () => {
    const wif = getPrivateKey();
    if (wif) {
      await copyToClipboard(wif);
      setKeyCopied(true);
      setTimeout(() => setKeyCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your wallet.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="general" className="text-xs">General</TabsTrigger>
          <TabsTrigger value="network" className="text-xs">Network</TabsTrigger>
          <TabsTrigger value="utxos" className="text-xs">UTXOs</TabsTrigger>
          <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-primary" />
                Wallet
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Network</p>
                  <p className="text-xs text-muted-foreground">WojakCoin</p>
                </div>
                <Badge variant="secondary" className="capitalize">{network}</Badge>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Address</Label>
                <div className="flex gap-2">
                  <Input readOnly value={address} className="font-mono text-xs" />
                  <Button variant="outline" size="icon" onClick={handleCopyAddress}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                    <span className="sr-only">Copy</span>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Legacy P2PKH (W prefix). Single-address wallet.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Address Type</p>
                  <p className="text-xs text-muted-foreground">Private key only, no mnemonic</p>
                </div>
                <Badge variant="outline">P2PKH</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Storage</p>
                    <p className="text-xs text-muted-foreground">
                      Wallet stored locally. Never on any server.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {isWalletEncrypted() ? `${STORAGE_BACKEND} (encrypted)` : `${STORAGE_BACKEND} (plain)`}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Server className="h-4 w-4 text-primary" />
                Electrs API
              </CardTitle>
              <CardDescription className="text-xs">
                Configure via .env. Restart required to apply.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Electrs API URL</Label>
                <Input value={electrsUrl} readOnly className="font-mono text-xs" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Block Explorer</Label>
                <Input value={explorerUrl} readOnly className="font-mono text-xs" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utxos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Unspent Outputs</CardTitle>
              <CardDescription className="text-xs">{utxos.length} UTXOs</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {utxos.map((utxo) => (
                  <div key={`${utxo.txid}:${utxo.vout}`} className="flex items-center justify-between px-6 py-3">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs font-mono text-foreground truncate max-w-[200px]">
                        {utxo.txid.slice(0, 16)}...:{utxo.vout}
                      </p>
                      {utxo.status.confirmed ? (
                        <Badge variant="secondary" className="text-[9px] w-fit">Block #{utxo.status.block_height}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] w-fit border-primary/30 text-primary">Unconfirmed</Badge>
                      )}
                    </div>
                    <span className="text-sm font-mono font-bold">{(utxo.value / 100_000_000).toFixed(8)} WJK</span>
                  </div>
                ))}
                {utxos.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-muted-foreground">No UTXOs</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Key className="h-4 w-4 text-primary" />
                Private Key
              </CardTitle>
              <CardDescription className="text-xs">
                Your private key (WIF) controls all funds at your address. Never share it.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    Anyone with this key can spend your funds. Only reveal it to backup or import elsewhere.
                  </p>
                </div>
              </div>
              {showPrivateKey ? (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Private Key (WIF)</Label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={getPrivateKey() ?? ""}
                      className="font-mono text-xs"
                      type="text"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyPrivateKey}>
                      {keyCopied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setShowPrivateKey(false)}>
                      <EyeOff className="h-4 w-4" />
                      <span className="sr-only">Hide</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPrivateKey(true)}>
                  <Eye className="h-4 w-4" />
                  Reveal Private Key
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-primary" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <div className="flex gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <p className="text-xs text-destructive">
                    Deleting removes the encrypted wallet from this device. Ensure you have your private key backed up before proceeding.
                  </p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteWallet}>
                Delete Wallet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
