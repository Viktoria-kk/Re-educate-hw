import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gender, User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class UserSeederService {
  private readonly logger = new Logger(UserSeederService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async seed(targetCount = 150_000, batchSize = 5_000) {
    const existingCount = await this.userModel.countDocuments().exec();

    if (existingCount >= targetCount) {
      this.logger.log(
        `Seed skipped: database already contains ${existingCount} users`,
      );
      return { existingCount, inserted: 0, total: existingCount };
    }

    const { faker } = await import('@faker-js/faker');
    faker.seed(27);

    const usersToInsert = targetCount - existingCount;
    let inserted = 0;
    this.logger.log(
      `Seeding ${usersToInsert} users in batches of ${batchSize}`,
    );

    while (inserted < usersToInsert) {
      const currentBatchSize = Math.min(batchSize, usersToInsert - inserted);
      const users = Array.from({ length: currentBatchSize }, () => ({
        fullName: faker.person.fullName(),
        email: `seed-${faker.string.uuid()}@example.test`,
        age: faker.number.int({ min: 18, max: 80 }),
        gender: faker.helpers.arrayElement([Gender.Male, Gender.Female]),
      }));

      await this.userModel.insertMany(users, { ordered: false });
      inserted += currentBatchSize;
      this.logger.log(
        `Seed progress: ${existingCount + inserted}/${targetCount}`,
      );
    }

    return {
      existingCount,
      inserted,
      total: existingCount + inserted,
    };
  }
}
