import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UsersService } from '../../users/users.service';

type ProductRequest = Request & { isActiveSubscriber?: boolean };

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<ProductRequest>();

    const emailHeader = req.headers['email'];
    const email = Array.isArray(emailHeader) ? emailHeader[0] : emailHeader;

    if (!email) {
      req.isActiveSubscriber = false;
      return true;
    }

    const user = this.usersService.findUserByEmail(email);
    const currentDate = new Date();

    req.isActiveSubscriber =
      user !== undefined &&
      user.subscriptionStartDate <= currentDate &&
      user.subscriptionEndDate >= currentDate;

    return true;
  }
}
