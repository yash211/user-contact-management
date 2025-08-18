// Simple validation functions for contact form

export const validateName = (name) => {
  if (!name || !name.trim()) return 'Name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.trim().length > 100) return 'Name cannot exceed 100 characters';
  
  // Check for invalid characters (numbers and special characters)
  if (/[0-9!@#$%^&*()_+=<>?[\]{}|\\/]/.test(name.trim())) {
    return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
  }
  
  // Allow letters, spaces, hyphens, apostrophes, and periods (common in names)
  if (!/^[a-zA-Z\s\-'\.]+$/.test(name.trim())) {
    return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods';
  }
  
  return '';
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email cannot exceed 255 characters';
  
  // Check for common domain typos
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain) {
    const commonTypos = {
      'gial.com': 'gmail.com',
      'gmal.com': 'gmail.com', 
      'gmil.com': 'gmail.com',
      'gamal.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'yaho.com': 'yahoo.com',
      'hotmai.com': 'hotmail.com',
      'hotmal.com': 'hotmail.com',
      'outloo.com': 'outlook.com',
      'outlok.com': 'outlook.com'
    };
    
    if (commonTypos[domain]) {
      return `Did you mean ${commonTypos[domain]}?`;
    }
  }
  
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) return 'Phone number is required';
  if (phone.trim().length < 7) return 'Phone number must be at least 7 digits';
  if (phone.trim().length > 20) return 'Phone number cannot exceed 20 characters';
  if (!/^[\+]?[\d\s\-\(\)]+$/.test(phone.trim())) return 'Please enter a valid phone number';
  return '';
};

export const validatePassword = (password) => {
  if (!password || !password.trim()) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
  if (!/(?=.*[@$!%*?&])/.test(password)) return 'Password must contain at least one special character';
  return '';
};

export const validateField = (field, value) => {
  switch (field) {
    case 'name':
      return validateName(value);
    case 'email':
      return validateEmail(value);
    case 'phone':
      return validatePhone(value);
    default:
      return '';
  }
};

export const validateForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateContactForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
