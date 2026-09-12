import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aegis_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getToken() {
  return localStorage.getItem("aegis_token");
}
export function setToken(t) {
  if (t) localStorage.setItem("aegis_token", t);
}
export function clearToken() {
  localStorage.removeItem("aegis_token");
}

// Category -> visual gradient + lucide icon name mapping
export const CATEGORY_STYLES = {
  "Web Development": { from: "#00E5FF", to: "#0891b2", icon: "Code2" },
  "Mobile Apps": { from: "#10B981", to: "#059669", icon: "Smartphone" },
  "Design & Branding": { from: "#f472b6", to: "#db2777", icon: "Palette" },
  "Marketing & SEO": { from: "#fbbf24", to: "#f59e0b", icon: "TrendingUp" },
  "Writing & Content": { from: "#60a5fa", to: "#2563eb", icon: "PenLine" },
  "Video & Animation": { from: "#a78bfa", to: "#7c3aed", icon: "Clapperboard" },
  "Data & AI": { from: "#00E5FF", to: "#10B981", icon: "BrainCircuit" },
  "Business Consulting": { from: "#f97316", to: "#ea580c", icon: "Briefcase" },
};

export function catStyle(category) {
  return CATEGORY_STYLES[category] || { from: "#00E5FF", to: "#0891b2", icon: "Sparkles" };
}
