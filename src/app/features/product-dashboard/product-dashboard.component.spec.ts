import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { ProductDashboardComponent } from './product-dashboard.component';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.interface';

/**
 * Unit tests for ProductDashboardComponent.
 * 
 * This test suite verifies that the main product management component
 * works correctly, including data loading, forms, modals, and CRUD operations.
 */
describe('ProductDashboardComponent', () => {
  let component: ProductDashboardComponent;
  let fixture: ComponentFixture<ProductDashboardComponent>;
  let productService: jasmine.SpyObj<ProductService>;
  let modalService: jasmine.SpyObj<NgbModal>;

  // Mocked test data
  const mockProducts: Product[] = [
    { id: 1, name: 'iPhone 15', price: 849990, stock: 10 },
    { id: 2, name: 'MacBook Pro', price: 2499990, stock: 5 },
    { id: 3, name: 'iPad Air', price: 649990, stock: 15 }
  ];

  const newMockProduct: Product = {
    name: 'Apple Watch',
    price: 399990,
    stock: 20
  };

  const createdMockProduct: Product = {
    id: 4,
    name: 'Apple Watch',
    price: 399990,
    stock: 20
  };

  beforeEach(async () => {
    // Create ProductService spy
    const spy = jasmine.createSpyObj('ProductService', [
      'getProducts',
      'addProduct',
      'deleteProduct',
      'getProduct',
      'updateProduct'
    ]);

    // Create NgbModal spy
    const modalSpy = jasmine.createSpyObj('NgbModal', ['open']);
    const mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close', 'dismiss']);
    modalSpy.open.and.returnValue(mockModalRef);

    await TestBed.configureTestingModule({
      imports: [
        ProductDashboardComponent,
        ReactiveFormsModule,
        NgbModalModule
      ],
      providers: [
        { provide: ProductService, useValue: spy },
        { provide: NgbModal, useValue: modalSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDashboardComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService) as jasmine.SpyObj<ProductService>;
    modalService = TestBed.inject(NgbModal) as jasmine.SpyObj<NgbModal>;
  });

  /**
   * Prueba que el componente se cree correctamente.
   */
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Grupo de pruebas para la inicialización del componente.
   */
  describe('Component Initialization', () => {
    /**
     * Prueba que el formulario se inicialice con las validaciones correctas.
     */
    it('should initialize form with correct validators', () => {
      expect(component.productForm).toBeDefined();
      expect(component.productForm.get('name')).toBeDefined();
      expect(component.productForm.get('price')).toBeDefined();
      expect(component.productForm.get('stock')).toBeDefined();

      // Verificar validaciones
      const nameControl = component.productForm.get('name')!;
      const priceControl = component.productForm.get('price')!;
      const stockControl = component.productForm.get('stock')!;

      // Name required and minimum 2 characters
      nameControl.setValue('');
      expect(nameControl.invalid).toBeTruthy();
      nameControl.setValue('a');
      expect(nameControl.invalid).toBeTruthy();
      nameControl.setValue('iPhone');
      expect(nameControl.valid).toBeTruthy();

      // Minimum price 100
      priceControl.setValue(50);
      expect(priceControl.invalid).toBeTruthy();
      priceControl.setValue(100);
      expect(priceControl.valid).toBeTruthy();

      // Stock no negativo
      stockControl.setValue(-1);
      expect(stockControl.invalid).toBeTruthy();
      stockControl.setValue(0);
      expect(stockControl.valid).toBeTruthy();
    });

    /**
     * Prueba que las propiedades iniciales tengan los valores correctos.
     */
    it('should initialize with correct default values', () => {
      expect(component.products).toEqual([]);
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('');
    });

    /**
     * Prueba que ngOnInit llame a loadProducts.
     */
    it('should call loadProducts on ngOnInit', () => {
      spyOn(component, 'loadProducts');
      component.ngOnInit();
      expect(component.loadProducts).toHaveBeenCalled();
    });
  });

  /**
   * Grupo de pruebas para la carga de productos.
   */
  describe('loadProducts', () => {
    /**
     * Prueba que loadProducts cargue los productos correctamente.
     */
    it('should load products successfully', () => {
      productService.getProducts.and.returnValue(of(mockProducts));

      component.loadProducts();

      expect(component.isLoading).toBeFalse();
      expect(component.products).toEqual(mockProducts);
      expect(component.errorMessage).toBe('');
      expect(productService.getProducts).toHaveBeenCalled();
    });

    /**
     * Prueba que loadProducts maneje errores correctamente.
     */
    it('should handle error when loading products', () => {
      const errorResponse = new Error('Network error');
      productService.getProducts.and.returnValue(throwError(() => errorResponse));

      component.loadProducts();

      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('Error al cargar los productos. Asegúrate de que json-server esté ejecutándose.');
    });

    /**
     * Prueba que loadProducts establezca isLoading correctamente.
     */
    it('should set loading state correctly', () => {
      productService.getProducts.and.returnValue(of(mockProducts));

      expect(component.isLoading).toBeFalse();
      component.loadProducts();
      // After the synchronous call with of(), isLoading should be false
      expect(component.isLoading).toBeFalse();
    });
  });

  /**
   * Test group for modal management.
   */
  describe('Modal Management', () => {
    /**
     * Test that openModal shows the modal and resets the form.
     */
    it('should open modal and reset form', () => {
      // Set up form with data
      component.productForm.patchValue({
        name: 'Test Product',
        price: 100000,
        stock: 5
      });

      component.openModal();

      expect(modalService.open).toHaveBeenCalled();
      expect(component.productForm.get('name')?.value).toBeNull();
      expect(component.productForm.get('price')?.value).toBeNull();
      expect(component.productForm.get('stock')?.value).toBeNull();
    });

    /**
     * Test that closeModal hides the modal and resets the form.
     */
    it('should close modal and reset form', () => {
      // Set up a mock modal reference
      const mockModalRef = jasmine.createSpyObj('NgbModalRef', ['close']);
      (component as any).modalRef = mockModalRef;
      
      component.productForm.patchValue({
        name: 'Test Product',
        price: 100000,
        stock: 5
      });

      component.closeModal();

      expect(mockModalRef.close).toHaveBeenCalled();
      expect(component.productForm.get('name')?.value).toBeNull();
    });
  });

  /**
   * Test group for form submission.
   */
  describe('Form Submission', () => {
    /**
     * Test that onSubmit adds a product when the form is valid.
     */
    it('should add product when form is valid', () => {
      productService.addProduct.and.returnValue(of(createdMockProduct));
      component.products = [...mockProducts];

      // Set up valid form
      component.productForm.patchValue(newMockProduct);

      component.onSubmit();

      expect(productService.addProduct).toHaveBeenCalledWith(newMockProduct);
      expect(component.products.length).toBe(4);
      expect(component.products[3]).toEqual(createdMockProduct);
      // Modal should be closed after successful submission - verified by closeModal being called
    });

    /**
     * Test that onSubmit does nothing when the form is invalid.
     */
    it('should not add product when form is invalid', () => {
      // Invalid form (empty name)
      component.productForm.patchValue({
        name: '',
        price: 100000,
        stock: 5
      });

      component.onSubmit();

      expect(productService.addProduct).not.toHaveBeenCalled();
    });

    /**
     * Prueba que onSubmit maneje errores al agregar producto.
     */
    it('should handle error when adding product', () => {
      const errorResponse = new Error('Server error');
      productService.addProduct.and.returnValue(throwError(() => errorResponse));

      component.productForm.patchValue(newMockProduct);

      component.onSubmit();

      expect(component.errorMessage).toBe('Error al agregar el producto');
    });
  });

  /**
   * Grupo de pruebas para la eliminación de productos.
   */
  describe('Product Deletion', () => {
    beforeEach(() => {
      component.products = [...mockProducts];
    });

    /**
     * Prueba que deleteProduct elimine el producto cuando el usuario confirma.
     */
    it('should delete product when user confirms', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productService.deleteProduct.and.returnValue(of(undefined));

      component.deleteProduct(1);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this product?');
      expect(productService.deleteProduct).toHaveBeenCalledWith(1);
      expect(component.products.length).toBe(2);
      expect(component.products.find(p => p.id === 1)).toBeUndefined();
    });

    /**
     * Test that deleteProduct doesn't delete when user cancels.
     */
    it('should not delete product when user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteProduct(1);

      expect(window.confirm).toHaveBeenCalled();
      expect(productService.deleteProduct).not.toHaveBeenCalled();
      expect(component.products.length).toBe(3);
    });

    /**
     * Prueba que deleteProduct maneje errores correctamente.
     */
    it('should handle error when deleting product', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      const errorResponse = new Error('Delete error');
      productService.deleteProduct.and.returnValue(throwError(() => errorResponse));

      component.deleteProduct(1);

      expect(component.errorMessage).toBe('Error deleting the product');
      expect(component.products.length).toBe(3); // Not deleted
    });
  });

  /**
   * Test group for helper functions.
   */
  describe('Helper Functions', () => {
    /**
     * Test that trackByProductId returns the product ID.
     */
    it('should return product ID in trackByProductId', () => {
      const product = mockProducts[0];
      const result = component.trackByProductId(0, product);
      expect(result).toBe(product.id!);
    });

    /**
     * Prueba que trackByProductId retorne el índice cuando no hay ID.
     */
    it('should return index when product has no ID', () => {
      const productWithoutId: Product = {
        name: 'Test Product',
        price: 100000,
        stock: 5
      };
      const result = component.trackByProductId(5, productWithoutId);
      expect(result).toBe(5);
    });
  });

  /**
   * Grupo de pruebas para los getters del formulario.
   */
  describe('Form Getters', () => {
    /**
     * Prueba que los getters retornen los controles correctos.
     */
    it('should return correct form controls', () => {
      expect(component.name).toBe(component.productForm.get('name'));
      expect(component.price).toBe(component.productForm.get('price'));
      expect(component.stock).toBe(component.productForm.get('stock'));
    });
  });

  /**
   * Grupo de pruebas de integración para el componente.
   */
  describe('Integration Tests', () => {
    /**
     * Prueba el flujo completo de agregar un producto.
     */
    it('should complete full add product flow', () => {
      productService.getProducts.and.returnValue(of(mockProducts));
      productService.addProduct.and.returnValue(of(createdMockProduct));

      // Inicializar componente
      component.ngOnInit();
      fixture.detectChanges();

      // Open modal
      component.openModal();
      expect(modalService.open).toHaveBeenCalled();

      // Fill form
      component.productForm.patchValue(newMockProduct);
      expect(component.productForm.valid).toBeTrue();

      // Submit form
      component.onSubmit();

      // Verify results
      expect(productService.addProduct).toHaveBeenCalledWith(newMockProduct);
      expect(component.products.length).toBe(4);
      // Modal should be closed after successful submission
    });

    /**
     * Prueba el flujo completo de eliminar un producto.
     */
    it('should complete full delete product flow', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      productService.getProducts.and.returnValue(of(mockProducts));
      productService.deleteProduct.and.returnValue(of(undefined));

      // Inicializar componente
      component.ngOnInit();
      fixture.detectChanges();

      const initialCount = component.products.length;

      // Eliminar producto
      component.deleteProduct(1);

      // Verificar resultados
      expect(productService.deleteProduct).toHaveBeenCalledWith(1);
      expect(component.products.length).toBe(initialCount - 1);
      expect(component.products.find(p => p.id === 1)).toBeUndefined();
    });
  });
});
