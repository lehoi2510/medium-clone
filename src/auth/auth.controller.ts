import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    signup(@Body() dto: SignupDto) {
        return this.authService.signup(dto);
    }

    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }
}