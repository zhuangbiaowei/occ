import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

export interface Permission {
  resource: string;
  actions: string[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    return requiredRoles.some((role) => user.role === role);
  }

  hasPermission(user: User, resource: string, action: string): boolean {
    if (!user.roles) {
      return false;
    }

    return user.roles.some(role => {
      const permission = role.permissions?.find(p => p.resource === resource);
      return permission?.actions.includes(action);
    });
  }
}
