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
  withCredentials: true,
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
        set({ token, isAuthenticated: Boolean(token) });
        if (token) {
          authApi.defaults.headers.common["Authorization"] = token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
        } else {
          delete authApi.defaults.headers.common["Authorization"];
        }
      },

      /**
       * 1. Refresh Access Token using /refereshtoken endpoint
       */
      refreshToken: async () => {
        try {
          const response = await axios.post(
            `${AUTH_BASE_URL}/refereshtoken`,
            {},
            { withCredentials: true }
          );
          const data = response.data;
          const newToken =
            data?.token ||
            data?.accessToken ||
            data?.data?.token ||
            data?.data?.accessToken ||
            null;

          if (newToken) {
            get().setToken(newToken);
            return newToken;
          }
          return null;
        } catch (error) {
          throw error;
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
      logout: async () => {
        delete authApi.defaults.headers.common["Authorization"];
        try {
          const response = await authApi.post("/logout");
          const data = response.data;
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: null,
            otpSent: false,
            tempEmail: "",
          });
          return data;
        } catch (error) {
          const message = extractErrorMessage(error);
          set({
            error: message,
          });
        }
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

// Concurrency queue for token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Attaches request and response interceptors to an Axios instance:
 * 1. Automatically attaches Authorization header.
 * 2. Automatically intercepts 401 errors, calls /refereshtoken, and replays failed requests.
 */
export const setupAuthInterceptors = (axiosInstance) => {
  // Request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = useAuthStore.getState().token;
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = token.startsWith("Bearer ")
          ? token
          : `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: automatically refresh on 401, 403, or invalid token errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const errorMsg = String(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        ""
      ).toLowerCase();

      const isAuthError =
        status === 401 ||
        status === 403 ||
        status === 500 ||
        errorMsg.includes("invalid access token") ||
        errorMsg.includes("token expired") ||
        errorMsg.includes("Error: Invalid access token") ||
        errorMsg.includes("jwt expired") ||
        errorMsg.includes("invalid token");

      if (
        isAuthError &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("/refereshtoken") &&
        !originalRequest.url?.includes("/refreshtoken") &&
        !originalRequest.url?.includes("/login") &&
        !originalRequest.url?.includes("/sendotp") &&
        !originalRequest.url?.includes("/verifyotp")
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token) {
                originalRequest.headers.Authorization = token.startsWith("Bearer ")
                  ? token
                  : `Bearer ${token}`;
              }
              return axiosInstance(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${AUTH_BASE_URL}/refereshtoken`,
            {},
            { withCredentials: true }
          );

          const data = response.data;
          const newToken =
            data?.token ||
            data?.accessToken ||
            data?.data?.token ||
            data?.data?.accessToken;

          if (newToken) {
            useAuthStore.getState().setToken(newToken);
            processQueue(null, newToken);
            originalRequest.headers.Authorization = newToken.startsWith("Bearer ")
              ? newToken
              : `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } else {
            // Token is refreshed in HTTP-only cookie by the backend
            processQueue(null, null);
            return axiosInstance(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          useAuthStore.getState().logout();
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};

// Attach interceptors to authApi
setupAuthInterceptors(authApi);

// Standalone functions for convenience anywhere in the app
export const sendOtp = (username, email, password) =>
  useAuthStore.getState().sendOtp(username, email, password);

export const verifyOtp = (email, otp) =>
  useAuthStore.getState().verifyOtp(email, otp);

// Simple standalone functions to authenticate with provider (e.g. Firebase Google Auth)
export const LoginWithProvider = async (token) => {
  const authToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
  
  // NOTE: withCredentials: true is CRITICAL so the browser receives & saves the Set-Cookie token
  const response = await axios.post(
    `${AUTH_BASE_URL}/loginuserWithProvider`,
    {},
    {
      withCredentials: true,
      headers: {
        Authorization: authToken,
      },
    }
  );

  const data = response.data;
  const user = data?.user || data?.data?.user || data?.data?.profile || data?.data;
  const backendToken = data?.token || data?.data?.token || null;
  
  // Mark user as authenticated in the store
  if (user) {
    useAuthStore.getState().setUser(user);
  }
  if (backendToken) {
    useAuthStore.getState().setToken(backendToken);
  } else {
    // When tokens are in cookies only, set isAuthenticated to true if login was successful
    useAuthStore.setState({ isAuthenticated: true });
  }

  return data;
};

export const signupWithProvider = async (token) => {
  const authToken = token?.startsWith("Bearer ") ? token : `Bearer ${token}`;
  const response = await authApi.post(
    "/createuserwithprovider",
    {},
    {
      headers: {
        Authorization: authToken,
      },
    }
  );
  const data = response.data;
  const user = data?.user || data?.data?.user || data?.data?.profile || data?.data;
  const backendToken = data?.token || data?.data?.token || null;
  if (user) {
    useAuthStore.getState().setUser(user);
  }
  if (backendToken) {
    useAuthStore.getState().setToken(backendToken);
  } else if (user) {
    useAuthStore.setState({ isAuthenticated: true });
  }
  return data;
};

export const SignupWithauthProvider = signupWithProvider;

export const refreshToken = () =>
  useAuthStore.getState().refreshToken();

export const logout = () =>
  useAuthStore.getState().logout();

export const clearAuthError = () =>
  useAuthStore.getState().clearError();

export default useAuthStore;