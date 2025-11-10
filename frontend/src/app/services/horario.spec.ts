import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HorarioService } from './horario';

describe('HorarioService', () => {
  let service: HorarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Necesario para servicios que usan HttpClient
    });
    service = TestBed.inject(HorarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
