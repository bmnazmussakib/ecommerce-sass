import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SuperJwtAuthGuard extends AuthGuard('super-jwt') {}
