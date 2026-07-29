import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = (request.headers['x-api-key'] as string) || (request.query.apiKey as string);

    if (!apiKey) {
      throw new UnauthorizedException('API Key header x-api-key is required');
    }

    return this.apiKeyService.validateAndThrottle(apiKey);
  }
}
