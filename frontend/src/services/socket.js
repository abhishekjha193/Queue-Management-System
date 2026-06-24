import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io(
      "https://queue-management-system-jan0.onrender.com",
      {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      }
    );
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinClinicRoom = (clinicId) => {
  if (socket) socket.emit("join-clinic", clinicId);
};

export const joinReceptionistRoom = (clinicId) => {
  if (socket) socket.emit("join-receptionist", clinicId);
};
