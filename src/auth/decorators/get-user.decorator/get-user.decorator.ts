import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    console.log("Extracted User from Request:", request.user); // ✅ طباعة بيانات المستخدم
    return request.user;
  },
);
