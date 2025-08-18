# Email Setup Guide

This guide will help you configure email functionality for the Contact Management System.

## Email Configuration

To enable email notifications when contacts are created, you need to set up SMTP configuration in your `.env` file.

### 1. Create .env file

Create a `.env` file in the backend directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=contact_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 2. Gmail Setup (Recommended)

If using Gmail, follow these steps:

1. **Enable 2-Factor Authentication** on your Google account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

### 3. Alternative Email Providers

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASS=your_password
```

#### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASS=your_app_password
```

#### Custom SMTP Server:
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password
```

## Email Features

### Contact Creation Email
When a user creates a new contact, they will receive a simple text email notification containing:
- Contact name, email, and phone number
- Creation timestamp
- Basic confirmation message

## Testing Email Configuration

1. Start the backend server
2. Create a new contact through the API
3. Check the user's email for the notification
4. Check server logs for email status

## Troubleshooting

### Common Issues:

1. **Authentication Failed**: Check your SMTP credentials
2. **Connection Timeout**: Verify SMTP host and port
3. **Gmail Issues**: Ensure 2FA is enabled and app password is used
4. **Email Not Received**: Check spam folder

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords for Gmail
- Consider using environment-specific configurations for production
