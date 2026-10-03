import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";

// Base URL configuration supporting both NEXT_PUBLIC_ prefix and NEXT_BASE_URL
const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_BASE_URL ||
  "https://opentowork-81ic.onrender.com";

const sanitizeUrl = (url) => (url ? url.replace(/\/+$/, "") : "");
const AUTH_BASE_URL = `${sanitizeUrl(rawBaseUrl)}/api/v1/auth`;

// Create a dedicated Axios instance for Auth API
export const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Helper to extract clean error message from Axios errors
export const extractErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (typeof error.response?.data === "string" && error.response.data.trim()) {
    return error.response.data;
  }
  if (error.message) {
    return error.message;
  }
  return "An unexpected error occurred. Please try again.";
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      otpSent: false,
      tempEmail: "",

      // Helper to clear errors
      clearError: () => set({ error: null }),

      // Helper to set user manually
      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
        }),

      // Helper to set token manually
      setToken: (token) => {
        set({ token });
        if (token) {
          authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          delete authApi.defaults.headers.common["Authorization"];
        }
      },

      /**
       * 2. Send 6-digit OTP to user's email for registration
       * @param {Object|string} usernameOrPayload - Payload object { username, email, password } OR username
       * @param {string} [email] - Email if positional arguments are used
       * @param {string} [password] - Password if positional arguments are used
       */
      sendOtp: async (usernameOrPayload, email, password) => {
        set({ loading: true, error: null, otpSent: false });

        let payload = {};
        if (typeof usernameOrPayload === "object" && usernameOrPayload !== null) {
          payload = {
            username: usernameOrPayload.username || usernameOrPayload.fullName || usernameOrPayload.name,
            email: usernameOrPayload.email,
            password: usernameOrPayload.password,
          };
        } else {
          payload = {
            username: usernameOrPayload,
            email,
            password,
          };
        }

        try {
          const response = await authApi.post("/sendotp", payload);
          set({
            loading: false,
            otpSent: true,
            tempEmail: payload.email,
            error: null,
          });
          return { success: true, data: response.data };
        } catch (error) {
          const message = extractErrorMessage(error);
          set({
            loading: false,
            otpSent: false,
            error: message,
          });
          throw new Error(message);
        }
      },

      /**
       * 3. & 4. & 5. Verify OTP entered by user and complete registration
       * @param {Object|string} emailOrPayload - Payload object { email, otp } OR email string
       * @param {string} [otp] - OTP string if positional arguments are used
       */
      verifyOtp: async (emailOrPayload, otp) => {
        set({ loading: true, error: null });

        let payload = {};
        if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
          payload = {
            email: emailOrPayload.email || get().tempEmail,
            otp: String(emailOrPayload.otp || "").trim(),
          };
        } else {
          payload = {
            email: emailOrPayload || get().tempEmail,
            otp: String(otp || "").trim(),
          };
        }

        try {
          const response = await authApi.post("/verifyotp", payload);
          const data = response.data;
          const user = data?.user || data?.data?.user || data?.data || data;
          const token = data?.token || data?.data?.token || null;

          if (token) {
            authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
            otpSent: false,
            tempEmail: "",
          });

          return { success: true, data };
        } catch (error) {
          const message = extractErrorMessage(error);
          set({
            loading: false,
            error: message,
          });
          throw new Error(message);
        }
      },

      /**
       * 6. Log in with email and password
       * @param {Object|string} emailOrPayload - Payload object { email, password } OR email string
       * @param {string} [password] - Password if positional arguments are used
       */
      login: async (emailOrPayload, password) => {
        set({ loading: true, error: null });

        let payload = {};
        if (typeof emailOrPayload === "object" && emailOrPayload !== null) {
          payload = {
            email: emailOrPayload.email,
            password: emailOrPayload.password,
          };
        } else {
          payload = {
            email: emailOrPayload,
            password,
          };
        }

        try {
          const response = await authApi.post("/login", payload);
          const data = response.data;
          const user = data?.user || data?.data?.user || data?.data || data;
          const token = data?.token || data?.data?.token || null;

          if (token) {
            authApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          }

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return { success: true, data };
        } catch (error) {
          const message = extractErrorMessage(error);
          set({
            loading: false,
            error: message,
          });
          throw new Error(message);
        }
      },

      /**
       * Log out the current user
       */
      logout: () => {
        delete authApi.defaults.headers.common["Authorization"];
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
          otpSent: false,
          tempEmail: "",
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          authApi.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
        }
      },
    }
  )
);

// Standalone functions for convenience anywhere in the app
export const sendOtp = (username, email, password) =>
  useAuthStore.getState().sendOtp(username, email, password);

export const verifyOtp = (email, otp) =>
  useAuthStore.getState().verifyOtp(email, otp);

export const login = (email, password) =>
  useAuthStore.getState().login(email, password);

export const logout = () =>
  useAuthStore.getState().logout();

export const clearAuthError = () =>
  useAuthStore.getState().clearError();

export default useAuthStore;