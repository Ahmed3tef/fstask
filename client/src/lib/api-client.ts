import axios, { AxiosError } from 'axios';
import type { ApiError } from '@/types/order.types';

// API base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * Configured axios instance with interceptors
 * Handles common concerns: base URL, error transformation
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

/**
 * Response interceptor for consistent error handling
 * Transforms backend errors into user-friendly messages
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message: string; statusCode: number }>) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status,
    };

    if (error.response?.data?.message) {
      // Backend error message (e.g., "Insufficient balance")
      apiError.message = error.response.data.message;
    } else if (error.message === 'Network Error') {
      apiError.message = 'Network error. Please check your connection.';
    } else if (error.code === 'ECONNABORTED') {
      apiError.message = 'Request timeout. Please try again.';
    }

    return Promise.reject(apiError);
  },
);
