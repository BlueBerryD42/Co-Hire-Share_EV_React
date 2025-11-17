import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";

const rawGatewayUrl =
  import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:61600";
export const API_GATEWAY_URL = rawGatewayUrl.replace(/\/+$/, "");

const normalizePrefix = (prefix: string) => {
  if (!prefix) return "";
  return prefix.startsWith("/") ? prefix : `/${prefix}`;
};

export const buildGatewayUrl = (pathPrefix = "/api") => {
  const normalizedPrefix = normalizePrefix(pathPrefix);
  return `${API_GATEWAY_URL}${normalizedPrefix}`;
};

const attachInterceptors = (client: AxiosInstance) => {
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token =
        Cookies.get("auth_token") || localStorage.getItem("accessToken");
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        Cookies.remove("auth_token");
        Cookies.remove("refresh_token");
        localStorage.removeItem("accessToken");
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }

      if (error.response?.status === 403) {
        console.error("Access denied");
      }

      if (error.response?.status && error.response.status >= 500) {
        console.error("Server error:", error.response.data);
      }

      return Promise.reject(error);
    }
  );
};

export const createApiClient = (pathPrefix = "/api") => {
  const client = axios.create({
    baseURL: buildGatewayUrl(pathPrefix),
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  attachInterceptors(client);
  return client;
};

const apiClient = createApiClient();

export default apiClient;
