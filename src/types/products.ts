export type {
  Product,
  ProductPaginatedResponse,
  ProductWithGarnishes,
} from "../dtos/ProductDTO";

// Alias para compatibilidade
import type { ProductPaginatedResponse } from "../dtos/ProductDTO";
export type ProductsResponse = ProductPaginatedResponse;
