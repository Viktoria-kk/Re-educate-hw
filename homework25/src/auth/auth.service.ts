import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare, hash } from 'bcrypt';
import { Model } from 'mongoose';
import { User } from '../users/schema/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();
    const existingUser = await this.userModel.exists({ email });

    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const user = await this.userModel.create({
      ...registerDto,
      email,
      password: await hash(registerDto.password, 12),
      subscriptionStartDate,
      subscriptionEndDate,
    });

    return this.createAuthResponse(user._id.toString(), user.email);
  }

  async login({ email, password }: LoginDto) {
    const user = await this.userModel
      .findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user || !(await compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.createAuthResponse(user._id.toString(), user.email);
  }

  async getCurrentUser(userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }

  private async createAuthResponse(userId: string, email: string) {
    return {
      accessToken: await this.jwtService.signAsync({ sub: userId, email }),
    };
  }
}
