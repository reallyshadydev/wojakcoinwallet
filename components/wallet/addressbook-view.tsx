"use client";

import { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Trash2, Copy, Send, Check, QrCode, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";
import {
  getAddressBook,
  addAddress,
  removeAddress,
  isInAddressBook,
  type AddressBookEntry,
} from "@/lib/addressbook-storage";
import { copyToClipboard } from "@/lib/clipboard";
import { QrScannerModal } from "./qr-scanner-modal";
import { parseWojakCoinQr } from "@/lib/parse-bip21";
import { useToast } from "@/hooks/use-toast";

// Only allow WojakCoin address characters (base58: W prefix then 1-9, A-H, J-N, P-Z, a-k, m-z)
function filterAddressInput(value: string): string {
  let out = "";
  for (const c of value) {
    if (c === "W" && !out) out += c;
    else if (/[1-9A-HJ-NP-Za-km-z]/.test(c)) out += c;
  }
  return out;
}

export function AddressBookView() {
  const { setActiveView, setPresetRecipientAddress } = useWallet();
  const [entries, setEntries] = useState<AddressBookEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const { toast } = useToast();

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.trim().toLowerCase();
    return entries.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.address.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  useEffect(() => {
    setEntries(getAddressBook());
  }, []);

  function handleAdd() {
    const addr = newAddress.trim();
    if (!addr || !addr.startsWith("W")) return;
    if (isInAddressBook(addr)) {
      toast({
        title: "Address already in book",
        description: "This address is already saved in your address book.",
        variant: "destructive",
      });
      return;
    }
    const added = addAddress(newLabel.trim() || "Unnamed", addr);
    if (!added) {
      toast({
        title: "Address already in book",
        description: "This address is already saved in your address book.",
        variant: "destructive",
      });
      return;
    }
    setEntries(getAddressBook());
    setNewLabel("");
    setNewAddress("");
    toast({ title: "Added to address book", description: newLabel.trim() || addr.slice(0, 16) + "..." });
  }

  function handleRemove(addr: string) {
    removeAddress(addr);
    setEntries(getAddressBook());
  }

  async function handleCopy(addr: string) {
    await copyToClipboard(addr);
    setCopied(addr);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleQrScan(text: string) {
    const parsed = parseWojakCoinQr(text);
    if (parsed) setNewAddress(parsed.address);
  }

  function handleUseForSend(addr: string) {
    setPresetRecipientAddress(addr);
    setActiveView("send");
  }

  const canAdd =
    newAddress.trim().length >= 26 &&
    newAddress.trim().startsWith("W") &&
    !isInAddressBook(newAddress);

  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">Address Book</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Save addresses you send to for quick access.
        </p>
      </div>

      {/* Add new */}
      <Card className="mb-6 min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </CardTitle>
          <CardDescription>
            Add a WojakCoin address and label to your address book.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ab-label" className="text-xs">
              Label (optional)
            </Label>
            <Input
              id="ab-label"
              placeholder="e.g. Exchange, Friend"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="font-medium"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="ab-address" className="text-xs">
                WojakCoin Address
              </Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                onClick={() => setScanOpen(true)}
                title="Scan QR code"
              >
                <QrCode className="h-4 w-4" />
                Scan
              </Button>
            </div>
            <Input
              id="ab-address"
              placeholder="Wjngi9yNyLCMzXfWZpRgHPKQ..."
              value={newAddress}
              onChange={(e) => setNewAddress(filterAddressInput(e.target.value))}
              className="font-mono text-sm"
            />
          </div>
          <QrScannerModal
            open={scanOpen}
            onOpenChange={setScanOpen}
            onScan={handleQrScan}
            title="Scan Address"
            description="Scan a WojakCoin address QR code"
          />
          <Button onClick={handleAdd} disabled={!canAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add to Address Book
          </Button>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Saved Addresses
          </CardTitle>
          <CardDescription>
            {entries.length} {entries.length === 1 ? "address" : "addresses"} saved
          </CardDescription>
          {entries.length > 0 && (
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-normal"
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto">
          {entries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No addresses yet. Add one above to get started.
            </p>
          ) : filteredEntries.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No matches for &quot;{searchQuery.trim()}&quot;.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.address}
                  className="flex items-center justify-between gap-3 py-4 first:pt-0 last:pb-0 min-w-0"
                >
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="font-medium text-foreground truncate">
                      {entry.label}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all mt-0.5">
                      {entry.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUseForSend(entry.address)}
                      title="Use for Send"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(entry.address)}
                      title="Copy address"
                    >
                      {copied === entry.address ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemove(entry.address)}
                      title="Remove"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
