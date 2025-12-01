// src/app/core/guards/role.guard.ts

import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { RoleService } from '../../services/role';

export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return () => {
    const roleService = inject(RoleService);
    const router = inject(Router);

    if (roleService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirige a una página sin acceso o al dashboard
    router.navigate(['/unauthorized']);
    return false;
  };
}