import { Controller, Post, Get, Body, HttpCode, HttpStatus, ValidationPipe, UseGuards, Request, BadRequestException, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, Param, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiParam } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService, AuthResponse } from './auth.service';
import { RegisterDto, LoginDto, API_TAGS, API_ROUTES, MESSAGES } from '../common';
import { UserRole } from '../common/entities';
import { ResponseBuilder } from '../common/interfaces';
import { JwtAuthGuard, RolesGuard } from './guards';
import { Roles } from './decorators';
import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';
import { FileUploadService } from '../common/file-upload';
import type { UploadedFile as UploadedFileType } from '../common/file-upload';

@ApiTags(API_TAGS.AUTH)
@Controller(API_ROUTES.AUTH.BASE)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post(API_ROUTES.AUTH.REGISTER)
  @UseInterceptors(FileInterceptor('photo', { storage: undefined }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user with optional photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yash Gupta' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
        phone: { type: 'string', example: '+1234567890' },
        role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'User profile photo file (JPEG, PNG, GIF, WebP)',
        },
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
                photo: { type: 'string', example: '/uploads/users/filename.jpg' },
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
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    photo?: UploadedFileType,
  ) {
    try {
      let photoUrl: string | undefined = undefined;
      
      if (photo) {
        this.fileUploadService.validateFile(photo);
        
        const storageConfig = this.fileUploadService.getStorageConfig('users');
        const multer = require('multer');
        const upload = multer(storageConfig);
        
        const processedFile = await new Promise<UploadedFileType>((resolve, reject) => {
          upload.single('photo')({}, {}, (err) => {
            if (err) reject(err);
            else resolve(processedFile);
          });
        });

        photoUrl = this.fileUploadService.getFileUrl(processedFile.filename, 'users');
      }
      
      const result = await this.authService.register({ ...registerDto, photo: photoUrl });
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
  @UseInterceptors(FileInterceptor('photo', { storage: undefined }))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile with optional photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Yash Gupta' },
        email: { type: 'string', example: 'john@example.com' },
        phone: { type: 'string', example: '+1234567890' },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'User profile photo file (JPEG, PNG, GIF, WebP)',
        },
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
                photo: { type: 'string', example: '/uploads/users/filename.jpg' },
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
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: '.(jpg|jpeg|png|gif|webp)' }),
        ],
        fileIsRequired: false,
      }),
    )
    photo?: UploadedFileType,
    @Request() req?,
  ) {
    try {
      let photoUrl: string | undefined = updateProfileDto.photo;
      
      if (photo) {
        this.fileUploadService.validateFile(photo);
        
        // Delete old photo if exists
        const user = await this.authService.findUserById(req.user.id);
        if (user.photo) {
          const filename = user.photo.split('/').pop();
          if (filename) {
            await this.fileUploadService.deleteFile(filename, 'users');
          }
        }
        
        const storageConfig = this.fileUploadService.getStorageConfig('users');
        const multer = require('multer');
        const upload = multer(storageConfig);
        
        const processedFile = await new Promise<UploadedFileType>((resolve, reject) => {
          upload.single('photo')(req, {}, (err) => {
            if (err) reject(err);
            else resolve(req.file);
          });
        });

        photoUrl = this.fileUploadService.getFileUrl(processedFile.filename, 'users');
      }
      
      // Update user profile
      const updatedUser = await this.authService.updateUserProfile(req.user.id, { ...updateProfileDto, photo: photoUrl });
      
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
