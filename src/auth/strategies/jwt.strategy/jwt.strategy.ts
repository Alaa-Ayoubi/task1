import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') || 'default_secret', 
    });
  }

  async validate(payload: { userId: string }) {
    console.log('✅ Decoded JWT Payload:', payload);

    if (!payload.userId) {
      throw new UnauthorizedException('Invalid JWT token: Missing userId');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId }, 
    });

    console.log('✅ User found in DB:', user);

    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }

    return user;
  }
}
