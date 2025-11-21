import { TestBed } from '@angular/core/testing';

import { Barrio } from './barrio';

describe('Barrio', () => {
  let service: Barrio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barrio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
