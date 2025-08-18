export const MESSAGES = {
  SUCCESS: {
    USER_REGISTERED: 'User registered successfully',
    USER_LOGGED_IN: 'User logged in successfully',
    USER_CREATED: 'User created successfully',
    USER_RETRIEVED: 'User retrieved successfully',
    USERS_RETRIEVED: 'Users retrieved successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    CONTACT_CREATED: 'Contact created successfully',
    CONTACT_RETRIEVED: 'Contact retrieved successfully',
    CONTACTS_RETRIEVED: 'Contacts retrieved successfully',
    CONTACT_UPDATED: 'Contact updated successfully',
    CONTACT_DELETED: 'Contact deleted successfully',
    CONTACTS_SEARCHED: 'Search results retrieved successfully',
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
