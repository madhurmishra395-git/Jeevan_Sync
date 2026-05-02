/**
 * JeevanSync – Complete React Frontend
 * Single-file app with Auth, Dashboard, Profile, Landing pages.
 * Uses localStorage for JWT and mock data for demo.
 *
 * API requests use same-origin /api by default. Set VITE_API_BASE only when
 * the API is hosted on a separate domain.
 */

import { useState, useEffect, useContext, createContext, useCallback } from "react";
import { supabase } from "./supabase";
import logoImg from "../public/logo.png";
import healixImg from "../public/HeaLiX.png";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ── API Configuration ────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

const useAuth = () => useContext(AuthContext);

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_HEALTH_DATA = [
  { date: "May 1",  heartRate: 72, steps: 8240, sleep: 7.5, calories: 1980, water: 2100 },
  { date: "Apr 30", heartRate: 75, steps: 6800, sleep: 6.8, calories: 2150, water: 1800 },
  { date: "Apr 29", heartRate: 68, steps: 9400, sleep: 8.0, calories: 1820, water: 2400 },
  { date: "Apr 28", heartRate: 80, steps: 4200, sleep: 5.5, calories: 2300, water: 1600 },
  { date: "Apr 27", heartRate: 71, steps: 10500,sleep: 7.2, calories: 1950, water: 2200 },
  { date: "Apr 26", heartRate: 74, steps: 7600, sleep: 7.8, calories: 2050, water: 2000 },
  { date: "Apr 25", heartRate: 69, steps: 8900, sleep: 8.2, calories: 1900, water: 2300 },
];

const MOCK_REMINDERS = [
  { id: 1, medicineName: "Metformin 500mg", dosage: "1 tablet", times: ["08:00", "20:00"], status: "active" },
  { id: 2, medicineName: "Vitamin D3", dosage: "1 capsule", times: ["09:00"], status: "active" },
  { id: 3, medicineName: "Omeprazole 20mg", dosage: "1 tablet", times: ["07:00"], status: "paused" },
];

const MOCK_PRESCRIPTIONS = [
  { id: 1, title: "Diabetes Management", doctor: "Dr. Priya Sharma", date: "2025-04-20", medicines: [{ name: "Metformin", dosage: "500mg", duration: "90 days" }] },
  { id: 2, title: "Vitamin Deficiency", doctor: "Dr. Arjun Mehta", date: "2025-03-15", medicines: [{ name: "Vitamin D3", dosage: "60K IU", duration: "12 weeks" }] },
];

const MOCK_APPOINTMENTS = [
  { id: 1, doctorName: "Dr. Priya Sharma", specialty: "Endocrinology", date: "2025-05-08", time: "10:30 AM", type: "telemedicine", status: "scheduled" },
  { id: 2, doctorName: "Dr. Rohit Verma", specialty: "Cardiology", date: "2025-05-15", time: "02:00 PM", type: "in-person", status: "scheduled" },
];

const HEALTH_TIPS = [
  "Drink at least 8 glasses of water daily to stay hydrated.",
  "Take a 10-minute walk after each meal to regulate blood sugar.",
  "Practice deep breathing for 5 minutes every morning to reduce stress.",
  "Sleep 7–9 hours nightly – it's when your body repairs itself.",
  "Include at least 5 servings of fruits and vegetables in your daily diet.",
  "Stretch for 5 minutes every hour if you sit at a desk.",
  "A brisk 30-minute walk daily reduces heart disease risk by 35%.",
];

