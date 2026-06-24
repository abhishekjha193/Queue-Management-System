import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Copy, ExternalLink, Timer, RefreshCw, AlertTriangle } from "lucide-react";
import { authAPI, queueAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import Navbar from "../shared/Navbar";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { clinic, updateClinic, getClinicId } = useAuthStore();
  const [form, setForm] = useState({ avgConsultationTime: clinic?.avgConsultationTime || 10, doctorName: clinic?.doctorName || "", phone: clinic?.phone || "", address: clinic?.address || "" });
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const clinicId = getClinicId();
  const patientUrl = `${window.location.origin}/patient/${clinicId}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateSettings(form);
      updateClinic(res.data.clinic);
      await queueAPI.updateConsultTime(form.avgConsultationTime);
      toast.success("Settings saved and queue updated!", { icon: "✅" });
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Reset today's queue? This will mark all waiting patients as no-show.")) return;
    setResetting(true);
    try {
      await queueAPI.resetQueue();
      toast.success("Queue reset successfully", { icon: "🔄" });
    } catch (err) {
      toast.error(err.message || "Failed to reset");
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-teal-400" />
          <h2 className="text-2xl font-bold text-slate-100">Settings</h2>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" /> Patient Waiting Room Link
          </h3>
          <div className="flex gap-2">
            <input readOnly value={patientUrl} className="input-field font-mono text-sm text-teal-300 flex-1" />
            <button onClick={() => { navigator.clipboard.writeText(patientUrl); toast.success("Copied!"); }}
              className="btn-secondary px-3">
              <Copy size={16} />
            </button>
            <a href={patientUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary px-3">
              <ExternalLink size={16} />
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-2">Share this link with patients — it shows their position and estimated wait time live.</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-semibold text-slate-200 mb-5 flex items-center gap-2">
            <Timer size={17} className="text-teal-400" /> Clinic Configuration
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Average Consultation Time (minutes)</label>
              <input type="number" min="1" max="120" className="input-field"
                value={form.avgConsultationTime}
                onChange={(e) => setForm({ ...form, avgConsultationTime: Number(e.target.value) })}
              />
              <p className="text-xs text-slate-500 mt-1">Used to calculate estimated wait times. The system also learns from actual consultation durations.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Doctor Name</label>
                <input type="text" className="input-field" value={form.doctorName}
                  onChange={(e) => setForm({ ...form, doctorName: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                <input type="tel" className="input-field" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Address</label>
              <input type="text" className="input-field" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> Saving...</> : <><Save size={16} /> Save Settings</>}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 border-red-500/20">
          <h3 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle size={17} /> Danger Zone
          </h3>
          <p className="text-slate-400 text-sm mb-4">Reset today's queue. All waiting patients will be marked as no-show. This cannot be undone.</p>
          <button onClick={handleReset} disabled={resetting} className="btn-danger flex items-center gap-2">
            {resetting ? "Resetting..." : <><RefreshCw size={15} /> Reset Today's Queue</>}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
