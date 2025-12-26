// Tipos relacionados a produtos

export interface OptionItem {
  id: string;
  name: string;
  price?: number | null;
}

export interface OptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  minSelections: number;
  maxSelections: number;
  items: OptionItem[];
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl: string;
  category: string;
  restaurantId: string;
  optionGroupIds?: string[];
  optionGroups?: OptionGroup[];
  createdAt: string | Date | number;
  updatedAt: string | Date | number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl: string;
  optionGroups: {
    name: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    items: {
      name: string;
      price?: number;
    }[];
  }[];
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  optionGroups?: {
    name: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    items: {
      name: string;
      price?: number;
    }[];
  }[];
}

export interface ProductsResponse {
  products: Product[];
  meta: {
    totalItems: number;
    totalPages: number;
    page: number;
    size: number;
  };
}
