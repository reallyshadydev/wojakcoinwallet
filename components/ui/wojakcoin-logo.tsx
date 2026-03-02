"use client";

/**
 * WojakCoin Wallet logo - wojaklogo.jpg
 * Uses img to avoid Next.js image optimization 500 errors with basePath.
 */
export function WojakCoinLogo({
  className = "h-6 w-6",
  size,
}: {
  className?: string;
  size?: number;
}) {
  const s = size ?? 28;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return (
    <img
      src={`${base}/wojaklogo.jpg`}
      alt="WojakCoin"
      width={s}
      height={s}
      className={`rounded-full object-cover ${className}`}
      aria-hidden
    />
  );
}
