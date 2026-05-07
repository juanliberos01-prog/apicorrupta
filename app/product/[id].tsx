import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FavoriteButton from '../../components/FavoriteButton';
import { useAuth } from '../../hooks/useAuth';
import { favoriteService } from '../../services/favorites';
import { Product, productService } from '../../services/products';

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text className="text-text-primary text-sm font-medium">{value}</Text>
    </View>
  );
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [product, setProduct] = useState<(Product & { id: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadFavoriteState();
    }, [id])
  );

  async function loadFavoriteState() {
    if (!id) {
      setIsFavorite(false);
      return;
    }
    try {
      const favorite = await favoriteService.isFavorite(Number(id));
      setIsFavorite(favorite);
    } catch {
      setIsFavorite(false);
    }
  }

  async function loadProduct() {
    try {
      const data = await productService.getById(Number(id));
      setProduct(data);
    } catch {
      setProduct(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleFavorite() {
    if (!id) return;
    await favoriteService.toggle(Number(id));
    loadFavoriteState();
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1A1A2E" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center px-5">
        <Text className="text-text-muted text-base">Producto no encontrado</Text>
        <TouchableOpacity
          className="mt-4 border border-border rounded-xl px-6 py-3"
          onPress={() => router.back()}
        >
          <Text className="text-text-primary text-sm font-medium">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button overlay */}
        <View className="absolute top-4 left-4 z-10">
          <TouchableOpacity
            className="bg-surface/90 border border-border rounded-full w-14 h-14 items-center justify-center"
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text className="text-text-primary font-medium text-3xl">←</Text>
          </TouchableOpacity>
        </View>

        {/* Product image */}
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-72 bg-surface-secondary"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-72 bg-surface-tertiary items-center justify-center">
            <Text className="text-text-muted">Sin imagen</Text>
          </View>
        )}

        <View className="px-5 pt-5 pb-10">
          {/* Title area */}
          <View className="mb-4">
            <View className="flex-row justify-between items-start">
              <View className="flex-1 pr-3">
                <Text className="text-text-muted text-xs uppercase tracking-widest mb-1">
                  {product.brand} · {product.model}
                </Text>
                <Text className="text-text-primary text-2xl font-bold tracking-tight leading-tight">
                  {product.name}
                </Text>
              </View>
              <FavoriteButton isFavorite={isFavorite} onPress={handleToggleFavorite} />
            </View>
            <View className="flex-row items-center mt-3 gap-3">
              <Text className="text-primary text-3xl font-bold">
                ${product.price?.toLocaleString('es-CO')}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  product.stock > 0 ? 'bg-success/10' : 'bg-danger/10'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    product.stock > 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          {product.description && (
            <View className="mb-5">
              <View className="w-8 h-0.5 bg-accent mb-3" />
              <Text className="text-text-secondary text-sm leading-relaxed">
                {product.description}
              </Text>
            </View>
          )}

          {/* Details */}
          <View className="bg-surface-secondary rounded-2xl px-4 border border-border mb-5">
            {product.color && <DetailRow label="Color" value={product.color} />}
            {product.weight && <DetailRow label="Peso" value={`${product.weight} kg`} />}
            {product.brand && <DetailRow label="Marca" value={product.brand} />}
            {product.model && <DetailRow label="Modelo" value={product.model} />}
          </View>

          {/* Edit button for sellers */}
          {isSeller && (
            <TouchableOpacity
              className="bg-primary rounded-xl py-4"
              onPress={() => router.push(`/product/${product.id}/edit`)}
              activeOpacity={0.85}
            >
              <Text className="text-text-inverse font-semibold text-center text-base">
                Editar producto
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}