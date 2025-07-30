import { Controller, Get, Put, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { UserResponse } from './interfaces/user.interface';
import { 
  CommonApiResponses, 
  AuthRequiredResponses 
} from '../common/decorators/api-responses.decorator';

@ApiTags('user')
@ApiBearerAuth('jwt')
@Controller('api/user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get current user' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @AuthRequiredResponses()
  async getCurrentUser(@Request() request: AuthenticatedRequest): Promise<UserResponse> {
    this.logger.log(`Getting current user: ${request.user.id}`);
    return await this.userService.getCurrentUser(request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  @ApiOperation({ summary: 'Update current user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @CommonApiResponses.BadRequest()
  @AuthRequiredResponses()
  async updateUser(
    @Request() request: AuthenticatedRequest, 
    @Body() updateUserData: UpdateUserDto
  ): Promise<UserResponse> {
    this.logger.log(`Updating user: ${request.user.id}`);
    return await this.userService.updateUser(request.user.id, updateUserData);
  }
}
