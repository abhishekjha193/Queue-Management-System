import { create } from "zustand";

const getStoredClinic = () => {
  try {
    const c = localStorage.getItem("qc_clinic");
    return c ? JSON.parse(c) : null;
  } catch { return null; }
};

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem("qc_token") || null,
  clinic: getStoredClinic(),
  isAuthenticated: !!localStorage.getItem("qc_token"),

  setAuth: (token, clinic) => {
    localStorage.setItem("qc_token", token);
    localStorage.setItem("qc_clinic", JSON.stringify(clinic));
    set({ token, clinic, isAuthenticated: true });
  },

  updateClinic: (clinic) => {
    localStorage.setItem("qc_clinic", JSON.stringify(clinic));
    set({ clinic });
  },

  logout: () => {
    localStorage.removeItem("qc_token");
    localStorage.removeItem("qc_clinic");
    set({ token: null, clinic: null, isAuthenticated: false });
  },

  getClinicId: () => get().clinic?.id || get().clinic?._id || null,
}));
