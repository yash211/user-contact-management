import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../common/entities/user.entity';
import { Contact } from '../common/entities/contact.entity';
import { CreateUserDto, UserPaginationOptions, PaginatedUsersResponse } from '../common/dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  // Creates a new user with validation
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.name || createUserDto.name.trim().length === 0) {
      throw new BadRequestException('Name is required');
    }

    if (!createUserDto.email || createUserDto.email.trim().length === 0) {
      throw new BadRequestException('Email is required');
    }

    if (!createUserDto.password || createUserDto.password.length < 6) {
      throw new BadRequestException('Password is required and must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createUserDto.email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (createUserDto.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(createUserDto.phone)) {
        throw new BadRequestException('Invalid phone number format');
      }
    }

    if (createUserDto.role && !['user', 'admin'].includes(createUserDto.role)) {
      throw new BadRequestException('Role must be either "user" or "admin"');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email.toLowerCase().trim() }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData = {
      ...createUserDto,
      email: createUserDto.email.toLowerCase().trim(),
      name: createUserDto.name.trim(),
      phone: createUserDto.phone?.trim() || undefined,
      role: createUserDto.role || 'user',
      isActive: createUserDto.isActive !== undefined ? createUserDto.isActive : true
    };

    const user = this.userRepository.create(userData);
    const savedUser = await this.userRepository.save(user);
    
    const { password, ...userWithoutPassword } = savedUser;
    return userWithoutPassword as User;
  }

  // Retrieves paginated users with search and sorting
  async findAllUsers(options: UserPaginationOptions): Promise<PaginatedUsersResponse> {
    const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = options;
    
    if (page < 1) throw new BadRequestException('Page must be greater than 0');
    if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

    let queryBuilder: SelectQueryBuilder<User> = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.photo',
        'user.role',
        'user.isActive',
        'user.createdAt',
        'user.updatedAt'
      ]);

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const allowedSortFields = ['name', 'email', 'phone', 'role', 'isActive', 'createdAt', 'updatedAt'];
    if (allowedSortFields.includes(sortBy)) {
      queryBuilder = queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
    } else {
      queryBuilder = queryBuilder.orderBy('user.createdAt', 'DESC');
    }

    const total = await queryBuilder.getCount();

    const skip = (page - 1) * limit;
    queryBuilder = queryBuilder.skip(skip).take(limit);

    const users = await queryBuilder.getMany();

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      users,
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

  // Finds a user by ID excluding password
  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'photo',
        'role',
        'isActive',
        'createdAt',
        'updatedAt'
      ]
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }



  // Deletes a user if they have no contacts
  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    
    const contactCount = await this.contactRepository.count({
      where: { user: { id } }
    });

    if (contactCount > 0) {
      throw new BadRequestException('Cannot delete user with existing contacts. Please delete their contacts first.');
    }

    await this.userRepository.remove(user);
  }


}
