import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Connecting to clinic network...",
  "Syncing real-time queue...",
  "Loading patient data...",
  "Almost ready...",
];

export default function LoadingScreen({ show = true }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    const msgTimer = setInterval(() => setMsgIdx((i) => (i + 1) % messages.length), 900);
    const progTimer = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 15, 95)), 200);
    return () => { clearInterval(msgTimer); clearInterval(progTimer); };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950"
          style={{
            backgroundImage: "radial-gradient(ellipse at center, rgba(20,184,166,0.08) 0%, transparent 70%)",
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex flex-col items-center gap-8 max-w-sm w-full px-8"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-2 border-teal-500/20"
                style={{ borderTopColor: "#14b8a6" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl">🏥</span>
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-teal-500/30"
              />
            </div>

            <div className="text-center space-y-2">
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-bold text-gradient"
              >
                Queue Cure
              </motion.h1>
              <AnimatePresence mode="wait">
                <motion.p
                  key={msgIdx}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-slate-400 text-sm font-mono"
                >
                  {messages[msgIdx]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="w-full">
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-xs text-slate-600">Initializing</span>
                <span className="text-xs text-teal-500 font-mono">{Math.round(progress)}%</span>
              </div>
            </div>

            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 rounded-full bg-teal-500"
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
