import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login'; // Importa tu componente standalone
import { RouterTestingModule } from '@angular/router/testing'; // Para el Router
import { FormsModule } from '@angular/forms'; // Para ngModel

describe('LoginComponent', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login, RouterTestingModule, FormsModule] // Agregamos FormsModule y RouterTestingModule
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
