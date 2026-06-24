import { Link, useNavigate } from "react-router-dom";
import { LogOut, Activity, Settings } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useQueueStore } from "../../store/queueStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const { clinic, logout } = useAuthStore();
  const { isConnected } = useQueueStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/receptionist" className="flex items-center gap-2.5 group">
          <span className="text-2xl">🏥</span>
          <div>
            <span className="font-bold text-gradient text-lg leading-none block">Queue Cure</span>
            {clinic?.name && (
              <span className="text-xs text-slate-500 font-mono leading-none">{clinic.name}</span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-teal-400 animate-pulse" : "bg-red-400"}`} />
            <span className={isConnected ? "text-teal-400" : "text-red-400"}>
              {isConnected ? "LIVE" : "OFFLINE"}
            </span>
          </div>

          {clinic && (
            <Link to="/settings" className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Settings size={18} />
            </Link>
          )}

          <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
