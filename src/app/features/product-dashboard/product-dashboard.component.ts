import { Component, OnInit, inject, TemplateRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { NgbModal, NgbModalRef, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '@core/services/product.service';
import { Product } from '@core/models/product.interface';
import { ClpCurrencyPipe } from '@shared/pipes';

@Component({
  selector: 'app-product-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ClpCurrencyPipe, NgbModalModule],
  templateUrl: './product-dashboard.component.html',
  styleUrl: './product-dashboard.component.scss'
})
export class ProductDashboardComponent implements OnInit {
  @ViewChild('productModal') productModal!: TemplateRef<any>;
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: TemplateRef<any>;

  products$: Observable<Product[]> = new Observable();
  products: Product[] = [];
  
  productToDelete: number | null = null;
  productForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  
  private modalRef: NgbModalRef | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  private readonly productService = inject(ProductService);
  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Loads the list of products from the service.
   * 
   * Executes a request to the service to get all available
   * products and updates the component state. Handles loading
   * states and errors.
   */
  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.products$ = this.productService.getProducts();
    this.products$.subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Error loading products. Make sure json-server is running.';
        this.isLoading = false;
        console.error('Error loading products:', error);
      }
    });
  }

  /**
   * Opens the modal to create a new product.
   * 
   * Shows the creation modal and resets the form to
   * ensure it's clean for the new product.
   */
  openModal(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.productForm.reset();
    this.modalRef = this.modalService.open(this.productModal, { 
      size: 'lg',
      backdrop: 'static'
    });
  }

  /**
   * Closes the product creation modal.
   * 
   * Hides the modal and resets the form to clear
   * any previously entered data.
   */
  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
    this.productForm.reset();
  }

  /**
   * Processes the form submission to create a new product.
   * 
   * Validates the form and if valid, sends the data to the service
   * to create the product. Updates the local list and closes the modal
   * on success.
   */
  onSubmit(): void {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value;
      this.productService.addProduct(newProduct).subscribe({
        next: (product: Product) => {
          this.products.push(product);
          this.closeModal();
        },
        error: (error: any) => {
          this.errorMessage = 'Error adding the product';
          console.error('Error adding product:', error);
        }
      });
    }
  }

  /**
   * Deletes a product after user confirmation.
   * 
   * Shows a confirmation dialog and, if the user accepts,
   * deletes the product from the server and updates the local list.
   * 
   * @param id - Unique ID of the product to delete
   */
  deleteProduct(id: number): void {
    console.log('Deleting product with ID:', id);
    
    // Verify that the ID is valid
    if (!id) {
      console.error('Product ID is invalid:', id);
      this.errorMessage = 'Error: Invalid product ID';
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Show confirmation modal
    this.productToDelete = id;
    this.modalRef = this.modalService.open(this.deleteConfirmModal, {
      size: 'sm',
      backdrop: 'static'
    });
  }

  /**
   * Confirms the deletion of the product
   */
  confirmDelete(): void {
    if (this.productToDelete && this.modalRef) {
      this.isLoading = true;
      this.errorMessage = '';
      this.modalRef.close();
      
      this.productService.deleteProduct(this.productToDelete).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          this.products = this.products.filter(product => product.id !== this.productToDelete);
          this.isLoading = false;
          this.productToDelete = null;
        },
        error: (error: any) => {
          this.errorMessage = 'Error deleting the product. Verify that json-server is running.';
          this.isLoading = false;
          console.error('Error deleting product:', error);
          this.productToDelete = null;
        }
      });
    }
  }

  /**
   * Cancels the deletion of the product
   */
  cancelDelete(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
    this.productToDelete = null;
  }

  /**
   * Tracking function to optimize *ngFor performance.
   * 
   * Angular uses this function to uniquely identify each element
   * in the list, avoiding unnecessary DOM element recreation when
   * the list changes.
   * 
   * @param index - Index of the element in the array
   * @param product - Current product object
   * @returns Unique ID of the product or the index as fallback
   */
  trackByProductId(index: number, product: Product): number {
    return product.id || index;
  }

  /**
   * Getter to access the 'name' form control.
   * 
   * Provides direct access to the name FormControl for
   * validations and showing errors in the template.
   * 
   * @returns FormControl of the name field
   */
  get name() { 
    return this.productForm.get('name'); 
  }
  
  /**
   * Getter to access the 'price' form control.
   * 
   * Provides direct access to the price FormControl for
   * validations and showing errors in the template.
   * 
   * @returns FormControl of the price field
   */
  get price() { 
    return this.productForm.get('price'); 
  }
  
  /**
   * Getter to access the 'stock' form control.
   * 
   * Provides direct access to the stock FormControl for
   * validations and showing errors in the template.
   * 
   * @returns FormControl of the stock field
   */
  get stock() { 
    return this.productForm.get('stock'); 
  }

  /**
   * Resets the database to initial data.
   * 
   * Shows a confirmation to the user and, if accepted, deletes all
   * current products and restores the original application data.
   * Useful for testing and demos.
   */
  resetDatabase(): void {
    const confirmMessage = 'Are you sure you want to reset the database? This will delete all changes and restore the original data.';
    
    if (confirm(confirmMessage)) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.productService.resetDatabase().subscribe({
        next: (products: Product[]) => {
          this.products = products;
          this.isLoading = false;
          // Show temporary success message
          this.errorMessage = '';
          console.log('Database reset successfully');
        },
        error: (error: any) => {
          this.errorMessage = 'Error resetting the database. Verify that json-server is running.';
          this.isLoading = false;
          console.error('Error resetting database:', error);
        }
      });
    }
  }
}
