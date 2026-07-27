import { SetMetadata } from '@nestjs/common';
import { StaffRole } from '@prisma/tenant-client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);
