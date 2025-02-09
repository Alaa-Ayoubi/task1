import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import {AuthModule} from '../auth/auth.module'
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';


@Module({
  imports: [PrismaModule ,AuthModule],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
