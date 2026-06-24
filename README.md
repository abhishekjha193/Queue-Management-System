# 🏥 Queue System

> **Replace paper tokens with real-time digital waiting.**
> Built for the Queue Cure '26 Hackathon — a live clinic queue system that updates instantly across all screens.

---

## ⚡ Quick Start

```bash
# 1. Backend
cd "Queue Cure System/backend"
cp .env.example .env      # add your MongoDB URI
npm install
npm run dev               # runs on :5000

# 2. Frontend (new terminal)
cd "Queue Cure System/frontend"
npm install
npm run dev               # runs on :5173
```

Open `http://localhost:5173` — register your clinic, start managing queues.

---

## 🎯 The Three Core Questions (Answered)

| Question | Answer |
|----------|--------|
| Can a receptionist add a patient and assign a token in under 10 seconds? | ✅ One modal, 1 required field (name), token auto-assigned on submit |
| Does the patient-facing screen update live without refreshing? | ✅ Socket.IO pushes `queue-update` events; no polling, no manual refresh |
| Is estimated wait computed from real data — not hardcoded? | ✅ System learns from actual consultation durations stored in `QueueStats` |

---

## 🏗️ Architecture

### Backend — MVC Architecture

```
backend/
├── app.js                    # Express app, middleware, routes
├── server.js                 # HTTP server, Socket.IO init, DB connect
├── config/
│   ├── db.js                 # Mongoose connection
│   └── socket.js             # Socket.IO init, room management
├── controllers/
│   ├── authController.js     # Register, login, profile, settings
│   └── queueController.js    # Add patient, call next, skip, stats, reset
├── middleware/
│   ├── auth.js               # JWT verification
│   ├── errorHandler.js       # Global error handler
│   └── validate.js           # express-validator runner
├── models/
│   ├── Clinic.js             # Clinic + auth + token counter
│   ├── Patient.js            # Patient record with status lifecycle
│   └── QueueStats.js         # Daily stats with rolling avg consult time
├── routes/
│   ├── authRoutes.js         # /api/auth/*
│   └── queueRoutes.js        # /api/queue/*
└── utils/
    ├── apiResponse.js        # Standardised response shape
    └── logger.js             # Winston logger
```

### Frontend — Feature-Based Architecture

```
frontend/src/
├── features/
│   ├── queue/
│   │   ├── LoginPage.jsx       # Auth — sign in
│   │   ├── RegisterPage.jsx    # Auth — register clinic
│   │   └── SettingsPage.jsx    # Consult time, patient link, danger zone
│   ├── receptionist/
│   │   ├── ReceptionistDashboard.jsx  # Main control panel
│   │   └── AddPatientModal.jsx        # <10 second patient add
│   ├── patient/
│   │   └── PatientWaitingRoom.jsx     # Public live queue display
│   └── shared/
│       ├── LoadingScreen.jsx    # Animated boot screen
│       └── Navbar.jsx           # Connection status + nav
├── hooks/
│   └── useQueue.js            # Socket.IO subscription + initial fetch
├── services/
│   ├── api.js                 # Axios instance + auth/queue API calls
│   └── socket.js              # Socket.IO client singleton
├── store/
│   ├── authStore.js           # Zustand — clinic auth state
│   └── queueStore.js          # Zustand — live queue state
└── styles/
    └── index.css              # Tailwind + custom design tokens
```

---

## 🔌 Socket Event Diagram

```
RECEPTIONIST CLIENT          SERVER                    PATIENT CLIENT
      |                        |                              |
      |-- join-receptionist --> |                              |
      |                        | <-- join-clinic -------------|
      |                        |                              |
      |-- POST /api/queue/     |                              |
      |   add-patient -------> |                              |
      |                        |-- emit queue-update -------> |
      |                        |-- emit queue-update -------> |  (all clinic rooms)
      |                        |                              |
      |-- POST /api/queue/     |                              |
      |   call-next ---------->|                              |
      |   (marks current as    |                              |
      |    completed, next     |                              |
      |    as serving,         |                              |
      |    learns actual       |                              |
      |    duration)           |                              |
      |                        |-- emit queue-update -------> |
      |                        |-- emit queue-update -------> |
      |                        |                              |
      |-- PATCH /api/queue/    |                              |
      |   skip/:id ----------> |                              |
      |                        |-- emit queue-update -------> |
```

**Rooms:**
- `clinic-{clinicId}` — all viewers (receptionist + patients)
- `receptionist-{clinicId}` — reserved for future receptionist-only events

**Events emitted by server:**
| Event | Payload | Trigger |
|-------|---------|---------|
| `queue-update` | `{ waiting, serving, completed, skipped, avgTime, ... }` | Any queue state change |

---

## 🧠 Wait Time Algorithm

```js
// On each queue-update:
avgTime = stats.avgActualConsultTime || clinic.avgConsultationTime

// Per patient in waiting list:
estimatedWaitMinutes = (positionIndex + (serving ? 1 : 0)) * avgTime

// When call-next fires:
duration = (now - serveStartedAt) / 60000  // in minutes
stats.totalConsultTimes.push(duration)
stats.avgActualConsultTime = mean(stats.totalConsultTimes)
```

The estimate **adapts throughout the day** — if the doctor runs fast, wait times shorten automatically. If consultations run long, estimates grow. No hardcoded values after the first patient.

---

## 🛡️ Concurrency & Edge Cases

| Scenario | Handling |
|----------|----------|
| Two receptionists click "Call Next" simultaneously | MongoDB `findOneAndUpdate` is atomic; second call finds no "serving" patient to complete |
| Patient added while another is being called | Token counter uses `getNextToken()` — increments atomically per document save |
| Socket disconnects mid-session | Client auto-reconnects with exponential backoff; rejoins rooms on `connect` event |
| Same clinic, multiple browser tabs | All tabs subscribe to `clinic-{id}` room — all update from single server event |
| Doctor changes consult time mid-day | `updateConsultTime` triggers `emitQueueUpdate` immediately — all waiting ETAs recompute |
| Patient marked No-Show while serving | Status set to `no-show`, next waiting patient auto-promoted to `serving` |
| Queue reset at end of day | All `waiting`/`serving` statuses → `no-show`; token counter resets at midnight automatically |
| Token counter date rollover | `getNextToken()` checks `currentTokenDate` — resets to 1 each new day |

---

## 🔧 Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/queue-cure
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend runtime | Node.js + Express.js |
| Real-time | Socket.IO 4 (WebSocket + polling fallback) |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| Logging | Winston |
| Security | Helmet, CORS, rate-limiting |
| Frontend | React 18 + Vite |
| State | Zustand |
| Styling | Tailwind CSS v3 |
| Animation | Framer Motion |
| HTTP client | Axios |
| Routing | React Router v6 |
| Toasts | react-hot-toast |

---

## 🚀 Deployment Notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET`
- Use MongoDB Atlas for the hosted database URI
- Frontend: `npm run build` → deploy `dist/` to Vercel/Netlify
- Backend: Deploy to Railway/Render, set env vars in dashboard
- Update `CLIENT_URL` in backend env and `vite.config.js` proxy target accordingly

---
Live Link : https://queue001.vercel.app
---

## 👤 Build by

Abhishek Jha

> *"The moment a clinic owner sees token #12 disappear from the waiting screen the instant the receptionist clicks Call Next — that's the moment they say: I want this."*
