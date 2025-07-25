import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProfileResponse } from './interfaces/profile.interface';
import { ERROR_MESSAGES } from '../common/constants/messages.constant';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, currentUserId?: number): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        image: true,
      }
    });

    if (!user) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    let following = false;
    if (currentUserId) {
      const followRecord = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id
          }
        }
      });
      following = !!followRecord;
    }

    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following
      }
    };
  }

  async followUser(username: string, currentUserId: number): Promise<ProfileResponse> {
    const userToFollow = await this.prisma.user.findUnique({
      where: { username }
    });

    if (!userToFollow) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (userToFollow.id === currentUserId) {
      throw new BadRequestException(ERROR_MESSAGES.CANNOT_FOLLOW_YOURSELF);
    }

    await this.prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userToFollow.id
        }
      },
      update: {},
      create: {
        followerId: currentUserId,
        followingId: userToFollow.id
      }
    });

    return {
      profile: {
        username: userToFollow.username,
        bio: userToFollow.bio,
        image: userToFollow.image,
        following: true
      }
    };
  }

  async unfollowUser(username: string, currentUserId: number): Promise<ProfileResponse> {
    const userToUnfollow = await this.prisma.user.findUnique({
      where: { username }
    });

    if (!userToUnfollow) {
      throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    await this.prisma.follow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: userToUnfollow.id
      }
    });

    return {
      profile: {
        username: userToUnfollow.username,
        bio: userToUnfollow.bio,
        image: userToUnfollow.image,
        following: false
      }
    };
  }
}
