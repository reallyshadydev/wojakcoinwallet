"use client";

import { useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWallet } from "@/lib/wallet-context";
import { useLocale } from "@/lib/i18n/locale-provider";
import { wjkToSats } from "@/lib/wojakcoin-api";
import { copyToClipboard } from "@/lib/clipboard";
import { QRCodeSVG } from "qrcode.react";

export function ReceiveView() {
  const { t } = useLocale();
  const { address } = useWallet();
  const [copied, setCopied] = useState(false);
  const [requestAmount, setRequestAmount] = useState("");

  const handleCopy = useCallback(async () => {
    await copyToClipboard(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [address]);

  const amountSats = wjkToSats(parseFloat(requestAmount) || 0);
  const bip21Uri = amountSats > 0
    ? `wojakcoin:${address}?amount=${requestAmount}`
    : `wojakcoin:${address}`;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground">{t("receive.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("receive.subtitle")}
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-6">
          <div className="inline-block rounded-xl bg-white p-4">
            <QRCodeSVG
              value={bip21Uri}
              size={200}
              level="M"
              marginSize={4}
              bgColor="#ffffff"
              fgColor="#111111"
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">{t("receive.your_address")}</Label>
            <div className="flex gap-2">
              <Input readOnly value={address} className="font-mono text-xs" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">{t("receive.copy_sr")}</span>
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {t("receive.address_note")}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Label htmlFor="request-amount" className="text-xs font-medium text-muted-foreground">
              {t("receive.request_amount")}
            </Label>
            <Input
              id="request-amount"
              type="number"
              step="0.00000001"
              min="0"
              placeholder="0.00000000 WJK"
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <Button className="w-full gap-2" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
            {t("receive.copy_address")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
