# Contact Management Frontend

A modern, responsive React application built with Redux Toolkit, TailwindCSS, and Axios for managing user contacts.

## Features

- **Authentication System**: Login and signup forms with Redux state management
- **JWT Token Security**: Secure token handling with HTTP-only cookies
- **API Integration**: Full backend integration with Axios
- **Protected Routes**: Route protection based on authentication state
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern UI**: Clean, professional interface suitable for production
- **Component Architecture**: Well-organized, reusable components

## Tech Stack

- React 19
- Redux Toolkit (State Management)
- React Router (Routing)
- Axios (HTTP Client)
- TailwindCSS 3.4
- js-cookie (Cookie Management)
- Vite (Build tool)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthPage.jsx      # Main auth container with routing
│   │   ├── LoginForm.jsx     # Login form with Redux integration
│   │   ├── SignupForm.jsx    # Signup form with Redux integration
│   │   └── index.js          # Auth components export
│   ├── dashboard/
│   │   ├── Dashboard.jsx     # Main dashboard for authenticated users
│   │   └── index.js          # Dashboard components export
│   ├── common/
│   │   ├── ProtectedRoute.jsx # Route protection component
│   │   └── index.js          # Common components export
│   └── index.js              # Main components export
├── store/
│   ├── slices/
│   │   └── authSlice.js      # Redux auth slice with async thunks
│   ├── hooks.js              # Redux hooks for easy state access
│   └── index.js              # Redux store configuration
├── services/
│   └── api.js                # Axios API service with interceptors
├── config/
│   └── env.js                # Environment configuration
├── App.jsx                   # Main application with routing
├── main.jsx                  # Application entry point
└── index.css                 # Global styles and Tailwind imports
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create environment variables (optional):
   ```bash
   # .env.local
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_APP_NAME=Contact Management
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## API Integration

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### JWT Token Security
- Tokens stored in secure HTTP-only cookies
- Automatic token inclusion in API requests
- Token expiration handling with automatic logout
- Secure cookie settings (sameSite: strict, secure: true)

## State Management

### Redux Store Structure
- **Auth Slice**: User authentication state, login/register/logout actions
- **Async Thunks**: API calls with loading states and error handling
- **Persistent State**: JWT tokens stored in cookies for session persistence

### Key Actions
- `login(credentials)` - Authenticate user
- `register(userData)` - Create new user account
- `logout()` - Clear user session
- `setCredentials(user, token)` - Set user data and token

## Routing

### Public Routes
- `/auth` - Authentication page (login/signup)

### Protected Routes
- `/dashboard` - Main application dashboard (requires authentication)

### Route Protection
- Automatic redirect to `/auth` for unauthenticated users
- Automatic redirect to `/dashboard` after successful authentication

## Security Features

- **JWT Token Validation**: Automatic token validation on each request
- **Secure Cookie Storage**: HTTP-only cookies with secure flags
- **Automatic Logout**: Token expiration handling
- **Protected Routes**: Route-level authentication checks
- **CSRF Protection**: SameSite cookie policy

## Error Handling

- **Form Validation**: Client-side validation with error display
- **API Error Handling**: Centralized error handling with user-friendly messages
- **Loading States**: Visual feedback during API calls
- **Error Boundaries**: Graceful error handling throughout the app

## Future Enhancements

- Contact management CRUD operations
- User profile management
- File upload functionality
- Real-time notifications
- Advanced search and filtering
- Data export/import features
