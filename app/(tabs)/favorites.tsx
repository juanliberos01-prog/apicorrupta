import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButton from '../../components/FavoriteButton';
import { favoriteService } from '../../services/favorites';
import { Product } from '../../services/products';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<(Product & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  async function loadFavorites() {
    setIsLoading(true);
    try {
      const data = await favoriteService.getFavoriteProducts();
      setFavorites(data);
      setFavoriteIds(data.map((item) => item.id));
    } catch {
      setFavorites([]);
      setFavoriteIds([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFavorite(productId: number) {
    await favoriteService.toggle(productId);
    loadFavorites();
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-text-muted text-sm uppercase tracking-wider">
              Mis favoritos
            </Text>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Favoritos
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-text-muted text-base text-center">
            Aún no agregaste productos a favoritos.
          </Text>
          <TouchableOpacity
            className="mt-5 bg-primary px-6 py-3 rounded-xl"
            onPress={() => router.push('/')}
            activeOpacity={0.85}
          >
            <Text className="text-text-inverse font-semibold">Explorar productos</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-surface border border-border rounded-2xl overflow-hidden mb-4"
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.85}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-40 bg-surface-secondary"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full h-40 bg-surface-tertiary items-center justify-center">
                  <Text className="text-text-muted text-sm">Sin imagen</Text>
                </View>
              )}
              <View className="p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1 pr-3">
                    <Text className="text-text-primary font-semibold text-base" numberOfLines={2}>
                      {item.name}
                    </Text>
                    <Text className="text-text-muted text-xs mt-1">{item.brand}</Text>
                  </View>
                  <FavoriteButton
                    isFavorite={favoriteIds.includes(item.id)}
                    onPress={async () => {
                      await handleToggleFavorite(item.id);
                    }}
                  />
                </View>
                <View className="flex-row justify-between items-center mt-4">
                  <Text className="text-primary font-bold text-lg">
                    ${item.price?.toLocaleString('es-CO')}
                  </Text>
                  <Text className="text-text-muted text-xs">
                    {item.stock > 0 ? `Stock: ${item.stock}` : 'Agotado'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
