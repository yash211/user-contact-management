// Standard API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: any;
}

// Response builder for consistent API responses
export class ResponseBuilder {
  static success<T>(data: T, message: string, path: string): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  static error(message: string, error: string, statusCode: number, path: string, details?: any): ErrorResponse {
    return {
      success: false,
      message,
      error,
      statusCode,
      timestamp: new Date().toISOString(),
      path,
      details,
    };
  }
}
