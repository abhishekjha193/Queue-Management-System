import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Activity } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import LoadingScreen from "../shared/LoadingScreen";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      setAuth(res.data.token, res.data.clinic);
      setAppLoading(true);
      setTimeout(() => navigate("/receptionist"), 1800);
    } catch (err) {
      toast.error(err.message || "Login failed. Check your credentials.");
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingScreen show={appLoading} />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏥</div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Queue Cure</h1>
              <p className="text-slate-400">Sign in to manage your clinic queue</p>
            </div>

            <div className="glass-card p-8 teal-glow">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="input-field"
                    placeholder="doctor@clinic.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="input-field pr-12"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? (
                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> Signing in...</>
                  ) : (
                    <><LogIn size={18} /> Sign In</>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-400 text-sm">
                  New clinic?{" "}
                  <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">
                    Register here
                  </Link>
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Activity size={14} className="text-teal-500" />
              <span>Real-time queue management for modern clinics</span>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
