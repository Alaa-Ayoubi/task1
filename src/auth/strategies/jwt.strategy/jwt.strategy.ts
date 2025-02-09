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
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }
  async validate(payload: { userId: number }) {
    console.log('✅ Decoded JWT Payload:', payload); // تحقق من أن `userId` موجود
  
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId }, // تأكد أن `userId` رقم وليس نص
    });
  
    console.log('✅ User found in DB:', user); // تحقق من أن المستخدم موجود في قاعدة البيانات
  
    if (!user) {
      throw new UnauthorizedException('User not found in database');
    }
  
    return user;
  }
    
}
