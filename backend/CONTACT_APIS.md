# Contact APIs Documentation

This document describes the Contact APIs for the User Contact Management system.

## Authentication

All contact APIs require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### 1. Create Contact
- **POST** `/contacts`
- **Description**: Create a new contact for the authenticated user
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "photo": "https://example.com/photo.jpg"
  }
  ```
- **Required Fields**: `name`
- **Optional Fields**: `email`, `phone`, `photo`

### 2. Get All Contacts
- **GET** `/contacts`
- **Description**: Retrieve all contacts for the authenticated user with pagination, search, and sorting
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `search` (optional): Search term for name, email, or phone
  - `sortBy` (optional): Sort field (name, email, phone, createdAt, updatedAt)
  - `sortOrder` (optional): Sort order (ASC or DESC)

**Example**: `GET /contacts?page=1&limit=20&search=john&sortBy=name&sortOrder=ASC`

## Response Format

All APIs return responses in the following format:

```json
{
  "success": true,
  "message": "Operation message",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

### Pagination Response

For endpoints that return paginated results:

```json
{
  "success": true,
  "message": "Contacts retrieved successfully",
  "data": {
    "contacts": [
      {
        "id": "uuid-here",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "photo": "https://example.com/photo.jpg",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/contacts"
}
```

## Error Responses

Error responses follow the same format with `success: false`:

```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

## Common HTTP Status Codes

- **200**: Success
- **201**: Created
- **204**: No Content (for delete operations)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (missing or invalid token)
- **404**: Not Found (contact doesn't exist)
- **500**: Internal Server Error

## Features

- **Create Contacts**: Add new contacts with simplified fields (name, email, phone, photo)
- **Retrieve Contacts**: Get all user's contacts with pagination, search, and sorting
- **Pagination**: Efficiently handle large numbers of contacts
- **Search**: Full-text search across name, email, and phone fields
- **Sorting**: Sort by any field in ascending or descending order
- **User Isolation**: Users can only access their own contacts
- **Validation**: Comprehensive input validation with meaningful error messages
- **Swagger Documentation**: Full API documentation available at `/api` endpoint

## Database Schema

The Contact entity includes:
- `id`: Unique UUID identifier
- `name`: Contact name (required)
- `email`: Email address (optional)
- `phone`: Phone number (optional)
- `photo`: Photo URL (optional)
- `userId`: Foreign key to User entity
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Migration

The contacts table is created using the migration file `1755371193852-CreateContactsTable.ts` which:
- Creates the contacts table with the required fields
- Sets up proper data types and constraints
- Establishes the relationship with the users table
