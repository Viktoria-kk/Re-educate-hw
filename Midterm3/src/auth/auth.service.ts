import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { AuthPayload } from './dto/auth-payload.type';
import { LoginInput } from './dto/login.input';
import { RegisterInput } from './dto/register.input';

const scrypt = promisify(scryptCallback);

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const salt = randomBytes(16).toString('hex');
    const hash = (await scrypt(input.password, salt, 64)) as Buffer;
    const user = await this.users.create(input.name.trim(), input.email.trim(), `${salt}:${hash.toString('hex')}`);
    return this.payloadFor(user);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.users.findByEmailWithPassword(input.email.trim());
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid email or password');
    const [salt, storedHex] = user.passwordHash.split(':');
    if (!salt || !storedHex) throw new UnauthorizedException('Invalid email or password');
    const stored = Buffer.from(storedHex, 'hex');
    const candidate = (await scrypt(input.password, salt, stored.length)) as Buffer;
    if (stored.length !== candidate.length || !timingSafeEqual(stored, candidate)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.payloadFor(user);
  }

  private async payloadFor(user: UserDocument): Promise<AuthPayload> {
    const accessToken = await this.jwt.signAsync({ sub: user.id as string, email: user.email });
    return { accessToken, user: this.users.toType(user) };
  }
}
