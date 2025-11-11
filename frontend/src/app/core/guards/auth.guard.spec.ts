import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy = { navigate: jasmine.createSpy('navigate') };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
  });

  it('debería crearse correctamente', () => {
    expect(guard).toBeTruthy();
  });

  it('debería permitir acceso si hay token', () => {
    localStorage.setItem('token', 'abc123');
    expect(guard.canActivate()).toBeTrue();
  });

  it('debería redirigir al login si no hay token', () => {
    localStorage.removeItem('token');
    expect(guard.canActivate()).toBeFalse();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
