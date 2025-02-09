// logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;
    const now = Date.now();

    console.log(`--> Incoming Request: [${method}] ${url}`);
    return next
      .handle()
      .pipe(
        tap(() => console.log(`<-- Response for: [${method}] ${url} - ${Date.now() - now}ms`)),
      );
  }
}
