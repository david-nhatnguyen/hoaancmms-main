import axios, { AxiosInstance, AxiosError } from 'axios';
import { env } from '@/config/env';

/**
 * API Client - Axios instance with interceptors
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor
 * - Add auth token to requests
 * - Log requests in development
 */
apiClient.interceptors.request.use(
    (config) => {
        // Add auth token if exists
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in development
        if (import.meta.env.DEV) {
            console.log('🚀 API Request:', {
                method: config.method?.toUpperCase(),
                url: config.url,
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor
 * - Return data directly
 * - Handle errors globally
 * - Log responses in development
 */
apiClient.interceptors.response.use(
    (response) => {
        // Log response in development
        if (import.meta.env.DEV) {
            console.log('✅ API Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data,
            });
        }

        // Return data directly (unwrap response)
        return response.data;
    },
    (error: AxiosError) => {
        // Log error in development
        if (import.meta.env.DEV) {
            console.error('❌ API Error:', {
                url: error.config?.url,
                status: error.response?.status,
                message: error.message,
                data: error.response?.data,
            });
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access denied');
        }

        return Promise.reject(error);
    }
);
