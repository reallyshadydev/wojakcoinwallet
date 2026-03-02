import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cash.wojakcoin.wallet',
  appName: 'WojakCoin Wallet',
  webDir: 'out',
  server: {
    // For production, point to your deployed Next.js app to use API routes:
    // url: 'https://your-domain.com',
    // cleartext: true,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
