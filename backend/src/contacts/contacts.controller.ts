import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ContactsService, ContactPaginationOptions } from './contacts.service';
import {
  CreateContactDto,
  ContactPaginationDto,
} from '../common/dto/contact.dto';
import { JwtAuthGuard } from '../auth/guards';
import { API_TAGS, API_ROUTES, ResponseBuilder, MESSAGES } from '../common';
import { SuccessResponseDto, ErrorResponseDto } from '../common/dto/response.dto';

@ApiTags(API_TAGS.CONTACTS)
@Controller(API_ROUTES.CONTACTS.BASE)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post(API_ROUTES.CONTACTS.CREATE)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contact' })
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
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
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
  ) {
    try {
      const contact = await this.contactsService.createContact(
        createContactDto,
        req.user.id,
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
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
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
    @Request() req?,
  ) {
    try {
      const options: ContactPaginationOptions = {
        page: paginationDto.page || 1,
        limit: paginationDto.limit || 10,
        search,
        sortBy: paginationDto.sortBy || 'createdAt',
        sortOrder: paginationDto.sortOrder || 'DESC',
      };

      const result = await this.contactsService.findAllContacts(req.user.id, options);
      return ResponseBuilder.success(
        result,
        MESSAGES.SUCCESS.CONTACTS_RETRIEVED || 'Contacts retrieved successfully',
        API_ROUTES.CONTACTS.GET_ALL,
      );
    } catch (error) {
      throw error;
    }
  }








}
