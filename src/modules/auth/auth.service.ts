import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from 'generated/prisma/enums';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.do';

@Injectable()
export class AuthService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService
    ) { }

    async register(data: RegisterDto) {
        const userExister = await this.prismaService.user.findUnique({
            where: { email: data.email }
        });

        if (userExister) {
            throw new ConflictException("Email already registered");
        };

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = await this.prismaService.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: Role.USER
            }
        });

        return this.generateTokens(user.id, user.email);
    }

    async login(data: LoginDto) {
        const user = await this.prismaService.user.findUnique({
            where: { email: data.email }
        })

        if (!user) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        const passwordMatches = await bcrypt.compare(
            data.password,
            user.password
        )

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid Credentials')
        }

        return this.generateTokens(user.id, user.email)
    }

    private async generateTokens(userId: string, email: string) {
        const payload = { sub: userId, email };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '15m'
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d'
        });

        const hashedRefreshed = await bcrypt.hash(refreshToken, 10);

        await this.prismaService.user.update({
            where: { id: userId },
            data: { refreshToken: hashedRefreshed }
        })

        return {
            accessToken,
            refreshToken
        }
    }
}
