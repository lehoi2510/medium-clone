import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponse } from './interfaces/user.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: number): Promise<UserResponse> {
    this.logger.log(`Getting current user: ${userId}`);
    
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }
    
    const { password, ...userWithoutPassword } = user;
    this.logger.log(`User retrieved successfully: ${user.username}`);
    return { user: userWithoutPassword };
  }

  async updateUser(userId: number, updateData: UpdateUserDto): Promise<UserResponse> {
    this.logger.log(`Updating user: ${userId}`);
    
    let dataToUpdate: any = { ...updateData };
    
    if (updateData.newPassword) {
      if (!updateData.currentPassword) {
        throw new BadRequestException(ERROR_MESSAGES.CURRENT_PASSWORD_REQUIRED);
      }

      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        updateData.currentPassword,
        currentUser.password,
      );
      
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException(ERROR_MESSAGES.CURRENT_PASSWORD_INVALID);
      }

      const salt = await bcrypt.genSalt();
      const hashedNewPassword = await bcrypt.hash(updateData.newPassword, salt);

      dataToUpdate = {
        email: updateData.email,
        username: updateData.username,
        bio: updateData.bio,
        image: updateData.image,
        password: hashedNewPassword,
      };
      
      // Remove password fields from update data
      delete dataToUpdate.currentPassword;
      delete dataToUpdate.newPassword;
    }
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });
    
    const { password, ...userWithoutPassword } = user;
    this.logger.log(`User updated successfully: ${user.username}`);
    return { user: userWithoutPassword };
  }
}
