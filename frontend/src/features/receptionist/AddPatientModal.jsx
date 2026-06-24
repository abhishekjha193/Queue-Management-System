import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Zap } from "lucide-react";
import { queueAPI } from "../../services/api";
import toast from "react-hot-toast";

const initialForm = { name: "", phone: "", age: "", complaint: "", priority: "normal" };

export default function AddPatientModal({ show, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const startTime = useState(() => Date.now())[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    try {
      const res = await queueAPI.addPatient({ ...form, age: form.age ? Number(form.age) : undefined });
      toast.success(res.message, { icon: "🎫", duration: 4000 });
      setForm(initialForm);
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md glass-card p-6 teal-glow"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <UserPlus size={20} className="text-teal-400" />
                <h2 className="text-lg font-semibold text-slate-100">Add New Patient</h2>
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Patient Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765..."
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Age</label>
                  <input
                    type="number"
                    min="0"
                    max="150"
                    className="input-field"
                    placeholder="30"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: "normal", label: "Normal", icon: "🟢" },
                    { val: "elderly", label: "Elderly", icon: "👴" },
                    { val: "urgent", label: "Urgent", icon: "🚨" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setForm({ ...form, priority: opt.val })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        form.priority === opt.val
                          ? "bg-teal-500/20 border-teal-500/50 text-teal-300"
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Chief Complaint</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Fever, headache..."
                  value={form.complaint}
                  onChange={(e) => setForm({ ...form, complaint: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? (
                    <><span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> Adding...</>
                  ) : (
                    <><Zap size={16} /> Assign Token</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
