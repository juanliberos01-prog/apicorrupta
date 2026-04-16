import api from './api';

export interface Category {
  id?: number;
  name: string;
  description: string;
}

export const categoryService = {
  async getAll() {
    const response = await api.get('/api/categories');
    return response.data.data;
  },

  async getById(id: number) {
    const response = await api.get(`/api/categories/${id}`);
    return response.data.data;
  },

  async create(category: Omit<Category, 'id'>) {
    const response = await api.post('/api/categories', category);
    return response.data.data;
  },

  async update(id: number, category: Omit<Category, 'id'>) {
    const response = await api.put(`/api/categories/${id}`, category);
    return response.data.data;
  },

  async deactivate(id: number) {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  },
};