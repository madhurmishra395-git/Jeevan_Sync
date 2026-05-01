# 🩺 JeevanSync – Your Health, Your Sync, Your Life

A modern, full-stack healthcare management platform built with React, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
jeevan-sync/
├── jeevan-sync-backend/          # Node.js + Express API
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT protection middleware
│   ├── models/
│   │   ├── User.js               # User schema (bcrypt password)
│   │   ├── Prescription.js       # Prescription schema
│   │   ├── Reminder.js           # Medication reminder schema
│   │   ├── HealthData.js         # Daily health metrics schema
│   │   └── Appointment.js        # Telemedicine appointment schema
│   ├── routes/
│   │   ├── auth.js               # /api/auth (register, login, profile)
│   │   ├── healthData.js         # /api/health-data (CRUD)
│   │   ├── reminders.js          # /api/reminders (CRUD)
│   │   ├── prescriptions.js      # /api/prescriptions (CRUD)
│   │   └── appointments.js       # /api/appointments (CRUD)
│   ├── .env.example              # Environment variables template
│   ├── server.js                 # Main Express server
│   └── package.json
│
└── jeevan-sync-frontend/         # React + Tailwind UI
    ├── src/
    │   ├── App.jsx               # Full application (all pages)
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Tailwind base styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone & Setup Backend

```bash
cd jeevan-sync-backend

# Install dependencies
npm install

# Copy env template
cp .env.example .env

# Edit .env with your values:
# MONGO_URI=mongodb://localhost:27017/jeevan_sync
# JWT_SECRET=your_super_secret_key_min_32_chars_long
# PORT=5000
# CLIENT_URL=http://localhost:3000
```

**Start the backend:**
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

The API will run at `http://localhost:5000`

---

### 2. Setup Frontend

```bash
cd jeevan-sync-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

---

### 3. MongoDB Setup Options

**Option A – Local MongoDB:**
```bash
# Install MongoDB Community Edition
# Start MongoDB
mongod --dbpath /data/db
```

**Option B – MongoDB Atlas (Cloud, Free):**
1. Create account at https://cloud.mongodb.com
2. Create a free cluster
3. Get connection string
4. Update `MONGO_URI` in `.env`

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|--------------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Get JWT token | ❌ |
| GET  | `/api/auth/me` | Current user info | ✅ |
| PUT  | `/api/auth/profile` | Update profile | ✅ |

### Health Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/api/health-data` | Last 30 days data |
| POST | `/api/health-data` | Log new entry |
| PUT  | `/api/health-data/:id` | Update entry |
| DELETE | `/api/health-data/:id` | Delete entry |

### Reminders, Prescriptions, Appointments
Same CRUD pattern at `/api/reminders`, `/api/prescriptions`, `/api/appointments`

---

## 🛡️ Security Features

- **Passwords**: bcrypt with 12 salt rounds (industry standard)
- **JWT**: 7-day expiry, HS256 signing
- **Input validation**: express-validator on all POST/PUT routes
- **Rate limiting**: 100 requests / 15 minutes per IP
- **Helmet.js**: HTTP security headers
- **Data isolation**: Every query filters by `userEmail` – users only see their own data
- **No password in responses**: `select: false` on password field

---

## 📱 Features

| Feature | Status |
|---------|--------|
| 🔐 JWT Authentication | ✅ Full |
| 📊 Health Charts (Recharts) | ✅ Full |
| 💊 Medication Reminders | ✅ Full |
| 📄 Prescription Management | ✅ Full |
| 🎥 Telemedicine Booking | ✅ Full UI |
| 👥 Community Forum | ✅ UI |
| 👤 User Profile | ✅ Full |
| 📱 Mobile Responsive | ✅ Full |
| 🌙 Demo Mode (no backend) | ✅ Full |

---

## 🎨 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Recharts
- **Backend**: Node.js, Express 4, Mongoose
- **Database**: MongoDB
- **Auth**: JWT + bcryptjs
- **Security**: Helmet, express-rate-limit, express-validator
- **Build**: Vite

---

## 🌐 Demo Mode

The frontend works **without a backend** in demo mode. Simply enter any email + password on the login screen and you'll be taken directly to the dashboard with mock data. Connect the real backend to persist actual data.

---

## 🚀 Deployment

### Backend (Railway / Render)
1. Push to GitHub
2. Connect repo to Railway or Render
3. Set environment variables
4. Deploy

### Frontend (Vercel / Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

Update `API_BASE` in `App.jsx` to your deployed backend URL.

---

Made with ❤️ for healthier lives.
