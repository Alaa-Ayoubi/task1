import { Injectable, ExecutionContext, CanActivate, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
  
    if (!authHeader) {
      console.log('🚨 Authorization header is missing!');
      throw new UnauthorizedException('Authorization header is missing');
    }
  
    const token = authHeader.split(' ')[1];
  
    if (!token) {
      console.log('🚨 Token is missing!');
      throw new UnauthorizedException('Token missing');
    }
  
    try {
      const decoded = this.jwtService.verify(token);
      console.log('✅ Decoded Token:', decoded); // ✅ تحقق من محتوى التوكن بعد فك التشفير
  
      if (!decoded.userId) {
        console.log('🚨 User ID is missing in token!');
        throw new UnauthorizedException('User ID missing in token');
      }
  
      request.user = decoded; // ✅ تعيين المستخدم في الطلب
      console.log('✅ User Set in Request:', request.user);
  
      return true;
    } catch (error: any) {
      console.log('🚨 Token verification failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
  
}  