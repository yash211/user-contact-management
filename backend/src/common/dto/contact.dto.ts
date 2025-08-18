import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsUUID, IsInt, Min, Max, IsIn, Matches, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContactDto {
  @ApiProperty({
    description: 'Contact name (required)',
    example: 'Yash Gupta',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  name: string;

  @ApiProperty({
    description: 'Email address (required)',
    example: 'john@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Please provide a valid email address format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email: string;

  @ApiProperty({
    description: 'Phone number (required)',
    example: '+1234567890',
    maxLength: 20,
  })
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @Matches(/^[\+]?[\d\s\-\(\)]{7,20}$/, { message: 'Please provide a valid phone number' })
  phone: string;

  @ApiProperty({
    description: 'Contact photo file (optional)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  photo?: Express.Multer.File;
}

export class UpdateContactDto {
  @ApiProperty({
    description: 'Contact name (optional for updates)',
    example: 'Yash Gupta',
    minLength: 2,
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Name can only contain letters and spaces' })
  name?: string;

  @ApiProperty({
    description: 'Email address (optional for updates)',
    example: 'john@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Please provide a valid email address format' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  email?: string;

  @ApiProperty({
    description: 'Phone number (optional for updates)',
    example: '+1234567890',
    maxLength: 20,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @Matches(/^[\+]?[\d\s\-\(\)]{7,20}$/, { message: 'Please provide a valid phone number' })
  phone?: string;

  @ApiProperty({
    description: 'Contact photo file (optional)',
    type: 'string',
    format: 'binary',
    required: false,
  })
  @IsOptional()
  photo?: Express.Multer.File;
}

export class ContactQueryDto {
  @ApiProperty({
    description: 'Search term for name, email, or phone',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class ContactPaginationDto {
  @ApiProperty({
    description: 'Page number (default: 1)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Page must be greater than 0' })
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: 'Limit must be greater than 0' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'createdAt',
    enum: ['name', 'email', 'phone', 'createdAt', 'updatedAt'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'email', 'phone', 'createdAt', 'updatedAt'], { 
    message: 'Sort field must be one of: name, email, phone, createdAt, updatedAt' 
  })
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'], { message: 'Sort order must be either ASC or DESC' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
