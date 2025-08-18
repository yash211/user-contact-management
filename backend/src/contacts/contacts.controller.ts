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
  BadRequestException,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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


import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';

@ApiTags(API_TAGS.CONTACTS)
@Controller(API_ROUTES.CONTACTS.BASE)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
  ) {}

  private validatePhotoFile(photo: Express.Multer.File): void {
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (photo.size > maxSize) {
      throw new BadRequestException('Photo file size cannot exceed 5MB');
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(photo.mimetype)) {
      throw new BadRequestException('Photo must be a valid image file (JPEG, PNG, GIF, or WebP)');
    }
  }

  @Post(API_ROUTES.CONTACTS.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Create a new contact with optional photo file' })
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
          description: 'Contact photo file (optional)',
        },
      },
      required: ['name', 'email', 'phone'],
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
    @Body() createContactDto: CreateContactDto,
    @UploadedFile() photo?: Express.Multer.File,
    @Request() req?,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can create contacts for other users');
      }
      
      const contactUserId = targetUserId || req.user.id;
      
      // Process the uploaded photo file if provided
      if (photo) {
        // Validate photo file
        this.validatePhotoFile(photo);
        createContactDto.photo = photo;
      }
      
      const contact = await this.contactsService.createContact(
        createContactDto,
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
    @Query() paginationDto: ContactPaginationDto,
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
        search: paginationDto.search,
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
    @Query() paginationDto: ContactPaginationDto,
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
  @UseInterceptors(FileInterceptor('photo'))
  @ApiOperation({ summary: 'Update an existing contact with optional photo file' })
  @ApiParam({ name: 'id', description: 'Contact ID (UUID)' })
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
          description: 'Contact photo file (optional)',
        },
      },
    },
  })
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
                photo: { type: 'string', example: 'data:image/jpeg;base64,...' },
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
    @Body() updateContactDto: UpdateContactDto,
    @UploadedFile() photo?: Express.Multer.File,
    @Request() req?,
    @Query('userId') targetUserId?: string,
  ) {
    // Manual validation for update operations
    if (updateContactDto.name !== undefined && updateContactDto.name !== null) {
      if (typeof updateContactDto.name !== 'string') {
        throw new BadRequestException('Name must be a string');
      }
      if (updateContactDto.name.trim().length < 2) {
        throw new BadRequestException('Name must be at least 2 characters long');
      }
      if (updateContactDto.name.trim().length > 100) {
        throw new BadRequestException('Name cannot exceed 100 characters');
      }
      if (!/^[a-zA-Z\s]+$/.test(updateContactDto.name.trim())) {
        throw new BadRequestException('Name can only contain letters and spaces');
      }
    }

    if (updateContactDto.email !== undefined && updateContactDto.email !== null) {
      if (typeof updateContactDto.email !== 'string') {
        throw new BadRequestException('Email must be a string');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateContactDto.email.trim())) {
        throw new BadRequestException('Please provide a valid email address format');
      }
      if (updateContactDto.email.length > 255) {
        throw new BadRequestException('Email cannot exceed 255 characters');
      }
    }

    if (updateContactDto.phone !== undefined && updateContactDto.phone !== null) {
      if (typeof updateContactDto.phone !== 'string') {
        throw new BadRequestException('Phone must be a string');
      }
      if (!/^[\+]?[\d\s\-\(\)]{7,20}$/.test(updateContactDto.phone.trim())) {
        throw new BadRequestException('Please provide a valid phone number');
      }
      if (updateContactDto.phone.length > 20) {
        throw new BadRequestException('Phone number cannot exceed 20 characters');
      }
    }
    try {
      console.log('Update Contact - Received DTO:', updateContactDto);
      console.log('Update Contact - Validation passed, proceeding with update');
      
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can update other users\' contacts');
      }

      // Process the uploaded photo file if provided
      if (photo) {
        // Validate photo file
        this.validatePhotoFile(photo);
        updateContactDto.photo = photo;
      } else {
        // Explicitly remove photo field if no file uploaded to avoid undefined
        delete updateContactDto.photo;
      }
      
      console.log('Update Contact - Processed DTO:', updateContactDto);
      
      const contact = await this.contactsService.updateContact(
        id,
        updateContactDto,
        req.user.id,
        targetUserId,
      );
      
      return ResponseBuilder.success(
        { contact },
        MESSAGES.SUCCESS.CONTACT_UPDATED || 'Contact updated successfully',
        `${API_ROUTES.CONTACTS.BASE}/${id}`,
      );
    } catch (error) {
      console.error('Update Contact - Error:', error);
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
  @ApiQuery({ name: 'search', required: false, description: 'Search term for name, email, or phone' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field (name, email, phone, createdAt, updatedAt)' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (ASC or DESC)' })
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
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can export other users\' contacts');
      }

      // Prepare export options
      const exportOptions = {
        search,
        sortBy,
        sortOrder,
        isAdmin,
      };

      let exportData;
      
      if (isAdmin && !targetUserId) {
        exportData = await this.contactsService.exportAllContactsToCsv(exportOptions);
      } else {
        exportData = await this.contactsService.exportContactsToCsv(req.user.id, targetUserId, exportOptions);
      }

      // Generate CSV content
      const csvContent = this.generateCsvContent(exportData.contacts, exportData.headers);
      
      // Set response headers
      const filename = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
      
      // Send CSV content directly
      return res.send(csvContent);
    } catch (error) {
      throw error;
    }
  }

  private generateCsvContent(contacts: any[], headers: string[]): string {
    // Create CSV header row
    const csvRows = [headers.join(',')];
    
    // Add data rows
    contacts.forEach(contact => {
      const row: string[] = [];
      
      // Add fields based on headers
      if (headers.includes('Name')) {
        row.push(`"${contact.name.replace(/"/g, '""')}"`);
      }
      if (headers.includes('Email')) {
        row.push(`"${(contact.email || '').replace(/"/g, '""')}"`);
      }
      if (headers.includes('Phone')) {
        row.push(`"${(contact.phone || '').replace(/"/g, '""')}"`);
      }
      if (headers.includes('User')) {
        row.push(`"${(contact.user || '').replace(/"/g, '""')}"`);
      }
      
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
}