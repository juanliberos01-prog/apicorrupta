import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product, productService } from './products';

const FAVORITES_KEY = 'favoriteProductIds';

async function getStoredIds(): Promise<number[]> {
  const stored = await AsyncStorage.getItem(FAVORITES_KEY);
  if (!stored) return [];
  try {
    const value = JSON.parse(stored);
    return Array.isArray(value) ? value.filter((id) => typeof id === 'number') : [];
  } catch {
    return [];
  }
}

async function saveIds(ids: number[]) {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
}

export const favoriteService = {
  async getIds() {
    return getStoredIds();
  },

  async isFavorite(productId: number) {
    const ids = await getStoredIds();
    return ids.includes(productId);
  },

  async add(productId: number) {
    const ids = await getStoredIds();
    if (!ids.includes(productId)) {
      ids.push(productId);
      await saveIds(ids);
    }
    return ids;
  },

  async remove(productId: number) {
    const ids = await getStoredIds();
    const filtered = ids.filter((id) => id !== productId);
    await saveIds(filtered);
    return filtered;
  },

  async toggle(productId: number) {
    const ids = await getStoredIds();
    const updated = ids.includes(productId)
      ? ids.filter((id) => id !== productId)
      : [...ids, productId];
    await saveIds(updated);
    return updated;
  },

  async getFavoriteProducts() {
    const ids = await getStoredIds();
    if (ids.length === 0) return [];
    const products = await Promise.all(
      ids.map(async (id) => {
        try {
          return await productService.getById(id);
        } catch {
          return null;
        }
      })
    );
    return products.filter((product): product is Product & { id: number } => !!product);
  },
};
