import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Contact } from '../common/entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../common/dto/contact.dto';

// pagination options interface
export interface ContactPaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// pagination response interface
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

  // create new contact
  async createContact(createContactDto: CreateContactDto, userId: string): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      userId,
    });
    return await this.contactRepository.save(contact);
  }

  // get all contacts with pagination, search, and sorting
  async findAllContacts(
    userId: string,
    options: ContactPaginationOptions,
  ): Promise<PaginatedContactsResponse> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    
    // validate pagination parameters
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    // build query
    let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.userId = :userId', { userId });

    // add search if provided
    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // add sorting
    const allowedSortFields = ['name', 'email', 'phone', 'createdAt', 'updatedAt'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder = queryBuilder.orderBy(`contact.${sortBy}`, sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    // get total count
    const total = await queryBuilder.getCount();

    // apply pagination
    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    // execute query
    const contacts = await queryBuilder.getMany();

    // calculate pagination metadata
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

  // find contact by ID and ensure ownership
  async findContactById(id: string, userId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  // update contact
  async updateContact(
    id: string,
    updateContactDto: UpdateContactDto,
    userId: string,
  ): Promise<Contact> {
    const contact = await this.findContactById(id, userId);
    
    Object.assign(contact, updateContactDto);
    return await this.contactRepository.save(contact);
  }

  // delete contact permanently
  async deleteContact(id: string, userId: string): Promise<void> {
    const contact = await this.findContactById(id, userId);
    await this.contactRepository.remove(contact);
  }
}
