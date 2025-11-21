import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaPage } from './mapa';

describe('Mapa', () => {
  let component: MapaPage;
  let fixture: ComponentFixture<MapaPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
