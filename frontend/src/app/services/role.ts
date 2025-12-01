
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  hasRole(requiredRole: string): boolean {
    const userRole = localStorage.getItem('authRole');
    return userRole === requiredRole;
  }

  hasAnyRole(allowedRoles: string[]): boolean {
    const userRole = localStorage.getItem('authRole');
    return allowedRoles.includes(userRole as string);
  }
}