import { Controller, Post, Get, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto, UserRole } from '../common';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles } from './decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // Let NestJS handle the error response
      throw error;
    }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponse> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      // Let NestJS handle the error response
      throw error;
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    try {
      if (!req.user) {
        throw new BadRequestException('User not found in request');
      }
      return { user: req.user };
    } catch (error) {
      throw error;
    }
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAllUsers() {
    try {
      return { message: 'Admin access - All users would be returned here' };
    } catch (error) {
      throw error;
    }
  }
}
