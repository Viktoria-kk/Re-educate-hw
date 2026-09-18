import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { createHash, randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { EmailSenderService } from '../email-sender/email-sender.service';
import { User } from '../users/entities/user.entity';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyUserDto } from './dto/verify-user.dto';

const OTP_LIFETIME_MS = 5 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailSenderService: EmailSenderService,
  ) {}

  async signUp({ email, fullName, password }: SignUpDto) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const otpCode = this.generateOtp();
    const user = this.usersRepository.create({
      email: normalizedEmail,
      fullName: fullName.trim(),
      password: await bcrypt.hash(password, 10),
      otpCodeHash: this.hashOtp(otpCode),
      otpExpiresAt: new Date(Date.now() + OTP_LIFETIME_MS),
    });
    await this.usersRepository.save(user);
    await this.emailSenderService.sendOtp(normalizedEmail, otpCode);

    return { success: true, message: 'Check your email for the OTP code' };
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Email or password is invalid');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Email is not verified');
    }

    return { accessToken: await this.createToken(user.id) };
  }

  async verifyUser({ email, otpCode }: VerifyUserDto) {
    const user = await this.findUserWithOtp(email);
    if (!user || !user.isActive) {
      throw new BadRequestException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
    if (!user.otpCodeHash || this.hashOtp(otpCode) !== user.otpCodeHash) {
      throw new BadRequestException('OTP code is invalid');
    }
    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP code has expired');
    }

    user.isVerified = true;
    user.otpCodeHash = null;
    user.otpExpiresAt = null;
    await this.usersRepository.save(user);
    await this.emailSenderService.sendWelcome(user.email);

    return { accessToken: await this.createToken(user.id) };
  }

  async resendVerificationCode({ email }: ResendVerificationDto) {
    const user = await this.findUserWithOtp(email);
    if (!user || !user.isActive) {
      throw new BadRequestException('User not found');
    }
    if (user.isVerified) {
      throw new BadRequestException('Email is already verified');
    }
    if (user.otpExpiresAt && user.otpExpiresAt.getTime() > Date.now()) {
      throw new BadRequestException('The current OTP code has not expired yet');
    }

    const otpCode = this.generateOtp();
    user.otpCodeHash = this.hashOtp(otpCode);
    user.otpExpiresAt = new Date(Date.now() + OTP_LIFETIME_MS);
    await this.usersRepository.save(user);
    await this.emailSenderService.sendOtp(user.email, otpCode);

    return { success: true, message: 'A new OTP code was sent' };
  }

  private findUserWithOtp(email: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(['user.otpCodeHash', 'user.otpExpiresAt'])
      .where('user.email = :email', { email: email.trim().toLowerCase() })
      .getOne();
  }

  private generateOtp() {
    return randomInt(100000, 1000000).toString();
  }

  private hashOtp(otpCode: string) {
    return createHash('sha256').update(otpCode).digest('hex');
  }

  private createToken(userId: string) {
    return this.jwtService.signAsync({ sub: userId }, { expiresIn: '1h' });
  }
}