const COLORS = ["#0ea5e9", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444"];

// ── API Helper ────────────────────────────────────────────────────────────────
const api = async (path, opts = {}) => {
  const token = localStorage.getItem("js_token");
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  return res.json();
};

// ── Auth Provider ─────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split("@")[0] } : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ? { id: session.user.id, email: session.user.email, name: session.user.user_metadata?.full_name || session.user.email.split("@")[0] } : null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback((userData, token) => {}, []); // kept to avoid breaking other calls

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Icons (inline SVG components) ────────────────────────────────────────────
const Icon = {
  Heart: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Activity: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Bell: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  FileText: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Video: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
  Users: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  TrendingUp: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  User: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  LogOut: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  Droplet: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>,
  Moon: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  Flame: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Walk: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="13" cy="4" r="2"/><path d="M7 22l1-8 3.5 3 1-5.5"/><path d="M11.5 11.5L13 7l4 2 2 4-3 1"/></svg>,
  CheckCircle: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  X: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Home: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Lightbulb: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
};

// ── Utility Components ────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900 rounded-2xl shadow-sm border border-slate-800 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-sky-100 text-sky-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-violet-100 text-violet-700",
    gray: "bg-slate-800 text-slate-300",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

const StatCard = ({ icon, label, value, unit, color, trend }) => {
  const colors = {
    blue: "from-slate-900 to-sky-100 text-sky-600 border-sky-200",
    green: "from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200",
    purple: "from-violet-50 to-violet-100 text-violet-600 border-violet-200",
    orange: "from-orange-50 to-orange-100 text-orange-600 border-orange-200",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-600 border-cyan-200",
  };
  return (
    <Card className={`p-5 bg-gradient-to-br border ${colors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-xl bg-slate-900/70 ${colors[color].split(" ")[2]}`}>{icon}</div>
        {trend && <span className="text-xs text-emerald-600 font-medium">{trend}</span>}
      </div>
      <p className="text-3xl font-bold text-white">{value}<span className="text-sm font-normal text-slate-500 ml-1">{unit}</span></p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </Card>
  );
};

// ── Auth Page ─────────────────────────────────────────────────────────────────
function AuthPage() {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      if (!isLogin) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } }
        });
        if (error) throw error;
        if (data.user?.identities?.length === 0) {
          setError("User already exists or email required.");
        } else {
          setError("Success! You can now sign in.");
          setIsLogin(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={logoImg} alt="JeevanSync Logo" className="w-24 h-24 object-contain" />
            <div>
              <img src={healixImg} alt="HeaLiX" className="h-16 object-contain" />
              <p className="text-xs text-slate-400 -mt-1">Your Health, Your Sync, Your Life</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <Card className="p-8">
          {/* Toggle */}
          <div className="flex bg-slate-800 rounded-xl p-1 mb-8">
            {["Login", "Sign Up"].map((t, i) => (
              <button
                key={t}
                onClick={() => { setIsLogin(i === 0); setError(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  (i === 0) === isLogin ? "bg-slate-900 shadow-sm text-sky-600" : "text-slate-500 hover:text-slate-100"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-1.5">Full Name</label>
                <input
                  name="name" type="text" value={form.name} onChange={handle}
                  placeholder="Aarav Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-sm"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5">Email Address</label>
              <input
                name="email" type="email" value={form.email} onChange={handle}
                placeholder="aarav@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5">Password</label>
              <input
                name="password" type="password" value={form.password} onChange={handle}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none transition text-sm"
                required minLength="6"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                <Icon.X />{error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-sky-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-2"
            >
              {loading ? "Please wait…" : isLogin ? "Sign In to HeaLiX" : "Create My Account"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Your health data is encrypted and private. We never share your information.
          </p>
        </Card>

        {/* Demo hint */}
        <p className="text-center text-xs text-slate-400 mt-4">
          No backend? Enter any email + password to try the demo ✨
        </p>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ page, setPage, user, onLogout, collapsed, setCollapsed }) {
  const nav = [
    { id: "dashboard", label: "Dashboard", icon: <Icon.Home /> },
    { id: "health",    label: "Health Tracking", icon: <Icon.Activity /> },
    { id: "reminders", label: "Reminders", icon: <Icon.Bell /> },
    { id: "prescriptions", label: "Prescriptions", icon: <Icon.FileText /> },
    { id: "telemedicine",  label: "Telemedicine", icon: <Icon.Video /> },
    { id: "community", label: "Community", icon: <Icon.Users /> },
    { id: "profile",   label: "Profile", icon: <Icon.User /> },
  ];

  const initials = user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";

  return (
    <aside className={`${collapsed ? "w-16" : "w-64"} bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0`}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-slate-800">
        <img src={logoImg} alt="Logo" className="w-14 h-14 object-contain shrink-0" />
        {!collapsed && <img src={healixImg} alt="HeaLiX" className="h-10 object-contain" />}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-slate-400 hover:text-slate-300 transition">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              page === item.id
                ? "bg-gradient-to-r from-slate-900 to-slate-900 text-sky-600 border border-sky-100"
                : "text-slate-500 hover:bg-slate-950 hover:text-slate-100"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={onLogout} className="text-slate-400 hover:text-red-500 transition ml-auto" title="Logout">
              <Icon.LogOut />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────
function DashboardPage({ user, setPage }) {
  const today = MOCK_HEALTH_DATA[0];
  const tip = HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, <span className="text-sky-600">{user?.name?.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 border border-emerald-100 rounded-xl">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-700 font-medium">Health Synced</span>
        </div>
      </div>

      {/* Tip of the day */}
      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-sky-500 to-emerald-500 rounded-2xl text-white">
        <div className="p-2 bg-slate-900/20 rounded-xl"><Icon.Lightbulb /></div>
        <div>
          <p className="text-xs font-semibold opacity-80 mb-1">TIP OF THE DAY</p>
          <p className="text-sm font-medium">{tip}</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Icon.Heart />} label="Heart Rate" value={today.heartRate} unit="bpm" color="blue" trend="▲ 4%" />
        <StatCard icon={<Icon.Walk />} label="Steps Today" value={today.steps.toLocaleString()} unit="steps" color="green" trend="▲ 12%" />
        <StatCard icon={<Icon.Moon />} label="Sleep Last Night" value={today.sleep} unit="hrs" color="purple" />
        <StatCard icon={<Icon.Flame />} label="Calories Burned" value={today.calories} unit="kcal" color="orange" trend="▼ 3%" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Steps chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Weekly Steps</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={[...MOCK_HEALTH_DATA].reverse()}>
              <defs>
                <linearGradient id="stepsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="steps" stroke="#0ea5e9" fill="url(#stepsGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Heart Rate chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Heart Rate Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={[...MOCK_HEALTH_DATA].reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[60, 90]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Line type="monotone" dataKey="heartRate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Upcoming reminders */}
        <Card className="p-5 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Today's Reminders</h3>
            <button onClick={() => setPage("reminders")} className="text-xs text-sky-600 hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {MOCK_REMINDERS.filter(r => r.status === "active").map(r => (
              <div key={r.id} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl">
                <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600 shrink-0">
                  <Icon.Bell />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate">{r.medicineName}</p>
                  <p className="text-xs text-slate-400">{r.times.join(", ")} · {r.dosage}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming appointments */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Appointments</h3>
            <button onClick={() => setPage("telemedicine")} className="text-xs text-sky-600 hover:underline">Book new</button>
          </div>
          <div className="space-y-3">
            {MOCK_APPOINTMENTS.map(appt => (
              <div key={appt.id} className="flex items-center gap-4 p-4 border border-slate-800 rounded-xl hover:border-sky-100 hover:bg-slate-800/30 transition">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-emerald-100 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
                  {appt.type === "telemedicine" ? <Icon.Video /> : <Icon.Users />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">{appt.doctorName}</p>
                  <p className="text-xs text-slate-500">{appt.specialty}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-100">{new Date(appt.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</p>
                  <p className="text-xs text-slate-400">{appt.time}</p>
                </div>
                <Badge color={appt.type === "telemedicine" ? "blue" : "green"}>
                  {appt.type === "telemedicine" ? "Video" : "In-Person"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Health Tracking Page ──────────────────────────────────────────────────────
function HealthPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ heartRate: "", steps: "", sleep: "", calories: "", water: "" });
  const [entries, setEntries] = useState(MOCK_HEALTH_DATA);
  const [saved, setSaved] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    const newEntry = {
      date: "Today",
      heartRate: parseInt(form.heartRate) || 72,
      steps: parseInt(form.steps) || 0,
      sleep: parseFloat(form.sleep) || 0,
      calories: parseInt(form.calories) || 0,
      water: parseInt(form.water) || 0,
    };
    setEntries([newEntry, ...entries]);
    setForm({ heartRate: "", steps: "", sleep: "", calories: "", water: "" });
    setShowForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const pieData = [
    { name: "Steps", value: entries[0].steps },
    { name: "Calories", value: entries[0].calories },
    { name: "Water (ml)", value: entries[0].water },
    { name: "Sleep ×100", value: entries[0].sleep * 100 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Health Tracking</h1>
          <p className="text-slate-500 text-sm">Log and visualize your daily metrics</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:from-sky-600 hover:to-emerald-600 transition shadow-md"
        >
          <Icon.Plus /> Log Today
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-slate-800 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          <Icon.CheckCircle /> Health data saved successfully!
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5">Log Today's Metrics</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "heartRate", label: "Heart Rate (bpm)", placeholder: "72" },
              { name: "steps", label: "Steps", placeholder: "8000" },
              { name: "sleep", label: "Sleep (hrs)", placeholder: "7.5" },
              { name: "calories", label: "Calories (kcal)", placeholder: "2000" },
              { name: "water", label: "Water (ml)", placeholder: "2000" },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs font-medium text-slate-300 mb-1">{f.label}</label>
                <input
                  type="number" name={f.name} placeholder={f.placeholder}
                  value={form[f.name]} onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>
            ))}
            <div className="flex items-end gap-3 col-span-2 md:col-span-3">
              <button type="submit" className="px-6 py-2.5 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Save Entry</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Sleep Quality</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...entries].reverse().slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis domain={[0, 12]} tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="sleep" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Calorie Burn</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={[...entries].reverse()}>
              <defs>
                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Area type="monotone" dataKey="calories" stroke="#f59e0b" fill="url(#calGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Today's Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none" }} formatter={(v, n) => [n === "Sleep ×100" ? (v/100).toFixed(1)+" hrs" : v.toLocaleString(), n.replace(" ×100","")]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-2">
            {pieData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-300">
                <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                {item.name.replace(" ×100", "")}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-white mb-4">Water Intake (ml)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[...entries].reverse().slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="water" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

// ── Reminders Page ────────────────────────────────────────────────────────────
function RemindersPage() {
  const [reminders, setReminders] = useState(MOCK_REMINDERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ medicineName: "", dosage: "", times: "08:00", notes: "" });

  const addReminder = (e) => {
    e.preventDefault();
    setReminders(r => [...r, { ...form, id: Date.now(), times: form.times.split(",").map(t => t.trim()), status: "active" }]);
    setForm({ medicineName: "", dosage: "", times: "08:00", notes: "" });
    setShowForm(false);
  };

  const toggle = (id) => setReminders(r => r.map(x => x.id === id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x));
  const del = (id) => setReminders(r => r.filter(x => x.id !== id));

  const statusColor = { active: "green", paused: "yellow", completed: "gray" };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Medication Reminders</h1>
          <p className="text-slate-500 text-sm">Never miss a dose</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:from-sky-600 hover:to-emerald-600 transition shadow-md"
        >
          <Icon.Plus /> Add Reminder
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5">New Medication Reminder</h3>
          <form onSubmit={addReminder} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Medicine Name *</label>
              <input required value={form.medicineName} onChange={e => setForm(p => ({ ...p, medicineName: e.target.value }))}
                placeholder="e.g. Metformin 500mg"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dosage *</label>
              <input required value={form.dosage} onChange={e => setForm(p => ({ ...p, dosage: e.target.value }))}
                placeholder="e.g. 1 tablet"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Times (comma-separated)</label>
              <input value={form.times} onChange={e => setForm(p => ({ ...p, times: e.target.value }))}
                placeholder="08:00, 14:00, 20:00"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Take with food"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div className="flex items-center gap-3 col-span-full">
              <button type="submit" className="px-6 py-2.5 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Add Reminder</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {reminders.map(r => (
          <Card key={r.id} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${r.status === "active" ? "bg-emerald-100 text-emerald-600" : "bg-slate-800 text-slate-400"}`}>
                <Icon.Bell />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{r.medicineName}</h3>
                  <Badge color={statusColor[r.status]}>{r.status}</Badge>
                </div>
                <p className="text-sm text-slate-500">{r.dosage} · {r.times.join(", ")}</p>
                {r.notes && <p className="text-xs text-slate-400 mt-1">{r.notes}</p>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggle(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${r.status === "active" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                >
                  {r.status === "active" ? "Pause" : "Resume"}
                </button>
                <button onClick={() => del(r.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Icon.Trash />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {reminders.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-2xl flex items-center justify-center">
              <Icon.Bell />
            </div>
            <p className="font-medium">No reminders yet</p>
            <p className="text-sm">Add your first medication reminder above</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Prescriptions Page ────────────────────────────────────────────────────────
function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState(MOCK_PRESCRIPTIONS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", doctor: "", notes: "", medicineName: "", dosage: "", duration: "" });

  const addPrescription = (e) => {
    e.preventDefault();
    setPrescriptions(p => [{
      id: Date.now(), title: form.title, doctor: form.doctor,
      date: new Date().toISOString().split("T")[0],
      medicines: [{ name: form.medicineName, dosage: form.dosage, duration: form.duration }],
    }, ...p]);
    setForm({ title: "", doctor: "", notes: "", medicineName: "", dosage: "", duration: "" });
    setShowForm(false);
  };

  const del = (id) => setPrescriptions(p => p.filter(x => x.id !== id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Prescriptions</h1>
          <p className="text-slate-500 text-sm">Your medical prescriptions securely stored</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:from-sky-600 hover:to-emerald-600 transition shadow-md"
        >
          <Icon.Plus /> Add Prescription
        </button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5">New Prescription Entry</h3>
          <form onSubmit={addPrescription} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: "title", label: "Prescription Title *", placeholder: "e.g. Diabetes Management", required: true, span: false },
              { name: "doctor", label: "Doctor Name", placeholder: "Dr. Priya Sharma", required: false, span: false },
              { name: "medicineName", label: "Medicine Name", placeholder: "Metformin", required: false, span: false },
              { name: "dosage", label: "Dosage", placeholder: "500mg twice daily", required: false, span: false },
              { name: "duration", label: "Duration", placeholder: "90 days", required: false, span: false },
              { name: "notes", label: "Notes", placeholder: "Take with water after meals", required: false, span: true },
            ].map(f => (
              <div key={f.name} className={f.span ? "col-span-full" : ""}>
                <label className="block text-xs font-medium text-slate-300 mb-1">{f.label}</label>
                <input
                  required={f.required} value={form[f.name]}
                  onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                  name={f.name} placeholder={f.placeholder}
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none"
                />
              </div>
            ))}
            <div className="flex items-center gap-3 col-span-full">
              <button type="submit" className="px-6 py-2.5 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Save Prescription</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {/* Upload card */}
      <div className="border-2 border-dashed border-sky-200 rounded-2xl p-8 text-center bg-slate-800/40 hover:bg-slate-800 transition cursor-pointer">
        <div className="w-14 h-14 mx-auto mb-3 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-500">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        </div>
        <p className="font-semibold text-slate-100">Upload Prescription Image</p>
        <p className="text-sm text-slate-400 mt-1">Drag & drop or click to upload JPG, PNG, PDF</p>
        <p className="text-xs text-sky-500 mt-2">Files are encrypted and stored securely</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prescriptions.map(p => (
          <Card key={p.id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0">
                <Icon.FileText />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{p.doctor} · {new Date(p.date).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</p>
                {p.medicines?.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {p.medicines.map((m, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1.5 rounded-lg">
                        <span className="font-medium text-slate-100">{m.name}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500">{m.dosage}</span>
                        {m.duration && <><span className="text-slate-400">·</span><span className="text-slate-400">{m.duration}</span></>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => del(p.id)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                <Icon.Trash />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Telemedicine Page ─────────────────────────────────────────────────────────
function TelemedicinePage() {
  const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ doctorName: "", specialty: "", date: "", time: "", type: "telemedicine", notes: "" });
  const [booked, setBooked] = useState(false);

  const DOCTORS = [
    { name: "Dr. Priya Sharma", specialty: "Endocrinology", rating: 4.9, exp: "12 yrs", available: true },
    { name: "Dr. Rohit Verma", specialty: "Cardiology", rating: 4.8, exp: "15 yrs", available: true },
    { name: "Dr. Anjali Gupta", specialty: "General Physician", rating: 4.7, exp: "8 yrs", available: false },
    { name: "Dr. Vikram Patel", specialty: "Neurology", rating: 4.9, exp: "20 yrs", available: true },
  ];

  const book = (e) => {
    e.preventDefault();
    setAppointments(a => [...a, { ...form, id: Date.now(), status: "scheduled" }]);
    setForm({ doctorName: "", specialty: "", date: "", time: "", type: "telemedicine", notes: "" });
    setShowForm(false);
    setBooked(true);
    setTimeout(() => setBooked(false), 4000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Telemedicine</h1>
          <p className="text-slate-500 text-sm">Consult doctors from the comfort of your home</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-emerald-500 text-white rounded-xl font-medium text-sm hover:from-sky-600 hover:to-emerald-600 transition shadow-md">
          <Icon.Plus /> Book Appointment
        </button>
      </div>

      {booked && (
        <div className="flex items-center gap-2 p-4 bg-slate-800 border border-emerald-200 rounded-xl text-emerald-700">
          <Icon.CheckCircle /> <span className="font-medium">Appointment booked!</span> You'll receive a confirmation shortly.
        </div>
      )}

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold text-white mb-5">Book an Appointment</h3>
          <form onSubmit={book} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Doctor Name *</label>
              <input required value={form.doctorName} onChange={e => setForm(p => ({ ...p, doctorName: e.target.value }))}
                placeholder="Dr. Priya Sharma"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Specialty</label>
              <input value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}
                placeholder="Cardiology"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date *</label>
              <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Time *</label>
              <input required type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none bg-slate-900">
                <option value="telemedicine">Video Consultation</option>
                <option value="in-person">In-Person</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
              <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder="Reason for visit"
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
            </div>
            <div className="flex gap-3 col-span-full">
              <button type="submit" className="px-6 py-2.5 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Confirm Booking</button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
            </div>
          </form>
        </Card>
      )}

      {/* Featured Doctors */}
      <div>
        <h2 className="font-semibold text-white mb-4">Available Doctors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCTORS.map(doc => (
            <Card key={doc.name} className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                  {doc.name.split(" ")[1]?.[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{doc.name}</h3>
                    {doc.available ? <span className="w-2 h-2 bg-emerald-400 rounded-full" /> : <span className="w-2 h-2 bg-slate-300 rounded-full" />}
                  </div>
                  <p className="text-xs text-slate-500">{doc.specialty} · {doc.exp}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-amber-400 text-xs">★</span>
                    <span className="text-xs font-medium text-slate-300">{doc.rating}</span>
                  </div>
                </div>
                <button
                  disabled={!doc.available}
                  onClick={() => { setForm(f => ({ ...f, doctorName: doc.name, specialty: doc.specialty })); setShowForm(true); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${doc.available ? "bg-slate-8000 text-white hover:bg-sky-600" : "bg-slate-800 text-slate-400 cursor-not-allowed"}`}
                >
                  {doc.available ? "Book" : "Busy"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Appointments */}
      <div>
        <h2 className="font-semibold text-white mb-4">My Appointments</h2>
        <div className="space-y-3">
          {appointments.map(appt => (
            <Card key={appt.id} className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                  {appt.type === "telemedicine" ? <Icon.Video /> : <Icon.Users />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white text-sm">{appt.doctorName}</p>
                  <p className="text-xs text-slate-400">{appt.specialty || "General"} · {new Date(appt.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} at {appt.time}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={appt.type === "telemedicine" ? "blue" : "green"}>{appt.type === "telemedicine" ? "Video" : "In-Person"}</Badge>
                  <Badge color={appt.status === "scheduled" ? "green" : "gray"}>{appt.status}</Badge>
                </div>
                {appt.type === "telemedicine" && appt.status === "scheduled" && (
                  <button className="px-3 py-1.5 bg-slate-8000 text-white rounded-xl text-xs font-medium hover:bg-emerald-600 transition">
                    Join Now
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Community Page ─────────────────────────────────────────────────────────────
function CommunityPage() {
  const posts = [
    { id: 1, author: "Kavya M.", avatar: "K", time: "2h ago", content: "Just completed my 30-day walking challenge! 10,000 steps every day 🎉", likes: 24, comments: 8, tag: "fitness" },
    { id: 2, author: "Rajan P.", avatar: "R", time: "5h ago", content: "Anyone else tracking blood sugar with JeevanSync? The charts are amazing for monitoring trends!", likes: 18, comments: 12, tag: "diabetes" },
    { id: 3, author: "Sunita G.", avatar: "S", time: "1d ago", content: "Tip: Eating a small protein-rich snack before bed dramatically improved my sleep quality. Give it a try!", likes: 41, comments: 19, tag: "nutrition" },
  ];
  const tagColors = { fitness: "green", diabetes: "blue", nutrition: "orange" };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Community Support</h1>
        <p className="text-slate-500 text-sm">Connect with others on their health journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[["2,400+", "Members"], ["180+", "Posts This Week"], ["92%", "Satisfaction Rate"]].map(([val, label]) => (
          <Card key={label} className="p-4 text-center">
            <p className="text-2xl font-bold text-sky-600">{val}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </Card>
        ))}
      </div>

      {/* Post composer */}
      <Card className="p-5">
        <textarea rows={3} placeholder="Share a health tip, milestone, or question with the community…"
          className="w-full text-sm text-slate-100 placeholder-slate-400 resize-none outline-none border-none" />
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex gap-2">
            {["Fitness", "Nutrition", "Mental Health", "Chronic Care"].map(tag => (
              <button key={tag} className="px-2.5 py-1 bg-slate-800 text-slate-500 rounded-lg text-xs hover:bg-sky-100 hover:text-sky-600 transition">#{tag}</button>
            ))}
          </div>
          <button className="px-4 py-2 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Post</button>
        </div>
      </Card>

      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id} className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">{post.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{post.author}</span>
                  <span className="text-xs text-slate-400">{post.time}</span>
                  <Badge color={tagColors[post.tag] || "gray"}>#{post.tag}</Badge>
                </div>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {post.likes}
                  </button>
                  <button className="flex items-center gap-1 text-xs text-slate-400 hover:text-sky-500 transition">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {post.comments} comments
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
function ProfilePage({ user, onLogout }) {
  const { updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: "", dateOfBirth: "", bloodGroup: "" });
  const [saved, setSaved] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    try {
      const data = await api("/auth/profile", { method: "PUT", body: JSON.stringify(form) });
      if (data.success) updateUser(data.user);
    } catch {}
    updateUser({ ...user, name: form.name });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = user?.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "??";

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">My Profile</h1>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-slate-800 border border-emerald-200 rounded-xl text-sm text-emerald-700">
          <Icon.CheckCircle /> Profile updated successfully!
        </div>
      )}

      {/* Avatar card */}
      <Card className="p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-emerald-400 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </Card>

      {/* Account info */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Account Information</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="text-sm text-sky-600 hover:underline font-medium">Edit Profile</button>
          )}
        </div>

        {editing ? (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Date of Birth</label>
                <input type="date" value={form.dateOfBirth} onChange={e => setForm(p => ({ ...p, dateOfBirth: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Blood Group</label>
                <select value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl focus:border-sky-400 outline-none bg-slate-900">
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            {/* Email – read-only, acts as unique identity */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address <span className="text-slate-400">(cannot be changed – your unique identity)</span></label>
              <input value={user?.email} disabled
                className="w-full px-3 py-2.5 text-sm border border-slate-700 rounded-xl bg-slate-950 text-slate-400 cursor-not-allowed" />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-slate-8000 text-white rounded-xl text-sm font-medium hover:bg-sky-600 transition">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {[
              ["Name", user?.name],
              ["Email", user?.email, true],
              ["Phone", "Not set"],
              ["Blood Group", "Not set"],
              ["Member Since", new Date(user?.createdAt || Date.now()).toLocaleDateString("en-IN")],
            ].map(([label, value, locked]) => (
              <div key={label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{value}</span>
                  {locked && <Badge color="gray">Identity</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Security */}
      <Card className="p-6">
        <h3 className="font-semibold text-white mb-4">Security & Privacy</h3>
        <div className="space-y-3">
          {[
            ["Password", "Last changed – never", "Change"],
            ["Two-Factor Auth", "Not enabled", "Enable"],
            ["Data Export", "Download all your health data", "Export"],
          ].map(([label, desc, action]) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-100">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <button className="text-xs text-sky-600 font-medium hover:underline">{action}</button>
            </div>
          ))}
        </div>
      </Card>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-red-200 text-red-500 rounded-xl font-medium text-sm hover:bg-red-50 transition"
      >
        <Icon.LogOut /> Sign Out of HeaLiX
      </button>
    </div>
  );
}

// ── Main App Shell ────────────────────────────────────────────────────────────
function AppShell() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const pages = {
    dashboard: <DashboardPage user={user} setPage={setPage} />,
    health: <HealthPage />,
    reminders: <RemindersPage />,
    prescriptions: <PrescriptionsPage />,
    telemedicine: <TelemedicinePage />,
    community: <CommunityPage />,
    profile: <ProfilePage user={user} onLogout={logout} />,
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans">
      <Sidebar page={page} setPage={setPage} user={user} onLogout={logout} collapsed={collapsed} setCollapsed={setCollapsed} />
      <main className="flex-1 overflow-y-auto">
        {pages[page]}
      </main>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-sky-500 to-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <p className="text-slate-500 text-sm">Loading HeaLiX…</p>
        </div>
      </div>
    );
  }

  return user ? <AppShell /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
