import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '../common/entities';
import { MESSAGES, APP_CONSTANTS } from '../common';
import { ResponseBuilder } from '../common/interfaces';
import { RegisterDto, LoginDto } from '../common';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Registers a new user and returns auth response
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException(MESSAGES.ERROR.USER_ALREADY_EXISTS);
      }

      const user = this.userRepository.create({
        ...registerDto,
        role: registerDto.role || UserRole.USER,
      });

      const savedUser = await this.userRepository.save(user);
      const accessToken = this.generateToken(savedUser);

      return {
        user: this.sanitizeUser(savedUser),
        accessToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  // Authenticates user login and returns auth response
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new NotFoundException(MESSAGES.ERROR.USER_NOT_FOUND);
      }

      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      const isPasswordValid = await user.validatePassword(loginDto.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException(MESSAGES.ERROR.INVALID_CREDENTIALS);
      }

      const accessToken = this.generateToken(user);

      return {
        user: this.sanitizeUser(user),
        accessToken,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

  // Finds a user by ID
  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to find user');
    }
  }

  // Finds a user by email
  async findByEmail(email: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException(MESSAGES.ERROR.USER_NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to find user');
    }
  }

  // Finds a user by ID (alias for findById)
  async findUserById(id: string): Promise<User> {
    return this.findById(id);
  }

  // Updates user photo
  async updateUserPhoto(userId: string, photoUrl: string | null): Promise<User> {
    try {
      const user = await this.findById(userId);
      user.photo = photoUrl;
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user photo');
    }
  }

  // Updates user profile information
  async updateUserProfile(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(userId);
      
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.email !== undefined) user.email = updateData.email;
      if (updateData.phone !== undefined) user.phone = updateData.phone;
      if (updateData.photo !== undefined) user.photo = updateData.photo;
      
      return await this.userRepository.save(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user profile');
    }
  }

  // Generates JWT token for user
  private generateToken(user: User): string {
    try {
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      return this.jwtService.sign(payload, {
        expiresIn: APP_CONSTANTS.JWT.EXPIRES_IN,
      });
    } catch (error) {
      throw new BadRequestException('Failed to generate authentication token');
    }
  }

  // Removes password from user object
  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
