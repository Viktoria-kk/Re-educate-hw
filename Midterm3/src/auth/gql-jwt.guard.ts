import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { JwtUser } from './current-user.decorator';

@Injectable()
export class GqlJwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gql = GqlExecutionContext.create(context);
    const req = gql.getContext<{ req: { headers: { authorization?: string }; user?: JwtUser } }>().req;
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      throw new UnauthorizedException('Bearer token required');
    }
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string; email: string }>(token);
      const user = await this.users.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Invalid token');
      req.user = { id: user.id as string, email: user.email };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
