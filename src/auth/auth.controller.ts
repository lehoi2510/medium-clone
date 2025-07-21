import {
  Controller, Post, Body,
  HttpStatus, Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags, ApiOperation, ApiResponse
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  async signup(@Body() signupDto: SignupDto) {
    this.logger.log(`Signup request for email: ${signupDto.email}`);
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged in' })
  async login(@Body() loginDto: LoginDto) {
    this.logger.log(`Login request for email: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }
}