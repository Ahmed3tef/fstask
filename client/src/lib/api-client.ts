import axios, { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

interface NestJSErrorResponse {
  message: string | string[];
  error?: string;
  statusCode: number;
}

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<NestJSErrorResponse>) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      statusCode: error.response?.status,
    };

    // Handle different error scenarios
    if (error.response?.data) {
      // Backend returned an error response
      const { message, error: errorType } = error.response.data;
      
      // Handle array of messages (validation errors)
      apiError.message = Array.isArray(message) 
        ? message.join(', ') 
        : message;
      
      apiError.error = errorType;
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      apiError.message = 'Request timeout. Please try again.';
    } else if (error.message === 'Network Error') {
      // Network error (server down, CORS, etc.)
      apiError.message = 'Network error. Please check your connection.';
    } else if (error.request) {
      // Request was made but no response received
      apiError.message = 'No response from server. Please try again.';
    } else {
      // Something else happened
      apiError.message = error.message || 'An unexpected error occurred';
    }

    return Promise.reject(apiError);
  },
);