import { ConflictException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) { }

  async signup(dto: SignupDto) {
    try {
      this.logger.log(`User signup attempt: ${dto.email}`);
      
      const hashed = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          password: hashed,
        },
      });

      this.logger.log(`User created successfully: ${user.username}`);
      return this.signToken(user.id, user.email);
    } catch (error) {
      this.logger.error(`Signup error for ${dto.email}: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException) {
        throw error;
      }

      throw error;
    }
  }

  async login(dto: LoginDto) {
    try {
      this.logger.log(`User login attempt: ${dto.email}`);
      
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      
      if (!user) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCOUNT_NOT_EXISTS);
      }

      const pwMatches = await bcrypt.compare(dto.password, user.password);
      if (!pwMatches) {
        throw new UnauthorizedException(ERROR_MESSAGES.WRONG_PASSWORD);
      }

      this.logger.log(`User logged in successfully: ${user.username}`);
      return this.signToken(user.id, user.email);
    } catch (error) {
      this.logger.error(`Login error for ${dto.email}: ${error.message}`, error.stack);
      
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      throw error;
    }
  }

  signToken(userId: number, email: string): { access_token: string } {
    this.logger.log(`Generating JWT token for user: ${userId}`);
    const payload = { sub: userId, email };
    const token = this.jwt.sign(payload);
    return { access_token: token };
  }
}