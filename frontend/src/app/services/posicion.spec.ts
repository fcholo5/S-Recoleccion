import { TestBed } from '@angular/core/testing';

import { Posicion } from './posicion';

describe('Posicion', () => {
  let service: Posicion;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Posicion);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
