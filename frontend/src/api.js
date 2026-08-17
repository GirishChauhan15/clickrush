import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const ACCESS_TOKEN_KEY = "clickrush_access_token";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const original = error.config;
    const url = original?.url || "";

    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (
      error.response?.status !== 401 ||
      original?._retry ||
      isAuthEndpoint
    ) {
      return Promise.reject(error);
    }

    original._retry = true;

    refreshing ??= axios
      .post(
        `${API_URL}/auth/refresh`,
        {},
        { withCredentials: true }
      )
      .then(({ data }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.token);
        return data.token;
      })
      .finally(() => {
        refreshing = null;
      });

    try {
      const token = await refreshing;

      original.headers.Authorization = `Bearer ${token}`;

      return api(original);
    } catch {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      return Promise.reject(error);
    }
  }
);