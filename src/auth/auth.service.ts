import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
    ) { }

    async signup(dto: SignupDto) {
        try {
            const hashed = await bcrypt.hash(dto.password, 10);
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    username: dto.username,
                    password: hashed,
                },
            });

            return this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2002') {
                    throw new ConflictException('Email hoặc username đã tồn tại');
                }
            }
            throw new Error(error.message || 'Có lỗi xảy ra, vui lòng thử lại');
        }
    }

    async login(dto: LoginDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });
            if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');

        const pwMatches = await bcrypt.compare(dto.password, user.password);
        if (!pwMatches) throw new UnauthorizedException('Sai mật khẩu');

        return this.signToken(user.id, user.email);
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError) {
                if (error.code === 'P2025') {
                    throw new UnauthorizedException('Tài khoản không tồn tại');
                }
            }
            throw new Error('Có lỗi xảy ra, vui lòng thử lại');
        }
    }

    signToken(userId: number, email: string): { access_token: string } {
        const payload = { sub: userId, email };
        const token = this.jwt.sign(payload, {
            secret: 'JWT_SECRET_KEY', // nên đặt trong .env
            expiresIn: '1d',
        });
        return { access_token: token };
    }
}