import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Users, Activity, ChevronRight } from "lucide-react";
import { useQueueStore } from "../../store/queueStore";
import { useQueue } from "../../hooks/useQueue";
import LoadingScreen from "../shared/LoadingScreen";

export default function PatientWaitingRoom() {
  const { clinicId } = useParams();
  const [initialLoad, setInitialLoad] = useState(true);
  const { waiting, serving, avgTime, clinicName, doctorName, avgConsultationTime, isConnected } = useQueueStore();

  useQueue(clinicId, "patient");

  useEffect(() => {
    const t = setTimeout(() => setInitialLoad(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const getPositionSuffix = (n) => ["th","st","nd","rd"][n <= 3 ? n : 0] || "th";

  return (
    <>
      <LoadingScreen show={initialLoad} />
      <div className="min-h-screen px-4 py-8" style={{ backgroundImage: "radial-gradient(ellipse at top, rgba(20,184,166,0.1) 0%, transparent 60%)" }}>
        <div className="max-w-lg mx-auto space-y-6">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">🏥</span>
              <div>
                <h1 className="text-xl font-bold text-gradient">{clinicName || "Queue Cure"}</h1>
                {doctorName && <p className="text-slate-400 text-sm">Dr. {doctorName}</p>}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono mt-3">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-teal-400 animate-pulse" : "bg-red-400"}`} />
              <span className={isConnected ? "text-teal-400" : "text-red-400"}>
                {isConnected ? "LIVE — Updates automatically" : "Reconnecting..."}
              </span>
            </div>
          </motion.div>

          <motion.div
            key={serving?._id || "empty"}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`glass-card p-8 text-center ${serving ? "border-teal-500/40 teal-glow" : "border-slate-700/50"}`}
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Currently Being Seen</p>
            {serving ? (
              <>
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-teal-500/10 border-2 border-teal-500/40 mb-4 mx-auto"
                >
                  <span className="text-5xl font-bold font-mono text-teal-400">#{serving.tokenNumber}</span>
                </motion.div>
                <p className="text-xl font-semibold text-slate-100">{serving.name}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                    <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" /> In consultation
                  </span>
                </div>
              </>
            ) : (
              <div className="py-4">
                <div className="text-5xl mb-3">🔔</div>
                <p className="text-slate-400">Waiting to start</p>
                <p className="text-slate-600 text-sm mt-1">No patient in consultation yet</p>
              </div>
            )}
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users size={16} className="text-amber-400" />
                <span className="text-xs text-slate-500 font-medium">Ahead of you</span>
              </div>
              <p className="text-4xl font-bold font-mono text-amber-400">{waiting.length}</p>
              <p className="text-xs text-slate-600 mt-1">patients waiting</p>
            </div>
            <div className="glass-card p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={16} className="text-teal-400" />
                <span className="text-xs text-slate-500 font-medium">Est. wait</span>
              </div>
              <p className="text-4xl font-bold font-mono text-teal-400">
                {waiting.length > 0 ? `${waiting.length * avgConsultationTime}` : "0"}
              </p>
              <p className="text-xs text-slate-600 mt-1">minutes approx.</p>
            </div>
          </div>

          {waiting.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Activity size={15} className="text-teal-400" /> Queue Order
                </h3>
                <span className="text-xs text-slate-500 font-mono">{avgConsultationTime} min/patient</span>
              </div>
              <div className="divide-y divide-slate-800/50 max-h-72 overflow-y-auto scrollbar-thin">
                <AnimatePresence>
                  {waiting.slice(0, 10).map((patient, idx) => (
                    <motion.div
                      key={patient._id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex items-center gap-3 px-5 py-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono text-slate-400 flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold font-mono text-teal-400">#{patient.tokenNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{patient.name}</p>
                        {patient.priority !== "normal" && (
                          <span className="text-xs text-amber-400">{patient.priority === "urgent" ? "🚨 Urgent" : "👴 Elderly"}</span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-mono text-teal-400">~{patient.estimatedWaitMinutes}m</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          <div className="text-center pb-4">
            <p className="text-xs text-slate-600">This page updates in real-time. No need to refresh.</p>
            <p className="text-xs text-slate-700 mt-1">Powered by Queue Cure 🏥</p>
          </div>
        </div>
      </div>
    </>
  );
}
