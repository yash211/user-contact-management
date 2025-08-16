// App configuration
export const APP_CONSTANTS = {
  JWT: {
    EXPIRES_IN: '24h',
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    SALT_ROUNDS: 12,
  },
  USER: {
    DEFAULT_ROLE: 'user', // String literal to avoid circular import
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
  },
} as const;
