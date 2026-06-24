import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import LoadingScreen from "../shared/LoadingScreen";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", doctorName: "", phone: "", address: "", avgConsultationTime: 10 });
  const [loading, setLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      setAuth(res.data.token, res.data.clinic);
      toast.success("Clinic registered!");
      setAppLoading(true);
      setTimeout(() => navigate("/receptionist"), 1800);
    } catch (err) {
      toast.error(err.message || "Registration failed");
      setLoading(false);
    }
  };

  const field = (label, key, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
      <input type={type} className="input-field" placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })}
        required={["name", "email", "password", "doctorName"].includes(key)}
      />
    </div>
  );

  return (
    <>
      <LoadingScreen show={appLoading} />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🏥</div>
              <h1 className="text-3xl font-bold text-gradient mb-2">Register Your Clinic</h1>
              <p className="text-slate-400">Set up your digital queue in minutes</p>
            </div>

            <div className="glass-card p-8 teal-glow">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field("Clinic Name", "name", "text", "City Care Clinic")}
                  {field("Doctor Name", "doctorName", "text", "Dr. Sharma")}
                </div>
                {field("Email", "email", "email", "clinic@example.com")}
                {field("Password", "password", "password", "Min 6 characters")}
                <div className="grid grid-cols-2 gap-4">
                  {field("Phone (optional)", "phone", "tel", "+91 98765 43210")}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Avg. Consult Time (mins)</label>
                    <input type="number" min="1" max="120" className="input-field"
                      value={form.avgConsultationTime}
                      onChange={(e) => setForm({ ...form, avgConsultationTime: Number(e.target.value) })}
                    />
                  </div>
                </div>
                {field("Address (optional)", "address", "text", "123 Main Road, Mumbai")}

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> Creating clinic...</> : <><UserPlus size={18} /> Register Clinic</>}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-400 text-sm">
                  Already registered?{" "}
                  <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign in</Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
