import axios from "axios";
import { setupAuthInterceptors } from "@/src/store/authstore";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  process.env.NEXT_BASE_URL ||
  "https://opentowork-81ic.onrender.com";

const sanitizeUrl = (url) => (url ? url.trim().replace(/\/+$/, "") : "");
const baseURL = `${sanitizeUrl(rawBaseUrl)}/api/v1/work`;

export const workEndpoints = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically handle authorization headers and silent 401 refresh token retry
setupAuthInterceptors(workEndpoints);

/**
 * Fetch paginated works from /api/v1/work/?page={page}&limit={limit}
 * @param {Object} params - Query parameters { page, limit, search, category, status }
 */
export const getWorks = async ({ page = 1, limit = 10, search = "", category = "", status = "" } = {}) => {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());
  if (search) queryParams.append("search", search);
  if (category && category !== "All") queryParams.append("category", category);
  if (status && status !== "All") queryParams.append("status", status);

  const queryString = queryParams.toString();
  const url = queryString ? `/?${queryString}` : "/";

  const response = await workEndpoints.get(url);
  return response.data;
};

/**
 * Fetch a single work item by ID
 * @param {string} id
 */
export const getWorkById = async (id) => {
  const response = await workEndpoints.get(`/${id}`);
  return response.data;
};

/**
 * Submit an application to a work project
 * @param {string} workId
 * @param {Object} payload - { proposal, bidAmount, estimatedDays, ... }
 */
export const applyForWork = async (workId, payload = {}) => {
  const response = await workEndpoints.post(`/apply/${workId}`, payload);
  return response.data;
};

/**
 * Post a new work project
 * @param {Object} payload - { title, description, fees, workType, categoryId, longitude, latitude, validUntil }
 */
export const createWork = async (payload) => {
  const response = await workEndpoints.post("/creatework", payload);
  return response.data;
};

/**
 * Fetch works created by the authenticated user
 * GET /api/v1/work/userwork
 */
export const getUserWorks = async () => {
  const response = await workEndpoints.get("/userwork");
  return response.data;
};

/**
 * Fetch works / applications applied by the authenticated user
 * GET /api/v1/work/takework
 */
export const getAppliedWorks = async () => {
  const response = await workEndpoints.get("/takework");
  return response.data;
};

/**
 * Fetch users/applications applied for a specific work
 * GET /api/v1/work/workapplications/:workId
 * @param {string} workId
 */
export const getWorkApplications = async (workId) => {
  const response = await workEndpoints.get(`/workapplications/${workId}`);
  return response.data;
};

export const updateWorkApplicationStatus = async (workId) => {
  const response = await workEndpoints.patch(`/updatework/${workId}`);
  return response.data;
};

/**
 * Update work information
 * PUT /api/v1/work/updatework/:id
 * @param {string} id - Work ID
 * @param {Object} payload - Work data payload to update
 */
export const updateWork = async (id, payload) => {
  const response = await workEndpoints.put(`/updatework/${id}`, payload);
  return response.data;
};

// Aliases for convenience
export const getUserAppliedWorks = getAppliedWorks;
export const getTakeWorks = getAppliedWorks;

