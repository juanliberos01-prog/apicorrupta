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
import { authService } from '../services/auth';

const registerSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  identificationNumber: z.string().min(5, 'Número de identificación inválido'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['BUYER', 'SELLER']),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      identificationNumber: '',
      email: '',
      password: '',
      role: 'BUYER',
    },
  });

  const selectedRole = watch('role');

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true);
    try {
      await authService.register(data);
      Toast.show({
        type: 'success',
        text1: 'Cuenta creada exitosamente',
        text2: 'Ahora puedes iniciar sesión',
      });
      router.replace('/login');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al registrarse',
        text2: error?.response?.data?.message || 'Intenta de nuevo',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const fields = [
    { name: 'firstName' as const, label: 'Nombre', placeholder: 'Carlos' },
    { name: 'lastName' as const, label: 'Apellidos', placeholder: 'Rodríguez López' },
    { name: 'identificationNumber' as const, label: 'Número de identificación', placeholder: '1023456789', keyboardType: 'numeric' as const },
    { name: 'email' as const, label: 'Correo electrónico', placeholder: 'tu@correo.com', keyboardType: 'email-address' as const },
    { name: 'password' as const, label: 'Contraseña', placeholder: '••••••••', secure: true },
  ];

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
          <View className="px-6 pt-12 pb-8">
            {/* Header */}
            <View className="mb-10">
              <View className="w-10 h-1 bg-accent mb-6" />
              <Text className="text-4xl font-bold text-text-primary tracking-tight">
                Crear cuenta
              </Text>
              <Text className="text-text-secondary mt-2 text-base">
                Únete a nuestra plataforma
              </Text>
            </View>

            {/* Role selector */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-primary mb-3">
                Tipo de cuenta
              </Text>
              <View className="flex-row gap-3">
                {(['BUYER', 'SELLER'] as const).map((role) => (
                  <TouchableOpacity
                    key={role}
                    className={`flex-1 py-3 rounded-xl border ${
                      selectedRole === role
                        ? 'bg-primary border-primary'
                        : 'bg-surface-secondary border-border'
                    }`}
                    onPress={() => setValue('role', role)}
                    activeOpacity={0.8}
                  >
                    <Text
                      className={`text-center font-medium text-sm ${
                        selectedRole === role ? 'text-text-inverse' : 'text-text-secondary'
                      }`}
                    >
                      {role === 'BUYER' ? 'Comprador' : 'Vendedor'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Fields */}
            <View className="gap-4">
              {fields.map((field) => (
                <View key={field.name}>
                  <Text className="text-sm font-medium text-text-primary mb-2">
                    {field.label}
                  </Text>
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
                        secureTextEntry={field.secure}
                        keyboardType={field.keyboardType || 'default'}
                        autoCapitalize={field.name === 'email' ? 'none' : 'words'}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
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
                    Crear cuenta
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-text-secondary text-sm">
                Ya tienes cuenta?{' '}
              </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary font-semibold text-sm">
                    Iniciar sesión
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