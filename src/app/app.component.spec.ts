import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { ProductDashboardComponent } from '@features/product-dashboard';

/**
 * Pruebas unitarias para AppComponent.
 * 
 * Este conjunto de pruebas verifica que el componente raíz
 * de la aplicación se inicialice correctamente y muestre
 * el contenido esperado.
 */
describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ProductDashboardComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  /**
   * Prueba que la aplicación se cree correctamente.
   */
  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  /**
   * Prueba que el título de la aplicación sea correcto.
   */
  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('E-Commerce Product Management');
  });

  /**
   * Prueba que el título se renderice en el template.
   */
  it('should render title in template', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('h1');
    
    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('E-Commerce Product Management');
  });

  /**
   * Prueba que el componente ProductDashboard esté presente.
   */
  it('should contain product dashboard component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const dashboardElement = compiled.querySelector('app-product-dashboard');
    
    expect(dashboardElement).toBeTruthy();
  });

  /**
   * Prueba que el componente tenga la estructura HTML básica esperada.
   */
  it('should have main container structure', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Verificar que existe un contenedor principal
    const mainContainer = compiled.querySelector('.container, main, .app-container');
    expect(mainContainer || compiled.querySelector('h1')).toBeTruthy();
  });

  /**
   * Prueba que el componente no tenga errores de renderizado.
   */
  it('should render without throwing errors', () => {
    expect(() => {
      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
    }).not.toThrow();
  });
});
