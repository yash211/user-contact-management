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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactsService, ContactPaginationOptions } from './contacts.service';
import {
  CreateContactDto,
  UpdateContactDto,
  ContactPaginationDto,
} from '../common/dto/contact.dto';
import { JwtAuthGuard } from '../auth/guards';
import { API_TAGS, API_ROUTES, ResponseBuilder, MESSAGES } from '../common';
import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';
import { UserRole } from '../common/entities/user.entity';

@ApiTags(API_TAGS.CONTACTS)
@Controller(API_ROUTES.CONTACTS.BASE)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post(API_ROUTES.CONTACTS.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact' })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
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
  @ApiBody({ type: CreateContactDto })
  async createContact(
    @Body(ValidationPipe) createContactDto: CreateContactDto,
    @Request() req,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      // only admin can create contacts for other users
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can create contacts for other users');
      }
      
      const contactUserId = targetUserId || req.user.id;
      
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
  @ApiOperation({ summary: 'Update a specific contact' })
  @ApiParam({ name: 'id', description: 'Contact ID (UUID)' })
  @ApiBody({ type: UpdateContactDto })
  @ApiQuery({ name: 'userId', required: false, description: 'Target user ID (admin only)' })
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
    @Request() req,
    @Query('userId') targetUserId?: string,
  ) {
    try {
      const isAdmin = req.user.role === UserRole.ADMIN;
      
      // only admin can update other users' contacts
      if (targetUserId && !isAdmin) {
        throw new ForbiddenException('Only admins can update other users\' contacts');
      }
      
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
}
