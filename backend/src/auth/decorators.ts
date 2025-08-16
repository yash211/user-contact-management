import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../common';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
