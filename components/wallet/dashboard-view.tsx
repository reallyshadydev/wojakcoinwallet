"use client";

import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Send, Download, RefreshCw, TrendingUp, Clock, CheckCircle2, ChevronDown, Loader2, ShoppingCart, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet } from "@/lib/wallet-context";
import { useLocale } from "@/lib/i18n/locale-provider";
import { formatWjk, satsToWjk, shortenTxid, formatFiat, FIAT_CURRENCIES } from "@/lib/wojakcoin-api";

const BUY_LINKS = [
  { label: "NestEx (WJK/USDT)", href: "https://trade.nestex.one/spot/WJK" },
  { label: "KlingEx (WJK-USDT)", href: "https://klingex.io/trade/WJK-USDT" },
  { label: "Rabid Rabbit Exchange (WJK-USDT)", href: "https://rabid-rabbit.org/account/trade/WJK-USDT" },
  { label: "GateVia (WJK/LTC, WJK/DOGE)", href: "https://gatevia.io/" },
  { label: "Komodo (WJK wallet)", href: "https://app.komodoplatform.com/wallet/wjk" },
  { label: "GLEEC (WJK wallet/DEX)", href: "https://dex.gleec.com/wallet/wjk" },
];

export function DashboardView() {
  const { t } = useLocale();
  const [buyOpen, setBuyOpen] = useState(false);
  const {
    address,
    balanceConfirmed,
    balanceUnconfirmed,
    balanceTotal,
    coinPrice,
    fiatCurrency,
    transactions,
    utxos,
    blockHeight,
    feeEstimates,
    setActiveView,
    refreshWallet,
    setFiatCurrency,
    isSyncing,
  } = useWallet();

  const fiatValue = satsToWjk(balanceTotal) * coinPrice;
  const recentTxs = transactions.slice(0, 5);
  const ownAddresses = new Set([address]);

  function classifyTx(tx: typeof transactions[0]): "incoming" | "outgoing" {
    const sentFromOwn = tx.vin.some((v) => v.prevout && ownAddresses.has(v.prevout.scriptpubkey_address));
    if (sentFromOwn) return "outgoing";
    return "incoming";
  }

  function getTxAmount(tx: typeof transactions[0]): number {
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

  return (
    <div className="flex flex-col gap-6">
      {/* Buy button — top right */}
      <div className="flex justify-end">
        <Button type="button" onClick={() => setBuyOpen(true)} className="gap-2">
          <ShoppingCart className="h-4 w-4" />
          {t("dash.buy_wjk")}
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("dash.total_balance")}</p>
          <h2 className="mt-1 text-4xl font-bold text-foreground font-mono tracking-tight">
            {formatWjk(balanceTotal)} <span className="text-lg text-muted-foreground">WJK</span>
          </h2>
          {coinPrice > 0 && (
            <p className="mt-1 text-lg text-muted-foreground font-mono">
              {formatFiat(fiatValue, fiatCurrency)}
            </p>
          )}
        </div>
        <div className="flex gap-2 sm:gap-3">
          <Button onClick={() => setActiveView("send")} className="gap-2">
            <Send className="h-4 w-4" />
            {t("dash.send")}
          </Button>
          <Button onClick={() => setActiveView("receive")} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("dash.receive")}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1.5 font-mono">
                {fiatCurrency}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {FIAT_CURRENCIES.map(({ code, label }) => (
                <DropdownMenuItem
                  key={code}
                  onClick={() => setFiatCurrency(code)}
                >
                  {code} — {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => refreshWallet()}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="sr-only">{isSyncing ? t("dash.refresh_sr_syncing") : t("dash.refresh_sr")}</span>
          </Button>
        </div>
      </div>

      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("dash.buy_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("dash.buy_dialog_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {BUY_LINKS.map((link) => (
              <Button key={link.href} asChild variant="outline" className="justify-between">
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  <span>{link.label}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <p className="text-xs font-medium text-muted-foreground">{t("dash.confirmed")}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground font-mono">{formatWjk(balanceConfirmed)} WJK</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">{t("dash.unconfirmed")}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground font-mono">{formatWjk(balanceUnconfirmed)} WJK</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">{t("dash.fee_next_block")}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground font-mono">
              {(feeEstimates["1"] ?? feeEstimates["2"] ?? feeEstimates["3"] ?? "—")} sat/vB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">{t("dash.wjk_price")}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground font-mono">
              {coinPrice > 0 ? formatFiat(coinPrice, fiatCurrency) : t("dash.na")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">{t("dash.block_height")}</p>
            </div>
            <p className="mt-2 text-sm font-bold text-foreground font-mono">{blockHeight.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold">{t("dash.recent_tx")}</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => setActiveView("transactions")}>
              {t("dash.view_all")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentTxs.map((tx) => {
                const direction = classifyTx(tx);
                const amount = getTxAmount(tx);
                return (
                  <div key={tx.txid} className="flex items-center justify-between px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${direction === "incoming" ? "bg-success/10" : "bg-destructive/10"}`}>
                        {direction === "incoming" ? (
                          <ArrowDownLeft className="h-4 w-4 text-success" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground capitalize">{t(`dash.${direction}`)}</p>
                        <p className="text-xs font-mono text-muted-foreground">{shortenTxid(tx.txid)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold font-mono ${direction === "incoming" ? "text-success" : "text-destructive"}`}>
                        {direction === "incoming" ? "+" : "-"}{formatWjk(amount)} WJK
                      </p>
                      <div className="mt-0.5">
                        {tx.status.confirmed ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{t("dash.confirmed")}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">{t("dash.pending")}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {recentTxs.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                  {t("dash.no_tx")}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* UTXO & Fee Panel */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t("dash.utxos")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("dash.total_utxos")}</span>
                  <span className="text-sm font-bold text-foreground">{utxos.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("dash.confirmed")}</span>
                  <span className="text-sm font-mono text-foreground">{utxos.filter((u) => u.status.confirmed).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{t("dash.unconfirmed")}</span>
                  <span className="text-sm font-mono text-foreground">{utxos.filter((u) => !u.status.confirmed).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t("dash.fee_estimates")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {Object.entries(feeEstimates).length > 0 ? (
                  Object.entries(feeEstimates)
                    .slice(0, 4)
                    .map(([target, rate]) => (
                      <div key={target} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {target === "1" ? t("dash.next_block") : t("dash.blocks", { n: target })}
                        </span>
                        <span className="text-xs font-mono text-foreground">{rate} sat/vB</span>
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-muted-foreground">{t("dash.refreshing")}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
