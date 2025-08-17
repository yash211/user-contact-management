# Contact Management Frontend

A modern, responsive React application built with TailwindCSS for managing user contacts.

## Features

- **Authentication System**: Login and signup forms with smooth transitions
- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern UI**: Clean, professional interface suitable for production
- **Component Architecture**: Well-organized, reusable components

## Tech Stack

- React 19
- TailwindCSS 3.4
- Vite (Build tool)
- Modern JavaScript (ES6+)

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── AuthPage.jsx      # Main auth container
│   │   ├── LoginForm.jsx     # Login form component
│   │   ├── SignupForm.jsx    # Signup form component
│   │   └── index.js          # Auth components export
│   └── index.js              # Main components export
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
└── index.css                 # Global styles and Tailwind imports
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Design Features

- **Left Panel**: Gradient background with placeholder image and branding
- **Right Panel**: Dynamic form switching between login and signup
- **Responsive**: Adapts to all screen sizes
- **Accessibility**: Proper labels, focus states, and semantic HTML
- **Smooth Transitions**: CSS transitions for better user experience

## Component Usage

### AuthPage
Main container that manages form state and layout.

### LoginForm
Handles user authentication with email and password fields.

### SignupForm
User registration with comprehensive form validation.

## Styling

The application uses TailwindCSS for styling with:
- Consistent color scheme (blue primary, gray secondary)
- Responsive breakpoints (mobile-first approach)
- Smooth transitions and hover effects
- Professional typography and spacing

## Future Enhancements

- Form validation and error handling
- API integration with backend
- Protected routes and authentication state
- Contact management dashboard
- User profile management
