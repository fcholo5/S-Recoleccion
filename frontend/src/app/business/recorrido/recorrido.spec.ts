import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Recorrido } from './recorrido';

describe('Recorrido', () => {
  let component: Recorrido;
  let fixture: ComponentFixture<Recorrido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Recorrido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recorrido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
