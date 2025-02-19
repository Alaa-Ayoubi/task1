import {
    Injectable,
    ExecutionContext,
    CanActivate,
    UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface RequestWithUser extends Request {
    user?: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        const authHeader: string | undefined = request.headers['authorization'] as string | undefined;

        if (!authHeader) {
            console.log('🚨 Authorization header is missing!');
            throw new UnauthorizedException('Authorization header is missing');
        }

        const token: string | undefined = authHeader.split(' ')[1];

        if (!token) {
            console.log('🚨 Token is missing!');
            throw new UnauthorizedException('Token missing');
        }

        try {
            const decoded = await this.jwtService.verifyAsync(token);
            console.log('✅ Decoded Token:', decoded); 

            if (!decoded.userId) {
                console.log('🚨 User ID is missing in token!');
                throw new UnauthorizedException('User ID missing in token');
            }

            request.user = decoded; // ✅ تعيين المستخدم في الطلب
            console.log('✅ User Set in Request:', request.user);

            return true;
        } catch (error) {
            console.log('🚨 Token verification failed:', error.message);
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
