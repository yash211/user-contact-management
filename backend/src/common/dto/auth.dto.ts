import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';
import { MESSAGES, APP_CONSTANTS } from '../constants';

export class RegisterDto {
  @ApiProperty({
    description: 'User full name',
    example: 'Yash Gupta',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(APP_CONSTANTS.USER.MIN_NAME_LENGTH, { message: MESSAGES.VALIDATION.NAME_MIN_LENGTH })
  @MaxLength(APP_CONSTANTS.USER.MAX_NAME_LENGTH)
  name: string;

  @ApiProperty({
    description: 'User email address',
    example: 'Yash@gmail.com',
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
    description: 'User role (optional, defaults to user)',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'Yash@gmail.com',
  })
  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_FORMAT })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'User information (without password)',
    example: {
      id: 'uuid-here',
      name: 'Yash Doe',
      email: 'Yash@gmail.com',
      role: 'user',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  })
  user: any;

  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  accessToken: string;
}
