import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { MESSAGES, APP_CONSTANTS } from '../constants';

export class CreateUserDto {
  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(APP_CONSTANTS.USER.MIN_NAME_LENGTH, { message: MESSAGES.VALIDATION.NAME_MIN_LENGTH })
  @MaxLength(APP_CONSTANTS.USER.MAX_NAME_LENGTH)
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_FORMAT })
  email: string;

  @ApiProperty({
    description: 'User phone number (optional)',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH, { message: MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH })
  password: string;

  @ApiProperty({
    description: 'User profile photo URL (optional)',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    description: 'Whether the user is active',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}



export interface UserPaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsersResponse {
  users: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
