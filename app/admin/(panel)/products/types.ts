export interface ProductInput {
  name: string;
  categoryName: string;
  unit: string;
  quantityValue: number | null;
  price: number;
  stockQty: number;
  isAvailable: boolean;
  expiryDate: string | null;
}
