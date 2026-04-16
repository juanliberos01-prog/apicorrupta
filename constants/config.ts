export const API_BASE_URL = 'https://ecommerce-api.wittysky-ae597b7e.westus2.azurecontainerapps.io';

export const CLOUDINARY_CONFIG = {
  cloudName: 'dqlqocggj',         
  uploadPreset: 'eavect41',   
  apiUrl: 'https://api.cloudinary.com/v1_1/dqlqocggj/image/upload',
};

export const AES_KEY = '0123456789ABCDEF0123456789ABCDEF'; 

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  HOME: '/(tabs)',
  PRODUCTS: '/(tabs)/products',
  PROFILE: '/(tabs)/profile',
  PRODUCT_DETAIL: '/product/[id]',
  PRODUCT_CREATE: '/product/create',
  PRODUCT_EDIT: '/product/[id]/edit',
};