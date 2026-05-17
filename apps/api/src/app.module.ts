import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { DiscussionsModule } from './discussions/discussions.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SearchModule } from './search/search.module';
import { UploadsModule } from './uploads/uploads.module';
import { CollaborationsModule } from './collaborations/collaborations.module';
import { DirectMessagesModule } from './direct-messages/direct-messages.module';
import { FollowsModule } from './follows/follows.module';
import { AdminModule } from './admin/admin.module';
import { ReportsModule } from './reports/reports.module';
import { ClerkAuthMiddleware } from './common/middleware/clerk-auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.local' }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PostsModule,
    DiscussionsModule,
    CommentsModule,
    NotificationsModule,
    SearchModule,
    UploadsModule,
    CollaborationsModule,
    DirectMessagesModule,
    FollowsModule,
    AdminModule,
    ReportsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClerkAuthMiddleware).forRoutes('*');
  }
}
