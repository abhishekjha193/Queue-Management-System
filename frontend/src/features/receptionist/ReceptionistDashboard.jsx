import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, ChevronRight, SkipForward, Clock, Users, CheckCircle, AlertCircle, Share2, RefreshCw, Timer } from "lucide-react";
import { queueAPI } from "../../services/api";
import { useQueueStore } from "../../store/queueStore";
import { useAuthStore } from "../../store/authStore";
import { useQueue } from "../../hooks/useQueue";
import Navbar from "../shared/Navbar";
import AddPatientModal from "./AddPatientModal";
import toast from "react-hot-toast";

const priorityColors = { urgent: "text-red-400 bg-red-500/10 border-red-500/20", elderly: "text-amber-400 bg-amber-500/10 border-amber-500/20", normal: "text-slate-400 bg-slate-700/50 border-slate-700" };
const priorityLabels = { urgent: "🚨 Urgent", elderly: "👴 Elderly", normal: "Normal" };

export default function ReceptionistDashboard() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [callingNext, setCallingNext] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const { waiting, serving, completed, skipped, avgTime, avgConsultationTime, isConnected } = useQueueStore();
  const { clinic, getClinicId } = useAuthStore();
  const clinicId = getClinicId();

  useQueue(clinicId, "receptionist");

  const handleCallNext = async () => {
    setCallingNext(true);
    try {
      const res = await queueAPI.callNext();
      toast.success(res.message, { icon: "📢", duration: 3000 });
    } catch (err) {
      toast.error(err.message || "Failed to call next");
    } finally {
      setCallingNext(false);
    }
  };

  const handleSkip = async (patient) => {
    setActionLoading((p) => ({ ...p, [patient._id]: "skip" }));
    try {
      const res = await queueAPI.skipPatient(patient._id);
      toast.success(`Token #${patient.tokenNumber} skipped`, { icon: "⏭️" });
    } catch (err) {
      toast.error(err.message || "Failed to skip");
    } finally {
      setActionLoading((p) => ({ ...p, [patient._id]: null }));
    }
  };

  const handleNoShow = async (patient) => {
    setActionLoading((p) => ({ ...p, [patient._id]: "noshow" }));
    try {
      await queueAPI.markNoShow(patient._id);
      toast("Marked as no-show", { icon: "❌" });
    } catch (err) {
      toast.error(err.message || "Failed");
    } finally {
      setActionLoading((p) => ({ ...p, [patient._id]: null }));
    }
  };

  const patientUrl = `${window.location.origin}/patient/${clinicId}`;
  const copyLink = () => { navigator.clipboard.writeText(patientUrl); toast.success("Patient link copied!", { icon: "🔗" }); };

  const totalToday = waiting.length + (serving ? 1 : 0) + completed + skipped;

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Receptionist Dashboard</h2>
            <p className="text-slate-400 text-sm mt-1">Dr. {clinic?.doctorName} · Avg {avgConsultationTime} min/patient</p>
          </div>
          <div className="flex gap-3">
            <button onClick={copyLink} className="btn-secondary text-sm">
              <Share2 size={16} /> Share Patient Link
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              <UserPlus size={18} /> Add Patient
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Waiting", value: waiting.length, icon: "⏳", color: "text-amber-400" },
            { label: "Serving", value: serving ? 1 : 0, icon: "🩺", color: "text-teal-400" },
            { label: "Completed", value: completed, icon: "✅", color: "text-green-400" },
            { label: "Total Today", value: totalToday, icon: "📊", color: "text-slate-300" },
          ].map((stat) => (
            <motion.div key={stat.label} className="glass-card p-4" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-2xl font-bold font-mono ${stat.color} animate-number`}>{stat.value}</span>
              </div>
              <p className="text-slate-400 text-xs font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {serving ? (
              <motion.div
                key={serving._id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-card p-5 border-teal-500/30 teal-glow"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-teal-400 pulse-ring inline-block" /> Now Serving
                  </span>
                  <button onClick={() => handleNoShow(serving)} className="btn-danger text-xs py-1 px-2">No-Show</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                    <span className="text-xl font-bold font-mono text-teal-400">#{serving.tokenNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-100 truncate">{serving.name}</p>
                    {serving.phone && <p className="text-slate-500 text-xs">{serving.phone}</p>}
                    {serving.complaint && <p className="text-slate-400 text-xs truncate mt-1">{serving.complaint}</p>}
                  </div>
                </div>
                <button onClick={handleCallNext} disabled={callingNext}
                  className="btn-primary w-full mt-4 bg-teal-600 hover:bg-teal-500">
                  {callingNext ? <><span className="animate-spin w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full" /> Calling...</> : <><ChevronRight size={18} /> Call Next Patient</>}
                </button>
              </motion.div>
            ) : (
              <div className="glass-card p-5 text-center">
                <div className="text-4xl mb-3">🏥</div>
                <p className="text-slate-300 font-medium mb-1">No patient being served</p>
                <p className="text-slate-500 text-sm mb-4">{waiting.length > 0 ? `${waiting.length} patients waiting` : "Queue is empty"}</p>
                {waiting.length > 0 && (
                  <button onClick={handleCallNext} disabled={callingNext} className="btn-primary w-full">
                    {callingNext ? "Calling..." : <><ChevronRight size={18} /> Call First Patient</>}
                  </button>
                )}
              </div>
            )}

            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer size={16} className="text-teal-400" />
                <span className="text-sm font-medium text-slate-300">Quick Stats</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. wait for last</span>
                  <span className="font-mono text-teal-400">{waiting.length * avgConsultationTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg consult time</span>
                  <span className="font-mono text-slate-300">{avgTime} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Queue depth</span>
                  <span className="font-mono text-slate-300">{waiting.length} patients</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                  <Users size={17} className="text-teal-400" />
                  Waiting Queue
                  {waiting.length > 0 && (
                    <span className="bg-teal-500/20 text-teal-400 text-xs font-mono px-2 py-0.5 rounded-full border border-teal-500/20">
                      {waiting.length}
                    </span>
                  )}
                </h3>
                <span className="text-xs text-slate-500 font-mono">Token · Name · ETA</span>
              </div>

              <div className="divide-y divide-slate-800/60 max-h-[520px] overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {waiting.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 text-center">
                      <div className="text-4xl mb-3">✨</div>
                      <p className="text-slate-400">No patients waiting</p>
                      <p className="text-slate-600 text-sm mt-1">Add a patient or the queue is clear</p>
                    </motion.div>
                  ) : (
                    waiting.map((patient, idx) => (
                      <motion.div
                        key={patient._id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 20, opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-800/30 transition-colors priority-${patient.priority}`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold font-mono text-teal-400">#{patient.tokenNumber}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-200 truncate">{patient.name}</p>
                            {patient.priority !== "normal" && (
                              <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityColors[patient.priority]}`}>
                                {priorityLabels[patient.priority]}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {patient.phone && <span className="text-xs text-slate-500">{patient.phone}</span>}
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={10} /> ~{patient.estimatedWaitMinutes} min wait
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => handleSkip(patient)}
                            disabled={actionLoading[patient._id] === "skip"}
                            className="text-xs text-slate-500 hover:text-orange-400 px-2 py-1 rounded hover:bg-orange-500/10 transition-all border border-transparent hover:border-orange-500/20">
                            {actionLoading[patient._id] === "skip" ? "..." : "Skip"}
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AddPatientModal show={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
