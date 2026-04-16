import api from './api';

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
}

export interface Address {
  id?: number;
  city: string;
  country: string;
  state: string;
  street: string;
  zipCode: string;
  isDefault: boolean;
}

export const userService = {
  async getProfile() {
    const response = await api.get('/api/users/me');
    return response.data.data;
  },

  async getPersonalInfo() {
    const response = await api.get('/api/users/me/personal-info');
    return response.data.data;
  },

  async updatePersonalInfo(info: PersonalInfo) {
    const response = await api.put('/api/users/me/personal-info', info);
    return response.data.data;
  },

  async getAddresses() {
    const response = await api.get('/api/users/me/addresses');
    return response.data.data;
  },

  async addAddress(address: Omit<Address, 'id'>) {
    const response = await api.post('/api/users/me/addresses', address);
    return response.data.data;
  },

  async updateAddress(addressId: number, address: Omit<Address, 'id'>) {
    const response = await api.put(`/api/users/me/addresses/${addressId}`, address);
    return response.data.data;
  },

  async deleteAddress(addressId: number) {
    const response = await api.delete(`/api/users/me/addresses/${addressId}`);
    return response.data;
  },

  async deactivateAccount() {
    const response = await api.delete('/api/users/me');
    return response.data;
  },
};