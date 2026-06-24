import axios from "axios";

const api = axios.create({
  baseURL:
    "https://queue-management-system-jan0.onrender.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("qc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("qc_token");
      localStorage.removeItem("qc_clinic");
      window.location.href = "/login";
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateSettings: (data) => api.put("/auth/settings", data),
};

export const queueAPI = {
  getQueue: () => api.get("/queue"),
  getPublicQueue: (clinicId) => api.get(`/queue/public/${clinicId}`),
  addPatient: (data) => api.post("/queue/add-patient", data),
  callNext: () => api.post("/queue/call-next"),
  skipPatient: (id) => api.patch(`/queue/skip/${id}`),
  markNoShow: (id) => api.patch(`/queue/no-show/${id}`),
  getStats: () => api.get("/queue/stats"),
  resetQueue: () => api.post("/queue/reset"),
  updateConsultTime: (time) => api.put("/queue/update-consult-time", { avgConsultationTime: time }),
};

export default api;
