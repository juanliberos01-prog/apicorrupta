import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButton from '../../components/FavoriteButton';
import { useAuth } from '../../hooks/useAuth';
import { favoriteService } from '../../services/favorites';
import { Product, productService } from '../../services/products';

function ProductCard({
  product,
  isFavorite,
  onToggleFavorite,
}: {
  product: Product & { id: number };
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-surface border border-border rounded-2xl overflow-hidden mb-4"
      onPress={() => router.push(`/product/${product.id}`)}
      activeOpacity={0.8}
    >
      <View className="relative">
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-44 bg-surface-secondary"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-44 bg-surface-tertiary items-center justify-center">
            <Text className="text-text-muted text-sm">Sin imagen</Text>
          </View>
        )}
        <View className="absolute top-2 right-2">
          <FavoriteButton isFavorite={isFavorite} onPress={onToggleFavorite} />
        </View>
      </View>
      <View className="p-4">
        <Text className="text-xs text-text-muted uppercase tracking-wider mb-1">
          {product.brand}
        </Text>
        <Text className="text-text-primary font-semibold text-base" numberOfLines={2}>
          {product.name}
        </Text>
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-primary font-bold text-lg">
            ${product.price?.toLocaleString('es-CO')}
          </Text>
          <View className="bg-surface-secondary px-3 py-1 rounded-full">
            <Text className="text-text-secondary text-xs">
              {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          className="bg-primary rounded-xl py-2.5 mt-3"
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Text className="text-text-inverse font-semibold text-center text-sm">
            Comprar
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<(Product & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<(Product & { id: number })[] | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavoriteIds();
    }, [])
  );

  async function loadFavoriteIds() {
    try {
      const ids = await favoriteService.getIds();
      setFavoriteIds(ids);
    } catch {
      setFavoriteIds([]);
    }
  }

  async function loadProducts() {
    try {
      const data = await productService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await loadProducts();
    setIsRefreshing(false);
  }

  async function handleSearch(text: string) {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    try {
      const data = await productService.search(text);
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      setSearchResults([]);
    }
  }

  async function handleToggleFavorite(productId: number) {
    await favoriteService.toggle(productId);
    loadFavoriteIds();
  }

  const displayProducts = searchResults !== null ? searchResults : products;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4 pb-3">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-text-muted text-sm">Hola, {user?.email?.split('@')[0]}</Text>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Catalogo
            </Text>
          </View>
          <View className="w-2 h-8 bg-accent" />
        </View>

        {/* Search */}
        <TextInput
          className="bg-surface-secondary border border-border rounded-xl px-4 py-3 text-text-primary text-sm"
          placeholder="Buscar productos..."
          placeholderTextColor="#A0A0A0"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
        </View>
      ) : (
        <FlatList
          data={displayProducts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              isFavorite={favoriteIds.includes(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-text-muted text-sm">
                {searchQuery ? 'Sin resultados' : 'No hay productos disponibles'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}