import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ProductForm, { ProductFormData } from '../../components/ProductForm';
import { productService } from '../../services/products';

export default function CreateProductScreen() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(data: ProductFormData) {
    setIsLoading(true);
    try {
      await productService.create({
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl || '',
        description: data.description,
        brand: data.brand,
        model: data.model,
        weight: data.weight,
        color: data.color,
      });
      Toast.show({
        type: 'success',
        text1: 'Producto creado exitosamente',
      });
      router.back();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al crear producto',
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
            Nuevo
          </Text>
          <Text className="text-text-primary text-xl font-bold tracking-tight">
            Crear producto
          </Text>
        </View>
        <View className="ml-auto w-1.5 h-8 bg-accent" />
      </View>

      <View className="flex-1 pt-5">
        <ProductForm
          onSubmit={handleCreate}
          submitLabel="Publicar producto"
          isLoading={isLoading}
        />
      </View>
    </SafeAreaView>
  );
}