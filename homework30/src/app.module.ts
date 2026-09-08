import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesModule } from './movies/movies.module';
import { DirectorsModule } from './directors/directors.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('SQL_HOST', 'localhost'),
        port: Number(config.get<string>('SQL_PORT', '3306')),
        username: config.get<string>('SQL_USERNAME', 'root'),
        password: config.get<string>('SQL_PASSWORD', ''),
        database: config.get<string>('SQL_DATABASE', 'homework28'),
        autoLoadEntities: true,
        synchronize: config.get<string>('SQL_SYNC', 'false') === 'true',
      }),
    }),
    MoviesModule,
    DirectorsModule,
  ],
})
export class AppModule {}
