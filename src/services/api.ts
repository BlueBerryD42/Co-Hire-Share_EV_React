import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import Cookies from 'js-cookie'

// API Gateway URL - sử dụng Ocelot Gateway làm điểm truy cập duy nhất
const API_GATEWAY_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_GATEWAY_URL || 'https://localhost:61600'
const API_BASE_URL = `${API_GATEWAY_URL}/api`

console.log('🌐 API Gateway URL:', API_GATEWAY_URL)
console.log('🌐 API Base URL:', API_BASE_URL)

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
  // Allow self-signed certificates in development
  ...(import.meta.env.DEV && {
    httpsAgent: { rejectUnauthorized: false }
  })
})

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Try to get token from cookies first (used by auth), then localStorage
    const token = Cookies.get('auth_token') || localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Adding token to request:', config.url)
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

// Response interceptor - xử lý lỗi chung
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      console.error('🔒 401 Unauthorized - Clearing tokens and redirecting to login')
      // Clear both localStorage and cookies
      localStorage.removeItem('accessToken')
      Cookies.remove('auth_token')
      Cookies.remove('refresh_token')

      // Only redirect if not already on login/register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login'
      }
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('🚫 Access denied - insufficient permissions')
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('💥 Server error:', error.response.data)
    }
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
