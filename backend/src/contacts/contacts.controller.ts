import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContactsService, ContactPaginationOptions } from './contacts.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactPaginationDto,
} from '../common/dto/contact.dto';
import { JwtAuthGuard } from '../auth/guards';
import { API_TAGS, API_ROUTES, MESSAGES } from '../common';
import { UserRole } from '../common/entities';
import { ResponseBuilder } from '../common/interfaces';
import { FileUploadService } from '../common/file-upload';
import type { UploadedFile as UploadedFileType } from '../common/file-upload';
import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';

@ApiTags(API_TAGS.CONTACTS)
@Controller(API_ROUTES.CONTACTS.BASE)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post(API_ROUTES.CONTACTS.CREATE)
  @UseInterceptors(FileInterceptor('photo', { storage: undefined }))
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact with optional photo' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
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
          description: 'Contact photo file (JPEG, PNG, GIF, WebP)',
        },
      },
      required: ['name'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Contact created successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contact created successfully' },
        data: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Gupta' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                photo: { type: 'string', example: '/uploads/contacts/filename.jpg' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/contacts' },
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
  async createContact(
    @Body(ValidationPipe) createContactDto: CreateContactDto,
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
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can create contacts for other users');
      }
      
      const contactUserId = targetUserId || req.user.id;
      
      let photoUrl: string | undefined = undefined;
      
      if (photo) {
        this.fileUploadService.validateFile(photo);
        
        const storageConfig = this.fileUploadService.getStorageConfig('contacts');
        const multer = require('multer');
        const upload = multer(storageConfig);
        
        const processedFile = await new Promise<UploadedFileType>((resolve, reject) => {
          upload.single('photo')(req, {}, (err) => {
            if (err) reject(err);
            else resolve(req.file);
          });
        });

        photoUrl = this.fileUploadService.getFileUrl(processedFile.filename, 'contacts');
      }
      
      const contact = await this.contactsService.createContact(
        { ...createContactDto, photo: photoUrl },
        req.user.id,
        contactUserId,
      );
      
      return ResponseBuilder.success(
        { contact },
        MESSAGES.SUCCESS.CONTACT_CREATED || 'Contact created successfully',
        API_ROUTES.CONTACTS.CREATE,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(API_ROUTES.CONTACTS.GET_ALL)
  @ApiOperation({ summary: 'Get all contacts with pagination, search, and sorting' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, or phone' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (name, email, phone, createdAt, updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contacts retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-here' },
                  name: { type: 'string', example: 'Yash Gupta' },
                  email: { type: 'string', example: 'Yash@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  photo: { type: 'string', example: 'https://example.com/photo.jpg' },
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
                total: { type: 'number', example: 25 },
                totalPages: { type: 'number', example: 3 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/contacts' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid pagination parameters',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  async getAllContacts(
    @Query(ValidationPipe) paginationDto: ContactPaginationDto,
    @Query('search') search?: string,
    @Query('userId') targetUserId?: string,
    @Request() req?,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      // only admin can access other users' contacts
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can access other users\' contacts');
      }
      
      const options: ContactPaginationOptions = {
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search,
        sortBy: paginationDto.sortBy || 'createdAt',
        sortOrder: paginationDto.sortOrder || 'DESC',
      };

      let result;

      if (isAdmin && !targetUserId) {
        result = await this.contactsService.findAllContactsForAdmin(options);
      } else {
        result = await this.contactsService.findAllContacts(req.user.id, options, targetUserId);
      }

      return ResponseBuilder.success(
        result,
        MESSAGES.SUCCESS.CONTACTS_RETRIEVED || 'Contacts retrieved successfully',
        API_ROUTES.CONTACTS.GET_ALL,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(API_ROUTES.CONTACTS.ADMIN_ALL)
  @ApiOperation({ summary: 'Get all contacts across all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 10, max: 100)' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, phone, or user info' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (name, email, phone, createdAt, updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)' })
  @ApiResponse({
    status: 200,
    description: 'All contacts retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'All contacts retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            contacts: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'uuid-here' },
                  name: { type: 'string', example: 'Yash Gupta' },
                  email: { type: 'string', example: 'Yash@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
                  photo: { type: 'string', example: 'https://example.com/photo.jpg' },
                  createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                  updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'user-uuid-here' },
                      name: { type: 'string', example: 'User Name' },
                      email: { type: 'string', example: 'user@example.com' },
                    },
                  },
                },
              },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 100 },
                totalPages: { type: 'number', example: 10 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/contacts/admin/all' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid pagination parameters',
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
  async getAllContactsForAdmin(
    @Query(ValidationPipe) paginationDto: ContactPaginationDto,
    @Query('search') search?: string,
    @Request() req?,
  ) {
    try {
      if (req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Admin access required');
      }

      const options: ContactPaginationOptions = {
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search,
        sortBy: paginationDto.sortBy || 'createdAt',
        sortOrder: paginationDto.sortOrder || 'DESC',
      };

      const result = await this.contactsService.findAllContactsForAdmin(options);
      return ResponseBuilder.success(
        result,
        'All contacts retrieved successfully',
        '/contacts/admin/all',
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(API_ROUTES.CONTACTS.GET_BY_ID)
  @ApiOperation({ summary: 'Get a specific contact by ID' })
  @ApiParam({ name: 'id', description: 'Contact ID (UUID)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Contact retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contact retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Gupta' },
                email: { type: 'string', example: 'Yash@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                photo: { type: 'string', example: 'https://example.com/photo.jpg' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/contacts/uuid-here' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  async getContactById(
    @Param('id') id: string, 
    @Request() req,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      // only admin can access other users' contacts
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can access other users\' contacts');
      }
      
      const contact = await this.contactsService.findContactById(id, req.user.id, targetUserId);
      return ResponseBuilder.success(
        { contact },
        MESSAGES.SUCCESS.CONTACT_RETRIEVED || 'Contact retrieved successfully',
        `${API_ROUTES.CONTACTS.BASE}/${id}`,
      );
    } catch (error) {
      throw error;
    }
  }

  @Put(API_ROUTES.CONTACTS.UPDATE)
  @UseInterceptors(FileInterceptor('photo', { storage: undefined }))
  @ApiOperation({ summary: 'Update a specific contact with optional photo' })
  @ApiParam({ name: 'id', description: 'Contact ID (UUID)' })
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
          description: 'Contact photo file (JPEG, PNG, GIF, WebP)',
        },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Contact updated successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Contact updated successfully' },
        data: {
          type: 'object',
          properties: {
            contact: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                name: { type: 'string', example: 'Yash Gupta' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                photo: { type: 'string', example: '/uploads/contacts/filename.jpg' },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
              },
            },
          },
        },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        path: { type: 'string', example: '/contacts/uuid-here' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  async updateContact(
    @Param('id') id: string,
    @Body(ValidationPipe) updateContactDto: UpdateContactDto,
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
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can update other users\' contacts');
      }

      let photoUrl: string | undefined = updateContactDto.photo;
      
      if (photo) {
        this.fileUploadService.validateFile(photo);
        
        // Delete old photo if exists
        const existingContact = await this.contactsService.findContactById(id, req.user.id, targetUserId);
        if (existingContact.photo) {
          const filename = existingContact.photo.split('/').pop();
          if (filename) {
            await this.fileUploadService.deleteFile(filename, 'contacts');
          }
        }
        
        const storageConfig = this.fileUploadService.getStorageConfig('contacts');
        const multer = require('multer');
        const upload = multer(storageConfig);
        
        const processedFile = await new Promise<UploadedFileType>((resolve, reject) => {
          upload.single('photo')(req, {}, (err) => {
            if (err) reject(err);
            else resolve(req.file);
          });
        });

        photoUrl = this.fileUploadService.getFileUrl(processedFile.filename, 'contacts');
      }
      
      const contact = await this.contactsService.updateContact(
        id,
        { ...updateContactDto, photo: photoUrl },
        req.user.id,
        targetUserId,
      );
      
      return ResponseBuilder.success(
        { contact },
        MESSAGES.SUCCESS.CONTACT_UPDATED || 'Contact updated successfully',
        `${API_ROUTES.CONTACTS.BASE}/${id}`,
      );
    } catch (error) {
      throw error;
    }
  }

  @Delete(API_ROUTES.CONTACTS.DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a specific contact' })
  @ApiParam({ name: 'id', description: 'Contact ID (UUID)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Contact deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  async deleteContact(
    @Param('id') id: string, 
    @Request() req,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      // only admin can delete other users' contacts
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can delete other users\' contacts');
      }
      
      await this.contactsService.deleteContact(id, req.user.id, targetUserId);
      return ResponseBuilder.success(
        null,
        MESSAGES.SUCCESS.CONTACT_DELETED || 'Contact deleted successfully',
        `${API_ROUTES.CONTACTS.BASE}/${id}`,
      );
    } catch (error) {
      throw error;
    }
  }

  @Get(API_ROUTES.CONTACTS.EXPORT_CSV)
  @ApiOperation({ summary: 'Export contacts to CSV format' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
  @ApiResponse({
    status: 200,
    description: 'CSV file generated successfully',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - admin access required for other users',
    type: ErrorResponseDto,
  })
  async exportContactsToCsv(
    @Request() req,
    @Res() res: Response,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can export other users\' contacts');
      }

      let filename: string;
      
      if (isAdmin && !targetUserId) {
        filename = await this.contactsService.exportAllContactsToCsv();
      } else {
        filename = await this.contactsService.exportContactsToCsv(req.user.id, targetUserId);
      }

      const filePath = `./uploads/exports/${filename}`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
      });
    } catch (error) {
      throw error;
    }
  }
}