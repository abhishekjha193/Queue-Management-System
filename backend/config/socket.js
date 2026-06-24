let io;

const initSocket = (server) => {
  const { Server } = require("socket.io");
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    socket.on("join-clinic", (clinicId) => {
      socket.join(`clinic-${clinicId}`);
    });

    socket.on("join-receptionist", (clinicId) => {
      socket.join(`receptionist-${clinicId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };
