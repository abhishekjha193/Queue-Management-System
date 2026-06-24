import { useEffect, useRef } from "react";
import { initSocket, joinClinicRoom, joinReceptionistRoom } from "../services/socket";
import { useQueueStore } from "../store/queueStore";
import { queueAPI } from "../services/api";
import toast from "react-hot-toast";

export const useQueue = (clinicId, mode = "patient") => {
  const { setQueue, setConnected } = useQueueStore();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!clinicId) return;

    const fetchInitial = async () => {
      try {
        let data;
        if (mode === "receptionist") {
          const res = await queueAPI.getQueue();
          data = res.data;
        } else {
          const res = await queueAPI.getPublicQueue(clinicId);
          data = res.data;
        }
        setQueue(data);
      } catch {}
    };

    fetchInitial();

    const socket = initSocket();
    socketRef.current = socket;

    joinClinicRoom(clinicId);
    if (mode === "receptionist") joinReceptionistRoom(clinicId);

    socket.on("connect", () => {
      setConnected(true);
      joinClinicRoom(clinicId);
      if (mode === "receptionist") joinReceptionistRoom(clinicId);
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("queue-update", (data) => {
      setQueue(data);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("queue-update");
    };
  }, [clinicId, mode, setQueue, setConnected]);

  return socketRef.current;
};
