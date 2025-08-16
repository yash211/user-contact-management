// Error codes for the app
export const ERROR_CODES = {
  AUTH: {
    INVALID_CREDENTIALS: 'AUTH_001',
    USER_NOT_FOUND: 'AUTH_002',
    USER_ALREADY_EXISTS: 'AUTH_003',
  },
  VALIDATION: {
    INVALID_INPUT: 'VAL_001',
    MISSING_FIELD: 'VAL_002',
  },
} as const;
