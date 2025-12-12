import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JwtAuthGuard: wrapper around passport-jwt AuthGuard.
 * Note: you must register the JwtStrategy in your AppModule for this to work.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}