import { getModelToken } from '@nestjs/mongoose';
import { NestFactory } from '@nestjs/core';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { User } from '../users/schema/user.schema';

async function runMigration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const userModel = app.get<Model<User>>(getModelToken('user'));
    const result = await userModel.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } },
    );

    console.log({
      migration: 'add-is-active',
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    });
  } finally {
    await app.close();
  }
}

void runMigration();
