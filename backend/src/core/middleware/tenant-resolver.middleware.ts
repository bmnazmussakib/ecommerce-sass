import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const host = req.headers.host;
    if (!host) {
      throw new BadRequestException('Missing Host header');
    }
    // Attach to request context
    (req as any).tenantHost = host;
    next();
  }
}
