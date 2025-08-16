import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Contact } from '../common/entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../common/dto/contact.dto';
import { UserRole } from '../common/entities/user.entity';

export interface ContactPaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedContactsResponse {
  contacts: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async createContact(createContactDto: CreateContactDto, userId: string, targetUserId?: string): Promise<Contact> {
    const contactUserId = targetUserId || userId;
    const contact = this.contactRepository.create({
      ...createContactDto,
      userId: contactUserId,
    });
    return await this.contactRepository.save(contact);
  }

  async findAllContacts(
    userId: string,
    options: ContactPaginationOptions,
    targetUserId?: string,
  ): Promise<PaginatedContactsResponse> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    const queryUserId = targetUserId || userId;
    let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.userId = :userId', { userId: queryUserId });

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const allowedSortFields = ['name', 'email', 'phone', 'createdAt', 'updatedAt'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder = queryBuilder.orderBy(`contact.${sortBy}`, sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();

    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    const contacts = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }

  async findContactById(id: string, userId: string, targetUserId?: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, userId: targetUserId || userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  async updateContact(
    id: string,
    updateContactDto: UpdateContactDto,
    userId: string,
    targetUserId?: string,
  ): Promise<Contact> {
    const contact = await this.findContactById(id, userId, targetUserId);
    
    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  async deleteContact(id: string, userId: string, targetUserId?: string): Promise<void> {
    const contact = await this.findContactById(id, userId, targetUserId);
    await this.contactRepository.remove(contact);
  }

  // admin can see all contacts across users
  async findAllContactsForAdmin(
    options: ContactPaginationOptions,
  ): Promise<PaginatedContactsResponse> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email']);

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search OR user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const allowedSortFields = ['name', 'email', 'phone', 'createdAt', 'updatedAt'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder = queryBuilder.orderBy(`contact.${sortBy}`, sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();

    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    const contacts = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
  }
}
