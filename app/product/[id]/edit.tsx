import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ProductForm, { ProductFormData } from '../../../components/ProductForm';
import { Product, productService } from '../../../services/products';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<(Product & { id: number }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  async function loadProduct() {
    try {
      const data = await productService.getById(Number(id));
      setProduct(data);
    } catch {
      Toast.show({ type: 'error', text1: 'Error al cargar el producto' });
      router.back();
    } finally {
      setIsFetching(false);
    }
  }

  async function handleUpdate(data: ProductFormData) {
    setIsLoading(true);
    try {
      await productService.update(Number(id), {
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || product?.imageUrl || '',
        description: data.description,
        brand: data.brand,
        model: data.model,
        weight: data.weight,
        color: data.color,
      });
      Toast.show({
        type: 'success',
        text1: 'Producto actualizado exitosamente',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar',
        text2: error?.response?.data?.message || 'Intenta de nuevo',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-4 pb-4 flex-row items-center border-b border-border">
        <TouchableOpacity
          className="mr-4 w-9 h-9 border border-border rounded-full items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text className="text-text-primary text-base">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-text-muted text-xs uppercase tracking-wider">
            Editar
          </Text>
          <Text className="text-text-primary text-xl font-bold tracking-tight">
            Actualizar producto
          </Text>
        </View>
        <View className="ml-auto w-1.5 h-8 bg-accent" />
      </View>

      {isFetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1A1A2E" />
          <Text className="text-text-muted text-sm mt-3">Cargando producto...</Text>
        </View>
      ) : product ? (
        <View className="flex-1 pt-5">
          <ProductForm
            initialValues={{
              name: product.name,
              categoryId: product.categoryId,
              price: product.price,
              stock: product.stock,
              imageUrl: product.imageUrl,
              description: product.description,
              brand: product.brand,
              model: product.model,
              weight: product.weight,
              color: product.color,
            }}
            onSubmit={handleUpdate}
            submitLabel="Guardar cambios"
            isLoading={isLoading}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}