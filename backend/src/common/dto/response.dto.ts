import { ApiProperty } from '@nestjs/swagger';

// Response Structure
export class BaseResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Human-readable message about the operation',
    example: 'Operation completed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path that was called',
    example: '/auth/register',
  })
  path: string;
}

// Response with data
export class SuccessResponseDto<T = any> extends BaseResponseDto {
  @ApiProperty({
    description: 'The actual data returned by the operation',
    example: { id: 'uuid', name: 'Yash Gupta' },
  })
  data: T;
}

// Error response structure
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: false,
  })
  success: false;

  @ApiProperty({
    description: 'Human-readable message about the operation',
    example: 'Operation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Error code for the type of error',
    example: 'BAD_REQUEST',
  })
  error: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp when the response was generated',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'API endpoint path that was called',
    example: '/auth/register',
  })
  path: string;

  @ApiProperty({
    description: 'Additional error details (optional)',
    example: { field: 'email', issue: 'already exists' },
    required: false,
  })
  details?: any;
}
