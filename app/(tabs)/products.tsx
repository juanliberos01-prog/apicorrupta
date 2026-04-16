import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../hooks/useAuth';
import { Product, productService } from '../../services/products';

function SellerProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product & { id: number };
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View className="bg-surface border border-border rounded-2xl overflow-hidden mb-4">
      <TouchableOpacity onPress={() => router.push(`/product/${product.id}`)} activeOpacity={0.9}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            className="w-full h-36 bg-surface-secondary"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-36 bg-surface-tertiary items-center justify-center">
            <Text className="text-text-muted text-sm">Sin imagen</Text>
          </View>
        )}
      </TouchableOpacity>
      <View className="p-4">
        <Text className="text-xs text-text-muted uppercase tracking-wider mb-1">
          {product.brand}
        </Text>
        <Text className="text-text-primary font-semibold text-base" numberOfLines={1}>
          {product.name}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-primary font-bold text-base">
            ${product.price?.toLocaleString('es-CO')}
          </Text>
          <Text className="text-text-muted text-xs">Stock: {product.stock}</Text>
        </View>
        <View className="flex-row gap-2 mt-3">
          <TouchableOpacity
            className="flex-1 border border-border rounded-xl py-2.5"
            onPress={onEdit}
            activeOpacity={0.8}
          >
            <Text className="text-text-primary font-medium text-center text-sm">
              Editar
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 border border-danger rounded-xl py-2.5"
            onPress={onDelete}
            activeOpacity={0.8}
          >
            <Text className="text-danger font-medium text-center text-sm">
              Desactivar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function ProductsScreen() {
  const { user } = useAuth();
  const [products, setProducts] = useState<(Product & { id: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      let data;
      if (isSeller && user?.userId) {
        data = await productService.getBySeller(user.userId);
      } else {
        data = await productService.getAll();
      }
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

  function confirmDelete(productId: number, productName: string) {
    Alert.alert(
      'Desactivar producto',
      `¿Deseas desactivar "${productName}"? Esta acción es reversible desde el administrador.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: () => deleteProduct(productId),
        },
      ]
    );
  }

  async function deleteProduct(productId: number) {
    try {
      await productService.deactivate(productId);
      Toast.show({ type: 'success', text1: 'Producto desactivado' });
      loadProducts();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'No se pudo desactivar',
      });
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <View className="px-5 pt-4 pb-3">
        <View className="flex-row justify-between items-center mb-5">
          <View>
            <Text className="text-text-muted text-sm uppercase tracking-wider">
              {isSeller ? 'Mis productos' : 'Catalogo'}
            </Text>
            <Text className="text-text-primary text-2xl font-bold tracking-tight">
              Productos
            </Text>
          </View>
          {isSeller && (
            <TouchableOpacity
              className="bg-primary px-4 py-2.5 rounded-xl"
              onPress={() => router.push('/product/create')}
              activeOpacity={0.85}
            >
              <Text className="text-text-inverse font-semibold text-sm">
                + Nuevo
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) =>
            isSeller ? (
              <SellerProductCard
                product={item}
                onEdit={() => router.push(`/product/${item.id}/edit`)}
                onDelete={() => confirmDelete(item.id, item.name)}
              />
            ) : (
              <TouchableOpacity
                className="bg-surface border border-border rounded-2xl overflow-hidden mb-4"
                onPress={() => router.push(`/product/${item.id}`)}
                activeOpacity={0.8}
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
                  <Text className="text-text-primary font-semibold" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-primary font-bold mt-1">
                    ${item.price?.toLocaleString('es-CO')}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Text className="text-text-muted text-sm">
                {isSeller
                  ? 'Aun no tienes productos. Crea el primero.'
                  : 'No hay productos disponibles'}
              </Text>
              {isSeller && (
                <TouchableOpacity
                  className="mt-4 bg-primary px-6 py-3 rounded-xl"
                  onPress={() => router.push('/product/create')}
                >
                  <Text className="text-text-inverse font-semibold">
                    Crear producto
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}