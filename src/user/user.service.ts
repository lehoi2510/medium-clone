import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
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
    if (data.newPassword) {
      if (!data.password) {
        throw new BadRequestException(
          'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu mới',
        );
      }

      const currentUser = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!currentUser) {
        throw new Error('User not found');
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        data.password,
        currentUser.password,
      );
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Mật khẩu hiện tại không đúng');
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
    return { user: userWithoutPassword };
  }
}
