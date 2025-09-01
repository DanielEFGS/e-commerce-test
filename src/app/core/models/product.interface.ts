/**
 * Interface that defines the structure of a product in the e-commerce system.
 */
export interface Product {
  id?: number;
  name: string;
  price: number;
  stock: number;
}
