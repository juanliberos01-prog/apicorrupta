import api from './api';

export interface Product {
  id?: number;
  name: string;
  categoryId: number;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  brand: string;
  model: string;
  weight: number;
  color: string;
}

export interface ProductFilter {
  name?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  color?: string;
  inStockOnly?: boolean;
}

export const productService = {
  async getAll() {
    const response = await api.get('/api/products');
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get(`/api/products/${id}`);
    return response.data.data;
  },

  async create(product: Omit<Product, 'id'>) {
    const response = await api.post('/api/products', product);
    return response.data.data;
  },

  async update(id: number, product: Partial<Omit<Product, 'id'>>) {
    const response = await api.put(`/api/products/${id}`, product);
    return response.data.data;
  },

  async deactivate(id: number) {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  },

  async search(name: string) {
    const response = await api.get('/api/products/search', { params: { name } });
    return response.data.data;
  },

  async filterByPrice(min: number, max: number) {
    const response = await api.get('/api/products/price', { params: { min, max } });
    return response.data.data;
  },

  async filter(filters: ProductFilter) {
    const response = await api.get('/api/products/filter', { params: filters });
    return response.data.data;
  },

  async getByCategory(categoryId: number) {
    const response = await api.get(`/api/products/category/${categoryId}`);
    return response.data.data;
  },

  async getBySeller(sellerId: number) {
    const response = await api.get(`/api/products/seller/${sellerId}`);
    return response.data.data;
  },
};