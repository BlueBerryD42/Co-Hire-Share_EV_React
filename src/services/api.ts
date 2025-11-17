import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import Cookies from 'js-cookie'

// API Gateway URL - sử dụng Ocelot Gateway làm điểm truy cập duy nhất
const rawGatewayUrl =
  import.meta.env.VITE_API_GATEWAY_URL || 'https://localhost:61600'
export const API_GATEWAY_URL = rawGatewayUrl.replace(/\/+$/, '')

console.log('API Gateway URL:', API_GATEWAY_URL)

const normalizePrefix = (prefix: string) => {
  if (!prefix) return ''
  return prefix.startsWith('/') ? prefix : `/${prefix}`
}

export const buildGatewayUrl = (pathPrefix = '/api') => {
  const normalizedPrefix = normalizePrefix(pathPrefix)
  return `${API_GATEWAY_URL}${normalizedPrefix}`
}

const attachInterceptors = (client: AxiosInstance) => {
  // Request interceptor - thêm token vào header
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token =
        Cookies.get('auth_token') || localStorage.getItem('accessToken')
      if (token) {
        config.headers = config.headers ?? {}
        config.headers.Authorization = `Bearer ${token}`
        console.log('Adding token to request:', config.url)
      }
      return config
    },
    (error: AxiosError) => Promise.reject(error)
  )

  // Response interceptor - xử lý lỗi chung
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      // Xử lý lỗi 401 - Unauthorized
      if (error.response?.status === 401) {
        console.error('401 Unauthorized - Clearing tokens and redirecting to login')
        Cookies.remove('auth_token')
        Cookies.remove('refresh_token')
        localStorage.removeItem('accessToken')
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login'
        }
      }

      // Xử lý lỗi 403 - Forbidden
      if (error.response?.status === 403) {
        console.error('Access denied - insufficient permissions')
      }

      // Xử lý lỗi 500 - Server Error
      if (error.response?.status && error.response.status >= 500) {
        console.error('Server error:', error.response.data)
      }

      return Promise.reject(error)
    }
  )
}

export const createApiClient = (pathPrefix = '/api') => {
  const client = axios.create({
    baseURL: buildGatewayUrl(pathPrefix),
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000,
  })

  attachInterceptors(client)
  return client
}

const apiClient = createApiClient()

export default apiClient
