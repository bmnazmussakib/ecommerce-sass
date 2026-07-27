import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MasterPrismaService } from '../database/master-prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly masterPrisma: MasterPrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;

    // We only log modifying actions (POST, PUT, PATCH, DELETE) to keep DB cleaner
    const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isModifying) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: async (response) => {
          // Clean sensitive fields from log details
          const logBody = { ...body };
          delete logBody.password;
          delete logBody.token;

          await this.masterPrisma.auditLog.create({
            data: {
              action: `${method} ${url}`,
              userId: user?.id || user?.sub || null,
              userEmail: user?.email || null,
              userRole: user?.role || null,
              details: {
                requestBody: logBody,
                statusCode: context.switchToHttp().getResponse().statusCode,
              },
            },
          }).catch(err => {
            console.error('[AuditLogInterceptor] Failed to save audit log:', err);
          });
        },
      }),
    );
  }
}
