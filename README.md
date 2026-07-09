<div align="center">

# 🌐 https://athena.rothila.com

### ▶ LIVE APP

</div>

# Smart University Companion — Frontend

[![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-38bdf8)](https://tailwindcss.com/)

Next.js web app for the Smart University Companion (L3 Individual Project, University of Moratuwa). AI-powered assistant ("Athena", backed by Google Gemini) plus Lost & Found, Financial Aid, Notifications, Achievements, and more. Talks to the Spring Boot backend on port 8080.

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js 15.4.6 (App Router), React 19 |
| Language / Styling | TypeScript 5+, Tailwind CSS 3.4+ |
| State | React Context API |
| HTTP / Realtime | Axios; Socket.io, SockJS, STOMP (WebSocket) |
| Auth | JWT (stored in `localStorage['token']`) + NextAuth (Google OAuth) |
| i18n | next-intl — English, Sinhala (සිංහල), Tamil (தமிழ்) |
| Payments | Stripe |
| Images | AWS S3 (via backend upload/proxy) |

## Getting Started

**Prerequisites:** Node.js 18+, npm 8+ (or yarn), backend API on port 8080.

```bash
git clone <repository-url>
cd "3rd year project"
npm install
npm run dev          # http://localhost:3000
```

### Environment (`.env.local`)
```env
# API (local). For prod, point to the Heroku backend.
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080/ws

# Google OAuth (NextAuth)
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000        # prod: https://athena.rothila.com

# Weather widget
NEXT_PUBLIC_OPENWEATHER_API_KEY=<key>
```
> Only `NEXT_PUBLIC_*` vars are exposed to the browser. `.env.local` is gitignored.

### Production build
```bash
npm run build && npm start
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (port 3000) |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | ESLint |

## Project Structure

```
src/
├── app/                      # App Router pages
│   ├── context/              # AuthContext, DarkMode/theme
│   ├── api/                  # Route handlers (athena proxy, stripe checkout, ...)
│   ├── login/ · signup/      # Auth
│   ├── lost-found/           # Lost & Found
│   ├── financial-aid/        # Aid + payment/callback + payment/cancel
│   ├── chatbot/              # AI assistant (Athena)
│   ├── notifications/        # Notification center
│   ├── admin/                # Admin panels
│   ├── achievements / social / weather / navigation / ...
│   ├── layout.tsx · providers.tsx · globals.css
├── components/               # Navigation, AthenaChatbot, ImageUpload,
│                             # NotificationToast, EmergencyNotificationBanner, ...
├── services/                 # API layer: athenaService, lostFoundService,
│                             # financialAidService, paymentService, tokenCountingService, ...
├── lib/                      # auth.ts (NextAuth config)
└── types/                    # TypeScript definitions
```

## API Integration

Backend base URL from `NEXT_PUBLIC_API_URL`. Protected calls send `Authorization: Bearer ${localStorage.getItem('token')}`.

**Auth** — `POST /api/auth/signin` · `POST /api/auth/signup` · `POST /api/auth/verify-email` · `POST /api/auth/oauth/register`
**Lost & Found** — `GET|POST /api/lost-found/items` · `GET|PUT|DELETE /api/lost-found/items/{id}` · `GET /api/lost-found/stats`
**Image** — `POST /api/upload/image` · `GET /api/upload/image/serve?url=` · `DELETE /api/upload/image?imageUrl=`
**Financial Aid** — `GET|POST /api/financial-aid/applications` · `PUT|DELETE /api/financial-aid/applications/{id}` · `GET /api/financial-aid/stats`
**Admin** — `GET /api/admin/users` · `PUT|DELETE /api/admin/users/{id}` · `PATCH /api/admin/users/{id}/toggle-status`
**Study Spaces** — `GET /api/study-spaces` · `POST /api/study-spaces/{id}/vote` · `POST /api/admin/study-spaces` · `DELETE /api/admin/study-spaces/{id}`
**Notifications** — `GET /api/notifications/user/{userId}` · `GET .../unread/count` · `PUT /{id}/read`
**AI Chatbot** — `POST /api/chatbot/chat` `{ message, imageUrls?, pdfUrls? }` (Gemini; text + image + PDF)
**WebSocket** — `CONNECT /ws` · `SUBSCRIBE /topic/notifications/{userId}`

### Service usage
```typescript
// Auth (context)
const { user, login, logout, isAuthenticated } = useAuth();
await login('user@email.com', 'password');

// Lost & Found
import lostFoundService from '@/services/lostFoundService';
await lostFoundService.createItem({ type: 'LOST', title: 'iPhone 14 Pro',
  category: 'Electronics', location: 'Main Library', contactMethod: 'DIRECT', priority: 'HIGH' });
const items = await lostFoundService.getItems({ type: 'LOST', category: 'Electronics', status: 'ACTIVE' });

// Display an S3 image through the backend proxy
const url = `${process.env.NEXT_PUBLIC_API_URL}/api/upload/image/serve?url=${encodeURIComponent(s3Url)}`;
```

## Deployment (Netlify)

Auto-deploys on push to `main`.
- **Build command:** `npm run build` · **Publish dir:** `.next` · **Node:** 18+ (plugin: `@netlify/plugin-nextjs`)
- **Env vars (Netlify dashboard):** `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL` → the Heroku backend; plus `GOOGLE_CLIENT_ID/SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL=https://athena.rothila.com`.
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.) set in `netlify.toml`.

## Troubleshooting

- **Port 3000 in use:** `npx kill-port 3000` then `npm run dev`.
- **Backend unreachable:** `curl http://localhost:8080/api/health`; confirm `NEXT_PUBLIC_API_URL`.
- **401 / auth issues:** token missing/expired — clear and re-login: `localStorage.removeItem('token'); localStorage.removeItem('user');`.
- **Build errors:** `rm -rf .next node_modules && npm install && npm run build`.
- **Env vars not loading:** must be in `.env.local`; client-side vars need the `NEXT_PUBLIC_` prefix; restart dev server after changes.

---

*Developed for academic coursework at the University of Moratuwa.* 🎓
