import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { Product } from '../models/product.interface';

/**
 * Unit tests for ProductService.
 * 
 * This test suite verifies that all CRUD operations
 * of the product service work correctly and handle
 * success and error cases appropriately.
 */
describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/products';

  // Mocked test data
  const mockProducts: Product[] = [
    { id: 1, name: 'iPhone 15', price: 849990, stock: 10 },
    { id: 2, name: 'MacBook Pro', price: 2499990, stock: 5 },
    { id: 3, name: 'iPad Air', price: 649990, stock: 15 }
  ];

  const mockProduct: Product = {
    id: 1,
    name: 'iPhone 15 Pro',
    price: 1199990,
    stock: 8
  };

  const newMockProduct: Product = {
    name: 'Apple Watch',
    price: 399990,
    stock: 20
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no hay peticiones HTTP pendientes
    httpMock.verify();
  });

  /**
   * Prueba que el servicio se cree correctamente.
   */
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  /**
   * Grupo de pruebas para el método getProducts().
   */
  describe('getProducts', () => {
    /**
     * Prueba que getProducts() retorne la lista de productos correctamente.
     */
    it('should return an Observable<Product[]>', () => {
      service.getProducts().subscribe(products => {
        expect(products.length).toBe(3);
        expect(products).toEqual(mockProducts);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    /**
     * Prueba que getProducts() maneje errores de red correctamente.
     */
    it('should handle HTTP error when getting products', () => {
      const errorMessage = 'Network error';

      service.getProducts().subscribe({
        next: () => fail('Expected an error, not products'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    /**
     * Prueba que getProducts() retorne un array vacío cuando no hay productos.
     */
    it('should return empty array when no products exist', () => {
      service.getProducts().subscribe(products => {
        expect(products).toEqual([]);
        expect(products.length).toBe(0);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  /**
   * Grupo de pruebas para el método addProduct().
   */
  describe('addProduct', () => {
    /**
     * Prueba que addProduct() cree un nuevo producto correctamente.
     */
    it('should add a new product and return it with ID', () => {
      const expectedProduct = { ...newMockProduct, id: 4 };

      service.addProduct(newMockProduct).subscribe(product => {
        expect(product).toEqual(expectedProduct);
        expect(product.id).toBeDefined();
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newMockProduct);
      req.flush(expectedProduct);
    });

    /**
     * Prueba que addProduct() envíe los datos correctos en el cuerpo de la petición.
     */
    it('should send correct product data in request body', () => {
      service.addProduct(newMockProduct).subscribe();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.body).toEqual(newMockProduct);
      expect(req.request.body.name).toBe('Apple Watch');
      expect(req.request.body.price).toBe(399990);
      expect(req.request.body.stock).toBe(20);
      req.flush({ ...newMockProduct, id: 4 });
    });

    /**
     * Prueba que addProduct() maneje errores de validación.
     */
    it('should handle validation errors when adding product', () => {
      service.addProduct(newMockProduct).subscribe({
        next: () => fail('Expected an error, not success'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });
  });

  /**
   * Grupo de pruebas para el método deleteProduct().
   */
  describe('deleteProduct', () => {
    /**
     * Prueba que deleteProduct() elimine un producto correctamente.
     */
    it('should delete a product by ID', () => {
      const productId = 1;

      service.deleteProduct(productId).subscribe(response => {
        expect(response).toBeUndefined(); // void response
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    /**
     * Prueba que deleteProduct() maneje el caso de producto no encontrado.
     */
    it('should handle error when deleting non-existent product', () => {
      const productId = 999;

      service.deleteProduct(productId).subscribe({
        next: () => fail('Expected an error, not success'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });

    /**
     * Prueba que deleteProduct() use la URL correcta con el ID.
     */
    it('should use correct URL with product ID', () => {
      const productId = 42;

      service.deleteProduct(productId).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.url).toBe(`${apiUrl}/${productId}`);
      req.flush(null);
    });
  });

  /**
   * Grupo de pruebas para el método getProduct().
   */
  describe('getProduct', () => {
    /**
     * Prueba que getProduct() retorne un producto específico por ID.
     */
    it('should return a single product by ID', () => {
      const productId = 1;

      service.getProduct(productId).subscribe(product => {
        expect(product).toEqual(mockProduct);
        expect(product.id).toBe(productId);
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });

    /**
     * Prueba que getProduct() maneje el caso de producto no encontrado.
     */
    it('should handle error when product not found', () => {
      const productId = 999;

      service.getProduct(productId).subscribe({
        next: () => fail('Expected an error, not product'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  /**
   * Grupo de pruebas para el método updateProduct().
   */
  describe('updateProduct', () => {
    /**
     * Prueba que updateProduct() actualice un producto correctamente.
     */
    it('should update a product and return updated data', () => {
      const productId = 1;
      const updatedProduct: Product = {
        id: productId,
        name: 'iPhone 15 Pro Max',
        price: 1399990,
        stock: 5
      };

      service.updateProduct(productId, updatedProduct).subscribe(product => {
        expect(product).toEqual(updatedProduct);
        expect(product.name).toBe('iPhone 15 Pro Max');
        expect(product.price).toBe(1399990);
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedProduct);
      req.flush(updatedProduct);
    });

    /**
     * Prueba que updateProduct() maneje errores de validación.
     */
    it('should handle validation errors when updating product', () => {
      const productId = 1;
      const invalidProduct: Product = {
        id: productId,
        name: '',
        price: -100,
        stock: -5
      };

      service.updateProduct(productId, invalidProduct).subscribe({
        next: () => fail('Expected an error, not success'),
        error: (error) => {
          expect(error.status).toBe(400);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush('Validation error', { status: 400, statusText: 'Bad Request' });
    });

    /**
     * Prueba que updateProduct() maneje el caso de producto no encontrado.
     */
    it('should handle error when updating non-existent product', () => {
      const productId = 999;

      service.updateProduct(productId, mockProduct).subscribe({
        next: () => fail('Expected an error, not success'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${productId}`);
      req.flush('Product not found', { status: 404, statusText: 'Not Found' });
    });
  });

  /**
   * Grupo de pruebas de integración para verificar el flujo completo.
   */
  describe('Integration tests', () => {
    /**
     * Prueba el flujo completo de CRUD operations.
     */
    it('should perform complete CRUD operations flow', () => {
      // 1. Get initial products
      service.getProducts().subscribe(products => {
        expect(products).toEqual(mockProducts);
      });

      let req = httpMock.expectOne(apiUrl);
      req.flush(mockProducts);

      // 2. Add new product
      const newProduct = { name: 'New Product', price: 199990, stock: 30 };
      service.addProduct(newProduct).subscribe(product => {
        expect(product.id).toBeDefined();
      });

      req = httpMock.expectOne(apiUrl);
      req.flush({ ...newProduct, id: 4 });

      // 3. Update product
      const updatedProduct = { id: 4, name: 'Updated Product', price: 299990, stock: 25 };
      service.updateProduct(4, updatedProduct).subscribe(product => {
        expect(product.name).toBe('Updated Product');
      });

      req = httpMock.expectOne(`${apiUrl}/4`);
      req.flush(updatedProduct);

      // 4. Delete product
      service.deleteProduct(4).subscribe();

      req = httpMock.expectOne(`${apiUrl}/4`);
      req.flush(null);
    });
  });
});
