import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { RequestUser } from './types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  override handleRequest<TUser = RequestUser>(
    err: Error | null,
    user: TUser | false,
  ): TUser {
    if (err ?? !user) {
      throw err ?? new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}