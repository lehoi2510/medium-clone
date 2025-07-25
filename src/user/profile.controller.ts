import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  UseGuards, 
  Req, 
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiBearerAuth, 
  ApiParam,
  ApiResponse 
} from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { ProfileResponse } from './interfaces/profile.interface';
import { 
  CommonApiResponses, 
  AuthRequiredResponses 
} from '../common/decorators/api-responses.decorator';

@ApiTags('profiles')
@Controller('api/profiles')
export class ProfileController {
  private readonly logger = new Logger(ProfileController.name);

  constructor(private profileService: ProfileService) {}

  @Get(':username')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiParam({ name: 'username', description: 'Username of the profile to get' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profile retrieved successfully',
    type: ProfileResponseDto 
  })
  @CommonApiResponses.NotFound()
  async getProfile(
    @Param('username') targetUsername: string,
    @Req() request?: AuthenticatedRequest
  ): Promise<ProfileResponse> {
    this.logger.log(`Getting profile for username: ${targetUsername}`);
    const currentUserId = request?.user?.id;
    return await this.profileService.getProfile(targetUsername, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiParam({ name: 'username', description: 'Username of the user to follow' })
  @ApiResponse({ 
    status: 200, 
    description: 'User followed successfully',
    type: ProfileResponseDto 
  })
  @CommonApiResponses.NotFound()
  @CommonApiResponses.BadRequest()
  @AuthRequiredResponses()
  async followUser(
    @Param('username') targetUsername: string,
    @Req() request: AuthenticatedRequest
  ): Promise<ProfileResponse> {
    this.logger.log(`User ${request.user.id} following ${targetUsername}`);
    return await this.profileService.followUser(targetUsername, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':username/follow')
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiParam({ name: 'username', description: 'Username of the user to unfollow' })
  @ApiResponse({ 
    status: 200, 
    description: 'User unfollowed successfully',
    type: ProfileResponseDto 
  })
  @CommonApiResponses.NotFound()
  @AuthRequiredResponses()
  async unfollowUser(
    @Param('username') targetUsername: string,
    @Req() request: AuthenticatedRequest
  ): Promise<ProfileResponse> {
    this.logger.log(`User ${request.user.id} unfollowing ${targetUsername}`);
    return await this.profileService.unfollowUser(targetUsername, request.user.id);
  }
}
