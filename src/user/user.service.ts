import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: number) {
    try {
      this.logger.log(`Getting current user: ${userId}`);
      
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }
      
      const { password, ...userWithoutPassword } = user;
      this.logger.log(`User retrieved successfully: ${user.username}`);
      return { user: userWithoutPassword };
    } catch (error) {
      this.logger.error(`Error getting current user ${userId}: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw error;
    }
  }

  async updateUser(
    userId: number,
    data: Partial<{
      email: string;
      username: string;
      password: string;
      newPassword: string;
      bio: string;
      image: string;
    }>,
  ) {
    try {
      this.logger.log(`Updating user: ${userId}`);
      
      if (data.newPassword) {
        if (!data.password) {
          throw new BadRequestException(ERROR_MESSAGES.CURRENT_PASSWORD_REQUIRED);
        }

        const currentUser = await this.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!currentUser) {
          throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          data.password,
          currentUser.password,
        );
        
        if (!isCurrentPasswordValid) {
          throw new UnauthorizedException(ERROR_MESSAGES.CURRENT_PASSWORD_INVALID);
        }

        const salt = await bcrypt.genSalt();
        const hashedNewPassword = await bcrypt.hash(data.newPassword, salt);

        data = {
          email: data.email,
          username: data.username,
          bio: data.bio,
          image: data.image,
          password: hashedNewPassword,
        };
      }
      
      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
      });
      
      const { password, ...userWithoutPassword } = user;
      this.logger.log(`User updated successfully: ${user.username}`);
      return { user: userWithoutPassword };
    } catch (error) {
      this.logger.error(`Error updating user ${userId}: ${error.message}`, error.stack);
      
      if (error instanceof BadRequestException || 
          error instanceof UnauthorizedException ||
          error instanceof NotFoundException) {
        throw error;
      }

      throw error;
    }
  }
}
