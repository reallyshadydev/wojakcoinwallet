"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Search, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "@/lib/wallet-context";
import { formatWjk, shortenTxid, shortenAddress, getExplorerTxUrl } from "@/lib/wojakcoin-api";
import type { Transaction } from "@/lib/wojakcoin-api";

type TxFilter = "all" | "incoming" | "outgoing" | "pending";

export function TransactionsView() {
  const { transactions, address } = useWallet();
  const [filter, setFilter] = useState<TxFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  const ownAddresses = new Set([address]);

  function classifyTx(tx: Transaction): "incoming" | "outgoing" {
    const sentFromOwn = tx.vin.some(
      (v) => v.prevout && ownAddresses.has(v.prevout.scriptpubkey_address)
    );
    return sentFromOwn ? "outgoing" : "incoming";
  }

  function getTxAmount(tx: Transaction): number {
    const direction = classifyTx(tx);
    if (direction === "incoming") {
      return tx.vout
        .filter((o) => ownAddresses.has(o.scriptpubkey_address))
        .reduce((sum, o) => sum + o.value, 0);
    }
    const totalIn = tx.vin.reduce((s, v) => s + (v.prevout?.value ?? 0), 0);
    const changeBack = tx.vout
      .filter((o) => ownAddresses.has(o.scriptpubkey_address))
      .reduce((s, o) => s + o.value, 0);
    return totalIn - changeBack - tx.fee;
  }

  const filtered = transactions.filter((tx) => {
    if (filter === "pending" && tx.status.confirmed) return false;
    if (filter === "incoming" && classifyTx(tx) !== "incoming") return false;
    if (filter === "outgoing" && classifyTx(tx) !== "outgoing") return false;
    if (searchQuery && !tx.txid.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const filters: { label: string; value: TxFilter }[] = [
    { label: "All", value: "all" },
    { label: "Incoming", value: "incoming" },
    { label: "Outgoing", value: "outgoing" },
    { label: "Pending", value: "pending" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Transactions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {transactions.length} total transactions
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filters.map(({ label, value }) => (
            <Button
              key={value}
              variant={filter === value ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by txid..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs font-mono w-full sm:w-64"
          />
        </div>
      </div>

      {/* Transaction List */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filtered.map((tx) => {
              const direction = classifyTx(tx);
              const amount = getTxAmount(tx);
              const isExpanded = expandedTx === tx.txid;
              const date = tx.status.block_time
                ? new Date(tx.status.block_time * 1000)
                : null;

              return (
                <div key={tx.txid}>
                  <button
                    className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-secondary/50 sm:px-6"
                    onClick={() => setExpandedTx(isExpanded ? null : tx.txid)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          direction === "incoming" ? "bg-success/10" : "bg-destructive/10"
                        }`}
                      >
                        {direction === "incoming" ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground capitalize">
                            {direction}
                          </p>
                          {!tx.status.confirmed && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                              Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs font-mono text-muted-foreground">
                          {shortenTxid(tx.txid)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold font-mono ${
                          direction === "incoming" ? "text-success" : "text-destructive"
                        }`}
                      >
                        {direction === "incoming" ? "+" : "-"}
                        {formatWjk(amount)} WJK
                      </p>
                      {date && (
                        <p className="text-[10px] text-muted-foreground">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-secondary/30 px-4 py-4 sm:px-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Transaction Details</p>
                          <div className="flex flex-col gap-2">
                            <div>
                              <span className="text-[10px] text-muted-foreground">TXID</span>
                              <p className="text-xs font-mono text-foreground break-all">{tx.txid}</p>
                            </div>
                            <div className="flex gap-4">
                              <div>
                                <span className="text-[10px] text-muted-foreground">Size</span>
                                <p className="text-xs font-mono text-foreground">{tx.size} bytes</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">Weight</span>
                                <p className="text-xs font-mono text-foreground">{tx.weight} WU</p>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">Fee</span>
                                <p className="text-xs font-mono text-foreground">{tx.fee.toLocaleString()} sats</p>
                              </div>
                            </div>
                            {tx.status.confirmed && (
                              <div>
                                <span className="text-[10px] text-muted-foreground">Block</span>
                                <p className="text-xs font-mono text-foreground">#{tx.status.block_height?.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Inputs / Outputs</p>
                          <div className="flex flex-col gap-1">
                            {tx.vin.slice(0, 3).map((vin, i) => (
                              <div key={i} className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[9px] px-1">IN</Badge>
                                <span className="text-[10px] font-mono text-muted-foreground truncate">
                                  {vin.prevout ? shortenAddress(vin.prevout.scriptpubkey_address) : "coinbase"}
                                </span>
                              </div>
                            ))}
                            <Separator className="my-1" />
                            {tx.vout.slice(0, 3).map((vout, i) => (
                              <div key={i} className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1">
                                  <Badge variant="outline" className="text-[9px] px-1">OUT</Badge>
                                  <span className="text-[10px] font-mono text-muted-foreground truncate">
                                    {shortenAddress(vout.scriptpubkey_address)}
                                  </span>
                                </div>
                                <span className="text-[10px] font-mono text-foreground">{formatWjk(vout.value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <a
                          href={getExplorerTxUrl(tx.txid)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View on Explorer
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">
                No transactions match your filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
