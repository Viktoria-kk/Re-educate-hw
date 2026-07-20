import axios from "axios";
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api", timeout: 10000 });
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("quizToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const errorMessage = (error) => error.response?.data?.message || error.message || "Something went wrong";
export default api;
