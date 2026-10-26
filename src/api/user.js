import axios from "axios";
import { setupAuthInterceptors } from "@/src/store/authstore";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_BASE_URL ||
  "https://opentowork-81ic.onrender.com";

const sanitizeUrl = (url) => (url ? url.trim().replace(/\/+$/, "") : "");
const baseURL = `${sanitizeUrl(rawBaseUrl)}/api/v1/user`;

const endpoints = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach Bearer token and handle automatic 401 refresh token
setupAuthInterceptors(endpoints);

const Dashboard = async () => {
  const response = await endpoints.get("/dashboard");
  return response.data;
};

export { endpoints, Dashboard };
