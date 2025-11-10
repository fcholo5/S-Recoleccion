import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RecorridoService } from './recorrido';

describe('RecorridoService', () => {
  let service: RecorridoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule], // Necesario para los servicios que usan HttpClient
    });
    service = TestBed.inject(RecorridoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
