import { Controller, Get, Put, Body, UseGuards, Request, Logger } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

@ApiBearerAuth('jwt')
@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Getting current user: ${req.user.id}`);
    return this.userService.getCurrentUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateUser(@Request() req: AuthenticatedRequest, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user: ${req.user.id}`);
    return this.userService.updateUser(req.user.id, updateUserDto);
  }
}
