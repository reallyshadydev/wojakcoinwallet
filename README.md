# Wojakcoin Wallet

A self-custodial Wojakcoin (WJK) wallet UI with Electrs API integration.

**Wojakcoin network params** (from wojakcore): Legacy P2PKH only (W prefix), no SegWit, tx version 1, RPC port 20760.

## Contributors

- **[reallyshadydev](https://github.com/reallyshadydev)** — maintainer

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for the full list.

## Setup

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Configure environment**
   Copy `.env.example` to `.env.local` and adjust if needed:
   - **`NEXT_PUBLIC_ELECTRS_API_URL`** — wjk-electrs REST API (default: `https://api.wojakcoin.cash` for Android builds)
   - `NEXT_PUBLIC_BLOCK_EXPLORER_URL` — block explorer for tx links (default: `https://explorer.wojakcoin.cash`)

3. **Run wjk-electrs**
   The wallet needs a running [wjk-electrs](https://github.com/your-org/wjk-electrs) instance. Start it with:
   ```bash
   ./start-electrs.sh  # HTTP REST API on port 3001
   ```

4. **Start the wallet**
   ```bash
   npm run dev
   ```

## API Compatibility

The wallet uses the Electrs REST API as documented in `wjk-electrs/electrs-api-documentation.md`:
- `GET /address/<address>` — balance & stats
- `GET /address/<address>/txs` — transactions
- `GET /address/<address>/utxo` — UTXOs
- `GET /fee-estimates` — fee rates
- `POST /tx` — broadcast
- `GET /blocks/tip/height` — block height

## Android

This repo is set up for **Android** via Capacitor. See **[ANDROID.md](./ANDROID.md)** for prerequisites, env vars, and build steps. Quick path:

```bash
npm install --legacy-peer-deps
# Set NEXT_PUBLIC_ELECTRS_API_URL in .env.local to a public Electrs URL
npm run build:android
npm run open:android
```
