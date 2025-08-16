// User messages
export const MESSAGES = {
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User with this email already exists',
  },
  VALIDATION: {
    NAME_MIN_LENGTH: 'Name must be at least 2 characters long',
    EMAIL_FORMAT: 'Please provide a valid email address',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters long',
  },
} as const;
