import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsUUID } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Name cannot exceed 100 characters' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Address cannot exceed 500 characters' })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Company cannot exceed 100 characters' })
  company?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Position cannot exceed 100 characters' })
  position?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Photo URL cannot exceed 500 characters' })
  photo?: string;
}

export class UpdateContactDto extends CreateContactDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}

export class ContactQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
