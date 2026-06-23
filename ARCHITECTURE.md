---
last_updated: 2026-06-22T19:25:38Z
---

# Architecture Design

## System Overview
X-Trader is a Telegram mini app for intelligent crypto trading with MEXC integration. It features AI-powered signals, manual/auto trading, wallet management, whale tracking, and pump pools. Built with React frontend and Atoms Cloud backend.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + Framer Motion
- Charts: Lightweight Charts (TradingView)
- Backend: Atoms Cloud (Auth, Database, Edge Functions)
- Database: PostgreSQL (wallets, trades, signals, pump_pools, transactions)
- Auth: Atoms Cloud Auth (Telegram ID based)

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Welcome/Auth | Login screen, Telegram auth | WelcomeScreen.tsx, AuthCallback.tsx |
| Dashboard | Balance overview, stats, recent signals | Dashboard.tsx |
| AI Signals | Smart trading signals with auto-execute | AiSignals.tsx |
| Trading | Candlestick charts, order form, paper trading | TradingView.tsx |
| Wallet | Balance management, deposit/withdraw, vault | WalletVault.tsx |
| Pump Pools | Collaborative whale pools with progress rings | PumpPools.tsx |
| History | Trade and transaction history with filters | History.tsx |
| Navigation | Bottom tab navigation with 6 tabs | BottomNav.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chart Library | Lightweight Charts | TradingView quality, small bundle |
| Animation | Framer Motion | Smooth, declarative animations |
| Styling | Tailwind + Custom CSS | Dark glassmorphism theme, RTL support |
| State | React useState + web-sdk | Simple, no extra state library needed |
| Auth | Atoms Cloud Auth | Secure, Telegram ID integration ready |

## File Tree Plan
```
app/frontend/src/
├── App.tsx (Router setup)
├── index.css (Global styles, glassmorphism utilities)
├── lib/client.ts (Web SDK client)
├── pages/
│   ├── Index.tsx (Main app with tab switching)
│   └── AuthCallback.tsx (Auth callback handler)
├── components/
│   ├── WelcomeScreen.tsx (Login screen)
│   ├── BottomNav.tsx (6-tab navigation)
│   ├── Dashboard.tsx (Main dashboard)
│   ├── AiSignals.tsx (AI signal cards)
│   ├── TradingView.tsx (Chart + order form)
│   ├── WalletVault.tsx (Wallet + vault)
│   ├── PumpPools.tsx (Whale pools)
│   └── History.tsx (Transaction history)
```

## Implementation Guide
1. Auth flow: client.auth.me() -> WelcomeScreen if not logged in -> client.auth.toLogin() -> AuthCallback
2. Data: All entities accessed via client.entities.* (signals, pump_pools, trades, transactions, wallets)
3. Design: RTL Arabic, dark navy (#0a0e27), glassmorphism, neon green profit, ruby red loss, gold accents
4. Trading: Lightweight Charts for candlesticks, simulated price updates, paper trading toggle

