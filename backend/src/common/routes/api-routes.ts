// API routes configuration
export const API_ROUTES = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/register',
    LOGIN: '/login',
    PROFILE: '/profile',
    ADMIN_USERS: '/admin/users',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/profile',
    UPDATE: '/update',
  },
  CONTACTS: {
    BASE: '/contacts',
    CREATE: '/',
    GET_ALL: '/',
    GET_BY_ID: '/:id',
    UPDATE: '/:id',
    DELETE: '/:id',
    ADMIN_ALL: '/admin/all',
    EXPORT_CSV: '/export/csv',
  },
} as const;

// API tags for Swagger
export const API_TAGS = {
  AUTH: 'Authentication',
  USERS: 'Users',
  CONTACTS: 'Contacts',
} as const;
