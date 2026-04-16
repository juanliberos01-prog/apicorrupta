import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { Category, categoryService } from '../services/categories';
import { uploadImageToCloudinary } from '../services/cloudinary';

const productSchema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  categoryId: z.number({ message: 'Selecciona una categoría' }),
  price: z.number({ message: 'Precio requerido' }).positive('Debe ser mayor a 0'),
  stock: z.number({ message: 'Stock requerido' }).int().min(0, 'Mínimo 0'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  brand: z.string().min(2, 'Mínimo 2 caracteres'),
  model: z.string().min(2, 'Mínimo 2 caracteres'),
  weight: z.number().positive('Debe ser mayor a 0'),
  color: z.string().min(2, 'Mínimo 2 caracteres'),
  imageUrl: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialValues?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  submitLabel: string;
  isLoading: boolean;
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Text className="text-sm font-medium text-text-primary mb-2">
      {text}
      {required && <Text className="text-danger"> *</Text>}
    </Text>
  );
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel,
  isLoading,
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initialValues?.imageUrl || null
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name || '',
      categoryId: initialValues?.categoryId,
      price: initialValues?.price,
      stock: initialValues?.stock ?? 0,
      description: initialValues?.description || '',
      brand: initialValues?.brand || '',
      model: initialValues?.model || '',
      weight: initialValues?.weight,
      color: initialValues?.color || '',
      imageUrl: initialValues?.imageUrl || '',
    },
  });

  const selectedCategoryId = watch('categoryId');

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesita acceso a la galería para subir imágenes.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setIsUploadingImage(true);
      try {
        const uploaded = await uploadImageToCloudinary(uri);
        setSelectedImage(uploaded.url);
        setValue('imageUrl', uploaded.url);
        Toast.show({ type: 'success', text1: 'Imagen subida correctamente' });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error al subir imagen',
          text2: error.message || 'Verifica tu configuración de Cloudinary',
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesita acceso a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setIsUploadingImage(true);
      try {
        const uploaded = await uploadImageToCloudinary(uri);
        setSelectedImage(uploaded.url);
        setValue('imageUrl', uploaded.url);
        Toast.show({ type: 'success', text1: 'Foto subida correctamente' });
      } catch (error: any) {
        Toast.show({
          type: 'error',
          text1: 'Error al subir foto',
          text2: error.message,
        });
      } finally {
        setIsUploadingImage(false);
      }
    }
  }

  function showImageOptions() {
    Alert.alert('Agregar imagen', 'Selecciona el origen de la imagen', [
      { text: 'Galería', onPress: pickImage },
      { text: 'Cámara', onPress: takePhoto },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  const selectedCategory = categories.find((c: any) => c.id === selectedCategoryId);

  const textFields = [
    { name: 'name' as const, label: 'Nombre del producto', placeholder: 'Samsung Galaxy A13', required: true },
    { name: 'description' as const, label: 'Descripción', placeholder: 'Describe el producto...', multiline: true, required: true },
    { name: 'brand' as const, label: 'Marca', placeholder: 'Samsung', required: true },
    { name: 'model' as const, label: 'Modelo', placeholder: 'Galaxy A13 SM-A135F', required: true },
    { name: 'color' as const, label: 'Color', placeholder: 'Negro Profundo', required: true },
  ];

  const numericFields = [
    { name: 'price' as const, label: 'Precio (COP)', placeholder: '299999.99', required: true },
    { name: 'stock' as const, label: 'Stock disponible', placeholder: '50', required: true },
    { name: 'weight' as const, label: 'Peso (kg)', placeholder: '0.192', required: true },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="gap-5 px-5">
        {/* Image upload */}
        <View>
          <FieldLabel text="Imagen del producto" />
          <TouchableOpacity
            className="border-2 border-dashed border-border rounded-2xl overflow-hidden"
            onPress={showImageOptions}
            disabled={isUploadingImage}
            activeOpacity={0.8}
          >
            {isUploadingImage ? (
              <View className="h-44 items-center justify-center gap-2">
                <ActivityIndicator size="large" color="#1A1A2E" />
                <Text className="text-text-muted text-sm">Subiendo imagen...</Text>
              </View>
            ) : selectedImage ? (
              <View>
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full h-44"
                  resizeMode="cover"
                />
                <View className="absolute bottom-2 right-2 bg-primary/80 px-3 py-1 rounded-full">
                  <Text className="text-text-inverse text-xs">Cambiar</Text>
                </View>
              </View>
            ) : (
              <View className="h-44 items-center justify-center gap-2">
                <Text className="text-text-muted text-3xl">+</Text>
                <Text className="text-text-muted text-sm">Toca para agregar imagen</Text>
                <Text className="text-text-muted text-xs">Se subirá a Cloudinary</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category picker */}
        <View>
          <FieldLabel text="Categoría" required />
          <TouchableOpacity
            className={`bg-surface-secondary border rounded-xl px-4 py-4 flex-row justify-between items-center ${
              errors.categoryId ? 'border-danger' : 'border-border'
            }`}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            activeOpacity={0.8}
          >
            <Text
              className={selectedCategory ? 'text-text-primary text-base' : 'text-text-muted text-base'}
            >
              {selectedCategory ? (selectedCategory as any).name : 'Selecciona una categoría'}
            </Text>
            <Text className="text-text-muted">{showCategoryPicker ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {errors.categoryId && (
            <Text className="text-danger text-xs mt-1">{errors.categoryId.message}</Text>
          )}
          {showCategoryPicker && (
            <View className="bg-surface border border-border rounded-xl mt-1 overflow-hidden">
              {categories.length === 0 ? (
                <View className="py-4 items-center">
                  <Text className="text-text-muted text-sm">Sin categorías disponibles</Text>
                </View>
              ) : (
                categories.map((cat: any) => (
                  <TouchableOpacity
                    key={cat.id}
                    className={`px-4 py-3 border-b border-border ${
                      selectedCategoryId === cat.id ? 'bg-primary/5' : ''
                    }`}
                    onPress={() => {
                      setValue('categoryId', cat.id);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        selectedCategoryId === cat.id
                          ? 'text-primary font-semibold'
                          : 'text-text-primary'
                      }`}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>

        {/* Text fields */}
        {textFields.map((field) => (
          <View key={field.name}>
            <FieldLabel text={field.label} required={field.required} />
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-secondary border rounded-xl px-4 py-4 text-text-primary text-base ${
                    errors[field.name] ? 'border-danger' : 'border-border'
                  } ${field.multiline ? 'min-h-[90px]' : ''}`}
                  placeholder={field.placeholder}
                  placeholderTextColor="#A0A0A0"
                  multiline={field.multiline}
                  textAlignVertical={field.multiline ? 'top' : 'center'}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value as string}
                />
              )}
            />
            {errors[field.name] && (
              <Text className="text-danger text-xs mt-1">
                {errors[field.name]?.message}
              </Text>
            )}
          </View>
        ))}

        {/* Numeric fields */}
        {numericFields.map((field) => (
          <View key={field.name}>
            <FieldLabel text={field.label} required={field.required} />
            <Controller
              control={control}
              name={field.name}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-surface-secondary border rounded-xl px-4 py-4 text-text-primary text-base ${
                    errors[field.name] ? 'border-danger' : 'border-border'
                  }`}
                  placeholder={field.placeholder}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="decimal-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => {
                    const num = parseFloat(text.replace(',', '.'));
                    onChange(isNaN(num) ? undefined : num);
                  }}
                  value={value !== undefined ? String(value) : ''}
                />
              )}
            />
            {errors[field.name] && (
              <Text className="text-danger text-xs mt-1">
                {(errors[field.name] as any)?.message}
              </Text>
            )}
          </View>
        ))}

        {/* Submit */}
        <TouchableOpacity
          className="bg-primary rounded-xl py-4 mt-2"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading || isUploadingImage}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-text-inverse font-semibold text-center text-base">
              {submitLabel}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}