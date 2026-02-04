import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Public routes (no auth required)
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/google-login",
  "/auth/verify-otp",
  "/auth/resend-otp",
  "/auth/forgot-password",
  "/auth/reset-password",

  // Admin auth
  "/admin/auth/login",
  "/admin/auth/verify-otp",

  // Public application
  "/public/application/new",
  "/public/application/verify-email",
  "/public/application/resend-otp",
  "/public/application/send-otp",
];

api.interceptors.request.use(
  (config) => {
    // ✅ Allow public routes safely
    if (publicRoutes.some((route) => config.url?.includes(route))) {
      return config;
    }

    // 🔐 Protected routes
    const token = getToken();

    if (!token) {
      // ⛔ DO NOT hard-redirect during async flows
      window.location.href = "/login";
      return Promise.reject(new Error("Token expired or missing"));
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
