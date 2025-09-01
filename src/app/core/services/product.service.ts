import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Product } from '../models/product.interface';

/**
 * Service to manage CRUD operations for products.
 * 
 * This service provides methods to interact with the REST API
 * for products, including read, create, update, and delete operations.
 * Uses the new inject() syntax for dependency injection.
 * 
 * @example
 * ```typescript
 * constructor() {
 *   private productService = inject(ProductService);
 * }
 * 
 * // Get all products
 * this.productService.getProducts().subscribe(products => {
 *   console.log(products);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  /** Base URL of the REST API for products */
  private readonly apiUrl = 'http://localhost:3000/products';
  
  /** HTTP client injected using inject() */
  private readonly http = inject(HttpClient);

  /**
   * Gets all products from the API.
   * 
   * Makes a GET request to the products endpoint to retrieve
   * the complete list of available products.
   * 
   * @returns Observable that emits an array of products
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Creates a new product in the API.
   * 
   * Sends a POST request to the products endpoint with the data
   * of the new product to create.
   * 
   * @param product - Product object with the data to create (without ID)
   * @returns Observable that emits the created product with its assigned ID
   */
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  /**
   * Deletes a product from the API.
   * 
   * Sends a DELETE request to the specific product endpoint
   * to permanently remove it.
   * 
   * @param id - Unique ID of the product to delete
   * @returns Observable that emits void when deletion is successful
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Gets a specific product by its ID.
   * 
   * Makes a GET request to the specific product endpoint
   * to retrieve its detailed data.
   * 
   * @param id - Unique ID of the product to get
   * @returns Observable that emits the found product
   */
  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Updates an existing product in the API.
   * 
   * Sends a PUT request to the specific product endpoint
   * with the new data to update.
   * 
   * @param id - Unique ID of the product to update
   * @param product - Product object with the updated data
   * @returns Observable that emits the updated product
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  /**
   * Resets the database to initial data.
   * 
   * Restores all products to their original state by deleting
   * all current products and recreating the initial data.
   * Uses a delete-all-and-recreate strategy since json-server
   * doesn't have a native reset endpoint.
   * 
   * @returns Observable that emits an array with the initial products
   * 
   * @example
   * ```typescript
   * this.productService.resetDatabase().subscribe({
   *   next: (products) => console.log('Database reset:', products),
   *   error: (error) => console.error('Reset error:', error)
   * });
   * ```
   */
  resetDatabase(): Observable<Product[]> {
    const initialProducts: Product[] = [
      { name: 'iPhone 15', price: 849990, stock: 10 },
      { name: 'MacBook Pro', price: 2499990, stock: 5 },
      { name: 'iPad Air', price: 649990, stock: 15 },
      { name: 'Apple Watch Series 9', price: 399990, stock: 20 },
      { name: 'AirPods Pro', price: 249990, stock: 25 },
      { name: 'Mac Studio', price: 1999990, stock: 3 }
    ];

    // First get all existing products and delete them
    return this.getProducts().pipe(
      switchMap((existingProducts: Product[]) => {
        // Delete all existing products
        const deleteRequests = existingProducts.map((product: Product) => 
          this.deleteProduct(product.id!)
        );
        
        // If no products exist, continue directly
        if (deleteRequests.length === 0) {
          return of([]);
        }
        
        return forkJoin(deleteRequests);
      }),
      switchMap(() => {
        // Create all initial products
        const createRequests = initialProducts.map((product: Product) => 
          this.addProduct(product)
        );
        
        return forkJoin(createRequests);
      })
    );
  }
}
