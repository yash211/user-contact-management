// HTTP status codes
export const HTTP_STATUS = {
  SUCCESS: {
    OK: 200,
    CREATED: 201,
  },
  CLIENT_ERROR: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404,
  },
  SERVER_ERROR: {
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;

// Type for HTTP status codes
export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS][keyof typeof HTTP_STATUS[keyof typeof HTTP_STATUS]];
