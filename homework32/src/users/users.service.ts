import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSenderService } from '../email-sender/email-sender.service';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async getCurrentUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deactivateCurrentUser(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    user.deactivatedAt = new Date();
    await this.usersRepository.save(user);
    await this.emailSenderService.sendDeactivation(user.email);

    return { success: true, message: 'Account deactivated successfully' };
  }
}
