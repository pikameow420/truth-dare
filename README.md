# 💘 Truth or Dare – 3 Year Edition

A real-time Valentine's Day game for 2 players + 1 AI (Cupid AI).

## Quick Start (Local)

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
npm install
npm run dev
```

### 2. Client

```bash
cd client
# Create .env.local with:
# NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
npm install
npm run dev
```

Open `http://localhost:3000` in two browser tabs. Enter names and play!

## Deploy

### Backend → Render

1. Create a **Web Service** on [Render](https://render.com)
2. Connect your repo
3. Set **Root Directory** to `server`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. Add env vars:
   - `OPENAI_API_KEY` = your key
   - `CLIENT_URL` = your Vercel URL (e.g. `https://tp-game.vercel.app`)
   - `GPT_MODEL` = `gpt-4o-mini`

### Frontend → Vercel

1. Import repo on [Vercel](https://vercel.com)
2. Set **Root Directory** to `client`
3. Add env var:
   - `NEXT_PUBLIC_SOCKET_URL` = your Render URL (e.g. `https://tp-game-server.onrender.com`)

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Socket.io Client
- **Backend**: Express, Socket.io, OpenAI API
- **No database** — all state is in-memory
