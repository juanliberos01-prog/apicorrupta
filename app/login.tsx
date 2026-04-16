import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(4, 'Mínimo 4 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginForm) {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al iniciar sesión',
        text2: error?.response?.data?.message || 'Verifica tus credenciales',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-16 pb-8">
            {/* Header */}
            <View className="mb-12">
              <View className="w-10 h-1 bg-accent mb-6" />
              <Text className="text-4xl font-bold text-text-primary tracking-tight">
                Bienvenido
              </Text>
              <Text className="text-text-secondary mt-2 text-base">
                Ingresa a tu cuenta para continuar
              </Text>
            </View>

            {/* Form */}
            <View className="gap-5">
              <View>
                <Text className="text-sm font-medium text-text-primary mb-2">
                  Correo electrónico
                </Text>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-surface-secondary border rounded-xl px-4 py-4 text-text-primary text-base ${
                        errors.email ? 'border-danger' : 'border-border'
                      }`}
                      placeholder="tu@correo.com"
                      placeholderTextColor="#A0A0A0"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.email && (
                  <Text className="text-danger text-xs mt-1">
                    {errors.email.message}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-sm font-medium text-text-primary mb-2">
                  Contraseña
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      className={`bg-surface-secondary border rounded-xl px-4 py-4 text-text-primary text-base ${
                        errors.password ? 'border-danger' : 'border-border'
                      }`}
                      placeholder="••••••••"
                      placeholderTextColor="#A0A0A0"
                      secureTextEntry
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                {errors.password && (
                  <Text className="text-danger text-xs mt-1">
                    {errors.password.message}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="bg-primary rounded-xl py-4 mt-2"
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-text-inverse font-semibold text-center text-base">
                    Iniciar sesión
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Demo credentials */}
            <View className="mt-6 p-4 bg-surface-secondary rounded-xl border border-border">
              <Text className="text-xs font-medium text-text-secondary mb-1">
                Credenciales de prueba (admin)
              </Text>
              <Text className="text-xs text-text-muted font-mono">
                admin@ecommerce.com
              </Text>
            </View>

            {/* Footer */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-text-secondary text-sm">
                No tienes cuenta?{' '}
              </Text>
              <Link href="/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">
                    Registrarse
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}