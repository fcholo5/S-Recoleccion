import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Posicion } from './posicion';

describe('Posicion', () => {
  let component: Posicion;
  let fixture: ComponentFixture<Posicion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Posicion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Posicion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
