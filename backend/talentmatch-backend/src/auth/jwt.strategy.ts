import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from './types';
import type { RequestUser } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'change-this-secret-key-later',
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}