export type CreateProductDto = {
  name: string;
  description?: string | null;
  price: number;
  is_active?: boolean;
};
