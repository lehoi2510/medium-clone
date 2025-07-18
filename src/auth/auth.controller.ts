import {
  Controller, Post, Body,
  HttpStatus
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
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new user' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'User created' })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login an existing user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged in' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}