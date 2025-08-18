import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Contact } from '../common/entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../common/dto/contact.dto';
import { UserRole } from '../common/entities/user.entity';
import { transformContactPhoto, transformContactsPhotos } from '../common/utils/photo.utils';

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
    
    // Convert photo file to buffer if provided
    const photoData = createContactDto.photo && 'buffer' in createContactDto.photo 
      ? createContactDto.photo.buffer 
      : null;
    
    const contact = this.contactRepository.create({
      name: createContactDto.name,
      email: createContactDto.email,
      phone: createContactDto.phone,
      photo: photoData,
      userId: contactUserId,
    });
    
    const savedContact = await this.contactRepository.save(contact);
    return transformContactPhoto(savedContact);
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

    // Transform photo data for API response
    const transformedContacts = transformContactsPhotos(contacts);

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      contacts: transformedContacts,
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

    return transformContactPhoto(contact);
  }

  async updateContact(
    id: string,
    updateContactDto: UpdateContactDto,
    userId: string,
    targetUserId?: string,
  ): Promise<Contact> {
    const contact = await this.findContactById(id, userId, targetUserId);
    
    console.log('Update Contact - Existing photo before update:', !!contact.photo);
    console.log('Update Contact - DTO photo provided:', !!updateContactDto.photo);
    console.log('Update Contact - DTO photo type:', typeof updateContactDto.photo);
    console.log('Update Contact - DTO photo starts with data:image:', updateContactDto.photo && typeof updateContactDto.photo === 'string' ? (updateContactDto.photo as string).startsWith('data:image/') : 'N/A');
    
    // Convert photo file to buffer if provided, otherwise preserve existing photo
    if (updateContactDto.photo && 'buffer' in updateContactDto.photo) {
      // New photo file uploaded
      contact.photo = updateContactDto.photo.buffer;
      console.log('Update Contact - New photo set');
    } else if (updateContactDto.photo && typeof updateContactDto.photo === 'string' && (updateContactDto.photo as string).startsWith('data:image/')) {
      // Existing photo data sent from frontend - preserve it
      console.log('Update Contact - Existing photo data received, preserving');
      // Don't change contact.photo - keep the existing buffer
    } else if (updateContactDto.photo === undefined || updateContactDto.photo === null) {
      console.log('Update Contact - No photo provided, preserving existing photo');
      // Explicitly don't change contact.photo - keep the existing buffer
    } else {
      console.log('Update Contact - Unexpected photo type, preserving existing photo');
      console.log('Update Contact - Photo data type:', typeof updateContactDto.photo);
      // Don't change contact.photo - keep the existing buffer
    }
    
    // Create an update object with only the fields that should be updated
    const updateData: Partial<Contact> = {};
    
    // Update other fields only if provided
    if (updateContactDto.name !== undefined) {
      contact.name = updateContactDto.name;
      updateData.name = updateContactDto.name;
    }
    if (updateContactDto.email !== undefined) {
      contact.email = updateContactDto.email;
      updateData.email = updateContactDto.email;
    }
    if (updateContactDto.phone !== undefined) {
      contact.phone = updateContactDto.phone;
      updateData.phone = updateContactDto.phone;
    }
    
    // Only update photo if a new one was provided (not undefined, not null)
    if (updateContactDto.photo && 'buffer' in updateContactDto.photo) {
      contact.photo = updateContactDto.photo.buffer;
      updateData.photo = updateContactDto.photo.buffer;
    }
    // If photo is undefined or null, don't include it in updateData at all
    
    console.log('Update Contact - Photo after field updates:', !!contact.photo);
    console.log('Update Contact - Fields being updated:', Object.keys(updateData));
    
    // Use update instead of save to avoid updating fields we don't want to change
    await this.contactRepository.update(contact.id, updateData);
    
    // Return the updated contact
    const savedContact = await this.findContactById(contact.id, userId, targetUserId);
    console.log('Update Contact - Photo after save:', !!savedContact.photo);
    
    return transformContactPhoto(savedContact);
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

  async exportContactsToCsv(userId: string, targetUserId?: string, options?: { search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): Promise<{ contacts: any[], headers: string[] }> {
    let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email']);

    if (targetUserId) {
      queryBuilder = queryBuilder.where('contact.userId = :userId', { userId: targetUserId });
    } else {
      queryBuilder = queryBuilder.where('contact.userId = :userId', { userId });
    }

    // Apply search filter
    if (options?.search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    // Apply sorting
    if (options?.sortBy && options?.sortOrder) {
      queryBuilder = queryBuilder.orderBy(`contact.${options.sortBy}`, options.sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const contacts = await queryBuilder.getMany();

    const headers = ['Name', 'Email', 'Phone'];
    const records = contacts.map(contact => ({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
    }));

    return { contacts: records, headers };
  }

  async exportAllContactsToCsv(options?: { search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): Promise<{ contacts: any[], headers: string[] }> {
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email']);

    // Apply search filter
    if (options?.search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    // Apply sorting
    if (options?.sortBy && options?.sortOrder) {
      queryBuilder = queryBuilder.orderBy(`contact.${options.sortBy}`, options.sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const contacts = await queryBuilder.getMany();

    const headers = ['Name', 'Email', 'Phone'];
    const records = contacts.map(contact => ({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
    }));

    return { contacts: records, headers };
  }
}
