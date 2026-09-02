import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UserSeederService } from './user-seeder.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seeder = app.get(UserSeederService);
    const result = await seeder.seed(150_000);
    console.log(result);
  } finally {
    await app.close();
  }
}

void bootstrap();
