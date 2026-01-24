import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
  withCredentials: false, // مهم إذا عندك Sanctum/جلسات
});

// اختياري: توكن Bearer إذا بتستخدم JWT/Personal Access Tokens
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    // if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// اختياري: توحيد الأخطاء
api.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err);
  }
);
