import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards';
import { AdminGuard } from '../auth/guards';
import { UsersService } from './users.service';
import { CreateUserDto, UserPaginationOptions } from '../common/dto/user.dto';
import { ErrorResponseDto } from '../common/dto/response.dto';
import { ResponseBuilder } from '../common/interfaces';
import { MESSAGES } from '../common/constants';

@ApiTags('Users Management (Admin Only)')
@Controller('users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User created successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                photo: { type: 'string', example: 'https://example.com/photo.jpg' },
                role: { type: 'string', example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/users' },
      },
    },
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
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - user with email already exists',
    type: ErrorResponseDto,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.createUser(createUserDto);
      return ResponseBuilder.success(
        { user },
        MESSAGES.SUCCESS.USER_CREATED || 'User created successfully',
        '/users',
      );
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, or phone' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (name, email, phone, role, isActive, createdAt, updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)' })
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
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-here' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  photo: { type: 'string', example: 'https://example.com/photo.jpg' },
                  role: { type: 'string', example: 'user' },
                  isActive: { type: 'boolean', example: true },
                  createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                  updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 50 },
                totalPages: { type: 'number', example: 5 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/users' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
    type: ErrorResponseDto,
  })
  async getAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    try {
      const options: UserPaginationOptions = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        sortBy,
        sortOrder,
      };

      const result = await this.usersService.findAllUsers(options);
      return ResponseBuilder.success(
        result,
        MESSAGES.SUCCESS.USERS_RETRIEVED || 'Users retrieved successfully',
        '/users',
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific user by ID (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'User retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                photo: { type: 'string', example: 'https://example.com/photo.jpg' },
                role: { type: 'string', example: 'user' },
                isActive: { type: 'boolean', example: true },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/users/uuid-here' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
    type: ErrorResponseDto,
  })
  async getUserById(@Param('id') id: string) {
    try {
      const user = await this.usersService.findUserById(id);
      return ResponseBuilder.success(
        { user },
        MESSAGES.SUCCESS.USER_RETRIEVED || 'User retrieved successfully',
        `/users/${id}`,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - user has existing contacts',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required',
    type: ErrorResponseDto,
  })
  async deleteUser(@Param('id') id: string) {
    try {
      await this.usersService.deleteUser(id);
      return ResponseBuilder.success(
        null,
        MESSAGES.SUCCESS.USER_DELETED || 'User deleted successfully',
        `/users/${id}`,
      );
    } catch (error) {
      throw error;
    }
  }
}
