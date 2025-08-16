import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, MESSAGES, APP_CONSTANTS, ResponseBuilder } from '../common';
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

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException(MESSAGES.ERROR.USER_ALREADY_EXISTS);
      }

      // Create and save user
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
      // Re-throw known exceptions
      if (error instanceof ConflictException) {
        throw error;
      }
      // Handle unexpected errors
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

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
      // Re-throw known exceptions
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      // Handle unexpected errors
      throw new BadRequestException('Login failed. Please try again.');
    }
  }

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

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
