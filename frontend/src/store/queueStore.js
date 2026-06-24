import { create } from "zustand";

export const useQueueStore = create((set) => ({
  waiting: [],
  serving: null,
  completed: 0,
  skipped: 0,
  avgTime: 10,
  clinicName: "",
  doctorName: "",
  avgConsultationTime: 10,
  isLoading: false,
  isConnected: false,
  lastUpdated: null,

  setQueue: (data) => set({
    waiting: data.waiting || [],
    serving: data.serving || null,
    completed: data.completed || 0,
    skipped: data.skipped || 0,
    avgTime: data.avgTime || 10,
    clinicName: data.clinicName || "",
    doctorName: data.doctorName || "",
    avgConsultationTime: data.avgConsultationTime || 10,
    lastUpdated: new Date(),
  }),

  setLoading: (isLoading) => set({ isLoading }),
  setConnected: (isConnected) => set({ isConnected }),
}));
