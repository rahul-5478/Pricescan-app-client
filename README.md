# ⚡ PriceScan — Smart Overpricing Detector

AI-powered product price analysis using **MERN Stack + Django microservice + Anthropic Claude**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│              React + Vite  (port 5173)                      │
└────────────────────────┬────────────────────────────────────┘
                         │ REST /api/*
┌────────────────────────▼────────────────────────────────────┐
│           Node.js + Express  (port 5000)                    │
│    Auth · JWT · MongoDB · Redis cache · API gateway         │
└──────────┬──────────────────────────┬───────────────────────┘
           │ Mongoose                 │ Internal HTTP
   ┌───────▼───────┐        ┌─────────▼─────────┐
   │   MongoDB     │        │  Django + DRF      │
   │  (port 27017) │        │   (port 8000)      │
   └───────────────┘        │  Claude AI calls   │
                            └────────────────────┘
           Redis (port 6379) — caches analysis results 1hr
```

---

## Quick Start (Docker — Recommended)

```bash
cp server/.env.example server/.env
cp ai-service/.env.example ai-service/.env
# Add your ANTHROPIC_API_KEY to ai-service/.env
docker-compose up --build
```

Open **http://localhost:5173**

---

## Quick Start (Manual — 3 Terminals)

**Terminal 1 — React**
```bash
cd client && npm install && npm run dev
```

**Terminal 2 — Express**
```bash
cd server && npm install && npm run dev
```

**Terminal 3 — Django**
```bash
cd ai-service
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

> ⚠️ Make sure MongoDB and Redis are running locally first.

---

## Environment Variables

### `server/.env`
| Variable | Description |
|----------|-------------|
| `PORT` | Express port (default 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `JWT_EXPIRES_IN` | Access token TTL (e.g. `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g. `7d`) |
| `REDIS_URL` | Redis connection URL |
| `DJANGO_SERVICE_URL` | URL of the Django AI service |
| `INTERNAL_AUTH_TOKEN` | Shared secret between Express ↔ Django |
| `NODE_ENV` | `development` or `production` |

### `ai-service/.env`
| Variable | Description |
|----------|-------------|
| `DJANGO_SECRET_KEY` | Django secret key |
| `DEBUG` | `True` / `False` |
| `ALLOWED_HOSTS` | Comma-separated hostnames |
| `ANTHROPIC_API_KEY` | **Your Anthropic API key** |
| `INTERNAL_AUTH_TOKEN` | Must match server's token |
| `CLAUDE_MODEL` | Model to use (default: `claude-sonnet-4-20250514`) |
| `CLAUDE_MAX_TOKENS` | Max tokens per response (default: `1000`) |

---

## API Endpoints

### Auth (`/api/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Create account |
| POST | `/login` | Sign in, get tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| GET  | `/me` | Get current user |

### Analyze (`/api/analyze`)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Analyze a product's pricing |

**Request body:**
```json
{
  "productName": "Sony WH-1000XM5",
  "category": "Audio & Headphones",
  "listedPrice": 399.99,
  "currency": "USD",
  "marketplace": "Amazon",
  "description": "Optional product description..."
}
```

**Response:**
```json
{
  "analysis": {
    "_id": "...",
    "result": {
      "verdict": "OVERPRICED",
      "overpricingPercent": 18,
      "estimatedFairPrice": 339,
      "confidenceScore": 82,
      "reasoning": "...",
      "redFlags": ["..."],
      "suggestions": ["..."],
      "marketComparison": "..."
    }
  },
  "cached": false
}
```

### History (`/api/history`)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/?page=1&limit=10` | Paginated history |
| DELETE | `/:id` | Delete an analysis |

---

## Features

- 🔐 **JWT Auth** — access + refresh tokens, auto-refresh on expiry
- ⚡ **Redis Caching** — identical queries served instantly (1hr TTL)
- 🤖 **Claude AI** — structured JSON verdict: OVERPRICED / FAIR / UNDERPRICED
- 🛡️ **Internal Auth** — Express ↔ Django secured by shared token
- 📊 **History** — paginated log of all past analyses with delete
- 🚀 **Docker Compose** — one-command full stack launch
- 📱 **Responsive UI** — works on mobile and desktop

---

## Project Structure

```
smart-overpricing-detector/
├── docker-compose.yml
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Layout, AuthForm, AnalysisResult, etc.
│   │   ├── pages/           # AnalyzePage, HistoryPage, Login, Register
│   │   ├── context/         # AuthContext (JWT state)
│   │   └── services/        # Axios instance with token refresh
│   └── nginx.conf           # Production SPA + proxy config
├── server/                  # Express API gateway
│   ├── routes/              # auth.js, analyze.js, history.js
│   ├── middleware/          # auth, rateLimiter, errorHandler
│   ├── models/              # User.js, Analysis.js (Mongoose)
│   └── config/              # db.js, redis.js
└── ai-service/              # Django AI microservice
    ├── analyzer/
    │   ├── claude_service.py  # Anthropic API call + prompt
    │   ├── views.py
    │   ├── urls.py
    │   └── middleware.py      # Internal token validation
    └── ai_service/
        └── settings.py
```
