import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// Base API URL - thay đổi theo môi trường của bạn
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Tạo axios instance với config mặc định
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor - xử lý lỗi chung
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error: AxiosError) => {
    // Xử lý lỗi 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken')
      window.location.href = '/login'
    }

    // Xử lý lỗi 403 - Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied')
    }

    // Xử lý lỗi 500 - Server Error
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.data)
    }

    return Promise.reject(error)
  }
)

export default apiClient
