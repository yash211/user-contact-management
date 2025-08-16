import { Controller, Post, Get, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto, UserRole, API_TAGS, AuthResponseDto, API_ROUTES } from '../common';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles } from './decorators';

@ApiTags(API_TAGS.AUTH)
@Controller(API_ROUTES.AUTH.BASE)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(API_ROUTES.AUTH.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - user already exists' 
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body(ValidationPipe) registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      // Let NestJS handle the error response
      throw error;
    }
  }

  @Post(API_ROUTES.AUTH.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid credentials' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - user does not exist' 
  })
  @ApiBody({ type: LoginDto })
  async login(@Body(ValidationPipe) loginDto: LoginDto): Promise<AuthResponse> {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      // Let NestJS handle the error response
      throw error;
    }
  }

  @Get(API_ROUTES.AUTH.PROFILE)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
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

  @Get(API_ROUTES.AUTH.ADMIN_USERS)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions' 
  })
  async getAllUsers() {
    try {
      return { message: 'Admin access - All users would be returned here' };
    } catch (error) {
      throw error;
    }
  }
}
