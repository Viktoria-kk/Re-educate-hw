import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      sortSchema: true,
      context: ({ req }: { req: Request }) => ({ req }),
      formatError: (error) => {
        const details = error.extensions?.originalError as { statusCode?: number } | undefined;
        const status = details?.statusCode ?? error.extensions?.status;
        const codes: Record<number, string> = {
          400: 'BAD_USER_INPUT',
          401: 'UNAUTHENTICATED',
          403: 'FORBIDDEN',
          404: 'NOT_FOUND',
          409: 'CONFLICT',
        };
        const code = typeof status === 'number' ? codes[status] : undefined;
        return {
          message: error.message,
          locations: error.locations,
          path: error.path,
          extensions: { code: code ?? error.extensions?.code ?? 'INTERNAL_SERVER_ERROR' },
        };
      },
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI') || 'mongodb://127.0.0.1:27017/midterm3',
      }),
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret === 'replace-with-a-long-random-secret') {
          throw new Error('Set JWT_SECRET in .env before starting the application');
        }
        return { secret, signOptions: { expiresIn: 86400 } };
      },
    }),
    UsersModule,
    AuthModule,
    PostsModule,
  ],
})
export class AppModule {}
