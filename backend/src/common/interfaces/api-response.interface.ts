export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponseBuilder<T> {
  private response: Partial<ApiResponse<T>> = {
    success: true,
    timestamp: new Date().toISOString(),
  };

  success(success: boolean): ApiResponseBuilder<T> {
    this.response.success = success;
    return this;
  }

  message(message: string): ApiResponseBuilder<T> {
    this.response.message = message;
    return this;
  }

  data(data: T): ApiResponseBuilder<T> {
    this.response.data = data;
    return this;
  }

  error(error: string): ApiResponseBuilder<T> {
    this.response.error = error;
    return this;
  }

  path(path: string): ApiResponseBuilder<T> {
    this.response.path = path;
    return this;
  }

  build(): ApiResponse<T> {
    return this.response as ApiResponse<T>;
  }
}
