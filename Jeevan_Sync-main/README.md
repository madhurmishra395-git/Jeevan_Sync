# JeevanSync

A full-stack healthcare management app built with React, Tailwind CSS, Express, and MongoDB.

## Project Structure

```text
JeevanSync-Complete/
├── config/              MongoDB connection
├── middleware/          JWT auth middleware
├── models/              Mongoose schemas
├── routes/              Express API routes
├── src/                 React frontend source
├── index.html           Vite HTML entry
├── server.js            Express API and production frontend server
├── package.json         Single root package for frontend + backend
└── vite.config.js       Vite dev server and build config
```

## Setup

```powershell
npm install
```

Optional MongoDB config:

```powershell
copy .env.example .env
```

Set these values in `.env` when using real persistent data:

```text
MONGO_URI=mongodb://localhost:27017/jeevan_sync
JWT_SECRET=your_super_secret_key_min_32_chars_long
PORT=5000
CLIENT_URL=http://localhost:5173
```

Without `MONGO_URI`, the server still starts and the frontend demo mode works.

## Run

Development, frontend and backend together:

```powershell
npm run dev
```

Frontend dev URL:

```text
http://127.0.0.1:5173
```

Backend API:

```text
http://127.0.0.1:5000/api/ping
```

Production-style local run:

```powershell
npm run build
npm start
```

Open:

```text
http://127.0.0.1:5000
```

## API

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
GET    /api/health-data
POST   /api/health-data
PUT    /api/health-data/:id
DELETE /api/health-data/:id
GET    /api/reminders
POST   /api/reminders
GET    /api/prescriptions
POST   /api/prescriptions
GET    /api/appointments
POST   /api/appointments
```

## Tech Stack

- React 18
- Tailwind CSS
- Recharts
- Vite
- Express
- MongoDB / Mongoose
- JWT auth
