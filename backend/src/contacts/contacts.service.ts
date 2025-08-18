import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Contact } from '../common/entities/contact.entity';
import { CreateContactDto, UpdateContactDto } from '../common/dto/contact.dto';
import { UserRole } from '../common/entities/user.entity';
import { transformContactPhoto, transformContactsPhotos } from '../common/utils/photo.utils';
import { EmailService } from '../email/email.service';

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
    private readonly emailService: EmailService,
  ) {}

  // Creates a new contact and sends email notification
  async createContact(createContactDto: CreateContactDto, userId: string, targetUserId?: string, userEmail?: string, userName?: string): Promise<Contact> {
    const contactUserId = targetUserId || userId;
    
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
    
    if (userEmail && userName) {
      try {
        await this.emailService.sendContactCreatedEmail(savedContact, userEmail, userName);
      } catch (error) {
        console.error('Failed to send contact creation email:', error);
      }
    }
    
    return savedContact;
  }

  // Retrieves paginated contacts with search and sorting
  async findAllContacts(
    userId: string,
    options: ContactPaginationOptions,
    targetUserId?: string,
  ): Promise<PaginatedContactsResponse> {
    try {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
      
      if (page < 1) throw new BadRequestException('Page must be greater than 0');
      if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

      const queryUserId = targetUserId || userId;
      let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
        .createQueryBuilder('contact')
        .leftJoinAndSelect('contact.user', 'user')
        .addSelect(['user.id', 'user.name', 'user.email'])
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
    } catch (error) {
      console.error('Error in findAllContacts:', error);
      throw error;
    }
  }

  // Finds a contact by ID for a specific user
  async findContactById(id: string, userId: string, targetUserId?: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, userId: targetUserId || userId },
    });

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    return contact;
  }

  // Updates a contact with new data
  async updateContact(
    id: string,
    updateContactDto: UpdateContactDto,
    userId: string,
    targetUserId?: string,
  ): Promise<Contact> {
    const contact = await this.findContactById(id, userId, targetUserId);
    
    if (updateContactDto.photo && 'buffer' in updateContactDto.photo) {
      contact.photo = updateContactDto.photo.buffer;
    }
    
    const updateData: Partial<Contact> = {};
    
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
    
    if (updateContactDto.photo && 'buffer' in updateContactDto.photo) {
      contact.photo = updateContactDto.photo.buffer;
      updateData.photo = updateContactDto.photo.buffer;
    }
    // If photo is undefined or null, don't include it in updateData at all
    
    console.log('Update Contact - Photo after field updates:', !!contact.photo);
    console.log('Update Contact - Fields being updated:', Object.keys(updateData));
    
    await this.contactRepository.update(contact.id, updateData);
    
    const savedContact = await this.findContactById(contact.id, userId, targetUserId);
    return savedContact;
  }

  // Deletes a contact by ID
  async deleteContact(id: string, userId: string, targetUserId?: string): Promise<void> {
    const contact = await this.findContactById(id, userId, targetUserId);
    await this.contactRepository.remove(contact);
  }

  // Retrieves all contacts for admin users across all users
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

  // Exports contacts to CSV format
  async exportContactsToCsv(userId: string, targetUserId?: string, options?: { search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC'; isAdmin?: boolean }): Promise<{ contacts: any[], headers: string[] }> {
    let queryBuilder: SelectQueryBuilder<Contact> = this.contactRepository
      .createQueryBuilder('contact');

    if (options?.isAdmin) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect('contact.user', 'user')
        .addSelect(['user.id', 'user.name', 'user.email']);
    }

    if (targetUserId) {
      queryBuilder = queryBuilder.where('contact.userId = :userId', { userId: targetUserId });
    } else {
      queryBuilder = queryBuilder.where('contact.userId = :userId', { userId });
    }

    if (options?.search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    if (options?.sortBy && options?.sortOrder) {
      queryBuilder = queryBuilder.orderBy(`contact.${options.sortBy}`, options.sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const contacts = await queryBuilder.getMany();

    const transformedContacts = contacts;

    const headers = options?.isAdmin ? ['Name', 'Email', 'Phone', 'User Associated With'] : ['Name', 'Email', 'Phone'];
    const records = transformedContacts.map(contact => {
      const record: any = {
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
      };
      
      if (options?.isAdmin) {
        record.user = contact.user?.name || 'N/A';
      }
      
      return record;
    });

    return { contacts: records, headers };
  }

  // Exports all contacts to CSV format for admin users
  async exportAllContactsToCsv(options?: { search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }): Promise<{ contacts: any[], headers: string[] }> {
    let queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.user', 'user')
      .addSelect(['user.id', 'user.name', 'user.email']);

    if (options?.search) {
      queryBuilder = queryBuilder.andWhere(
        '(contact.name ILIKE :search OR contact.email ILIKE :search OR contact.phone ILIKE :search)',
        { search: `%${options.search}%` }
      );
    }

    if (options?.sortBy && options?.sortOrder) {
      queryBuilder = queryBuilder.orderBy(`contact.${options.sortBy}`, options.sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('contact.createdAt', 'DESC');
    }

    const contacts = await queryBuilder.getMany();

    const transformedContacts = contacts;

    const headers = ['Name', 'Email', 'Phone', 'User Associated With'];
    const records = transformedContacts.map(contact => ({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      user: contact.user?.name || 'N/A',
    }));

    return { contacts: records, headers };
  }
}
