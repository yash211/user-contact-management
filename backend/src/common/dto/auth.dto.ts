import { IsString, IsEmail, IsOptional, IsEnum, MinLength, MaxLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';
import { MESSAGES, APP_CONSTANTS } from '../constants';

export class RegisterDto {
  @IsString()
  @MinLength(APP_CONSTANTS.USER.MIN_NAME_LENGTH, { message: MESSAGES.VALIDATION.NAME_MIN_LENGTH })
  @MaxLength(APP_CONSTANTS.USER.MAX_NAME_LENGTH)
  name: string;

  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_FORMAT })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  @MinLength(APP_CONSTANTS.PASSWORD.MIN_LENGTH, { message: MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH })
  password: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class LoginDto {
  @IsEmail({}, { message: MESSAGES.VALIDATION.EMAIL_FORMAT })
  email: string;

  @IsString()
  password: string;
}
