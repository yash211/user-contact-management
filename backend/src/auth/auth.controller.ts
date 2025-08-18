import { Controller, Post, Get, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Request, BadRequestException, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto, API_TAGS, API_ROUTES, MESSAGES } from '../common';
import { UserRole } from '../common/entities';
import { ResponseBuilder } from '../common/interfaces';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles } from './decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';

@ApiTags(API_TAGS.AUTH)
@Controller(API_ROUTES.AUTH.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post(API_ROUTES.AUTH.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yash Gupta' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
        phone: { type: 'string', example: '+1234567890' },
        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
      },
      required: ['name', 'email', 'password'],
    },
  })
  @ApiResponse({ 
    status: 201, 
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User registered successfully' },
                    data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'uuid-here' },
                    name: { type: 'string', example: 'Yash Gupta' },
                    email: { type: 'string', example: 'john@example.com' },
                    role: { type: 'string', example: 'user' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                    updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
                  }
                },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/register' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - user already exists',
    type: ErrorResponseDto
  })
  async register(
    @Body(ValidationPipe) registerDto: RegisterDto,
  ) {
    try {
      const result = await this.authService.register(registerDto);
      return ResponseBuilder.success(
        result,
        MESSAGES.SUCCESS.USER_REGISTERED,
        API_ROUTES.AUTH.REGISTER
      );
    } catch (error) {
      throw error;
    }
  }

  @Post(API_ROUTES.AUTH.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User logged in successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Doe' },
                email: { type: 'string', example: 'Yash@gmail.com' },
                role: { type: 'string', example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
              }
            },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/login' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid credentials',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Not found - user does not exist',
    type: ErrorResponseDto
  })
  @ApiBody({ type: LoginDto })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return ResponseBuilder.success(
        result,
        MESSAGES.SUCCESS.USER_LOGGED_IN,
        API_ROUTES.AUTH.LOGIN
      );
    } catch (error) {
      throw error;
    }
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User logged out successfully' },
        data: { type: 'object' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/logout' }
      }
    }
  })
  async logout() {
    try {
      // For JWT-based auth, logout is handled client-side by removing the token
      // This endpoint can be used for additional cleanup if needed
      return ResponseBuilder.success(
        {},
        'User logged out successfully',
        '/auth/logout'
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(API_ROUTES.AUTH.PROFILE)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Doe' },
                email: { type: 'string', example: 'Yash@gmail.com' },
                role: { type: 'string', example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
              }
            }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/profile' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto
  })
  async getProfile(@Request() req) {
    try {
      if (!req.user) {
        throw new BadRequestException('User not found in request');
      }
      return ResponseBuilder.success(
        { user: req.user },
        'Profile retrieved successfully',
        API_ROUTES.AUTH.PROFILE
      );
    } catch (error) {
      throw error;
    }
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yash Gupta' },
        email: { type: 'string', example: 'john@example.com' },
        phone: { type: 'string', example: '+1234567890' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Profile updated successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Gupta' },
                email: { type: 'string', example: 'john@example.com' },
                role: { type: 'string', example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
              }
            }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/profile' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  async updateProfile(
    @Body(ValidationPipe) updateProfileDto: any,
    @Request() req?,
  ) {
    try {
      // Update user profile
      const updatedUser = await this.authService.updateUserProfile(req.user.id, updateProfileDto);
      
      return ResponseBuilder.success(
        { user: updatedUser },
        'Profile updated successfully',
        '/auth/profile'
      );
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
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Users retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Admin access - All users would be returned here' }
          }
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/auth/admin/users' }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - insufficient permissions',
    type: ErrorResponseDto
  })
  async getAllUsers() {
    try {
      return ResponseBuilder.success(
        { message: 'Admin access - All users would be returned here' },
        'Users retrieved successfully',
        API_ROUTES.AUTH.ADMIN_USERS
      );
    } catch (error) {
      throw error;
    }
  }
}
