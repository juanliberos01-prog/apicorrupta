import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { Address, userService } from '../../services/users';

const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

function SectionHeader({ title }: { title: string }) {
  return (
    <View className="flex-row items-center mb-4 mt-6">
      <View className="w-1 h-5 bg-accent mr-3" />
      <Text className="text-text-primary font-semibold text-base">{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-border">
      <Text className="text-text-secondary text-sm">{label}</Text>
      <Text className="text-text-primary text-sm font-medium">{value || '—'}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      dateOfBirth: '',
    },
  });

  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    city: '',
    country: '',
    state: '',
    street: '',
    zipCode: '',
    isDefault: false,
  });

  useEffect(() => {
    loadProfile();
    loadAddresses();
  }, []);

  async function loadProfile() {
    try {
      const data = await userService.getPersonalInfo();
      setProfileData(data);
      reset({
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        phoneNumber: data?.phoneNumber || '',
        dateOfBirth: data?.dateOfBirth || '',
      });
    } catch {
      // silently fail
    } finally {
      setIsLoadingProfile(false);
    }
  }

  async function loadAddresses() {
    try {
      const data = await userService.getAddresses();
      setAddresses(Array.isArray(data) ? data : []);
    } catch {
      setAddresses([]);
    }
  }

  async function savePersonalInfo(data: PersonalInfoForm) {
    setIsSavingInfo(true);
    try {
      await userService.updatePersonalInfo(data);
      setProfileData({ ...profileData, ...data });
      setIsEditingInfo(false);
      Toast.show({ type: 'success', text1: 'Información actualizada' });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al actualizar',
        text2: error?.response?.data?.message || 'Intenta de nuevo',
      });
    } finally {
      setIsSavingInfo(false);
    }
  }

  async function handleAddAddress() {
    if (!newAddress.city || !newAddress.country || !newAddress.street) {
      Toast.show({ type: 'error', text1: 'Completa los campos obligatorios' });
      return;
    }
    try {
      await userService.addAddress(newAddress);
      Toast.show({ type: 'success', text1: 'Dirección agregada' });
      setShowAddAddress(false);
      setNewAddress({ city: '', country: '', state: '', street: '', zipCode: '', isDefault: false });
      loadAddresses();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error al agregar dirección',
        text2: error?.response?.data?.message || 'Intenta de nuevo',
      });
    }
  }

  async function handleDeleteAddress(addressId: number) {
    Alert.alert('Eliminar dirección', '¿Deseas eliminar esta dirección?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await userService.deleteAddress(addressId);
            Toast.show({ type: 'success', text1: 'Dirección eliminada' });
            loadAddresses();
          } catch {
            Toast.show({ type: 'error', text1: 'Error al eliminar dirección' });
          }
        },
      },
    ]);
  }

  function confirmLogout() {
    Alert.alert('Cerrar sesión', '¿Deseas cerrar tu sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login');
        },
      },
    ]);
  }

  function confirmDeactivate() {
    Alert.alert(
      'Desactivar cuenta',
      'Esta acción desactivará tu cuenta permanentemente. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deactivateAccount();
              await logout();
              router.replace('/login');
            } catch {
              Toast.show({ type: 'error', text1: 'Error al desactivar cuenta' });
            }
          },
        },
      ]
    );
  }

  if (isLoadingProfile) {
    return (
      <SafeAreaView className="flex-1 bg-surface items-center justify-center">
        <ActivityIndicator size="large" color="#1A1A2E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-5 pt-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-text-muted text-sm uppercase tracking-wider">
                Cuenta
              </Text>
              <Text className="text-text-primary text-2xl font-bold tracking-tight">
                Mi perfil
              </Text>
            </View>
            <View className="w-2 h-8 bg-accent" />
          </View>

          {/* Account summary */}
          <View className="bg-surface-secondary rounded-2xl p-4 mt-4 border border-border">
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-primary items-center justify-center mr-3">
                <Text className="text-text-inverse font-bold text-lg">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-base">
                  {profileData?.firstName
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : user?.email}
                </Text>
                <Text className="text-text-muted text-sm">{user?.email}</Text>
                <View className="bg-primary/10 px-2 py-0.5 rounded-full mt-1 self-start">
                  <Text className="text-primary text-xs font-medium">{user?.role}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Personal Info Section */}
          <View className="flex-row justify-between items-center mt-6 mb-4">
            <View className="flex-row items-center">
              <View className="w-1 h-5 bg-accent mr-3" />
              <Text className="text-text-primary font-semibold text-base">
                Información personal
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsEditingInfo(!isEditingInfo)}
              className="px-3 py-1.5 border border-border rounded-lg"
            >
              <Text className="text-text-secondary text-xs font-medium">
                {isEditingInfo ? 'Cancelar' : 'Editar'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditingInfo ? (
            <View className="bg-surface-secondary rounded-2xl p-4 border border-border gap-3">
              {[
                { name: 'firstName' as const, label: 'Nombre', placeholder: 'Carlos' },
                { name: 'lastName' as const, label: 'Apellidos', placeholder: 'Rodríguez' },
                { name: 'phoneNumber' as const, label: 'Teléfono', placeholder: '+57 300 000 0000', keyboard: 'phone-pad' as const },
                { name: 'dateOfBirth' as const, label: 'Fecha de nacimiento', placeholder: '1990-01-15' },
              ].map((field) => (
                <View key={field.name}>
                  <Text className="text-xs text-text-secondary mb-1">{field.label}</Text>
                  <Controller
                    control={control}
                    name={field.name}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className={`bg-surface border rounded-xl px-4 py-3 text-text-primary text-sm ${
                          errors[field.name] ? 'border-danger' : 'border-border'
                        }`}
                        placeholder={field.placeholder}
                        placeholderTextColor="#A0A0A0"
                        keyboardType={field.keyboard}
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
                className="bg-primary rounded-xl py-3 mt-1"
                onPress={handleSubmit(savePersonalInfo)}
                disabled={isSavingInfo}
                activeOpacity={0.85}
              >
                {isSavingInfo ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text className="text-text-inverse font-semibold text-center text-sm">
                    Guardar cambios
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-surface-secondary rounded-2xl px-4 border border-border">
              <InfoRow label="Nombre" value={profileData?.firstName || ''} />
              <InfoRow label="Apellidos" value={profileData?.lastName || ''} />
              <InfoRow label="Teléfono" value={profileData?.phoneNumber || ''} />
              <InfoRow label="Fecha de nacimiento" value={profileData?.dateOfBirth || ''} />
            </View>
          )}

          {/* Addresses Section */}
          <SectionHeader title="Direcciones" />

          {addresses.map((addr: any) => (
            <View
              key={addr.id}
              className="bg-surface-secondary rounded-2xl p-4 mb-3 border border-border"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-text-primary font-medium text-sm">{addr.street}</Text>
                  <Text className="text-text-secondary text-xs mt-0.5">
                    {addr.city}, {addr.state}, {addr.country}
                  </Text>
                  {addr.zipCode && (
                    <Text className="text-text-muted text-xs mt-0.5">CP: {addr.zipCode}</Text>
                  )}
                  {addr.isDefault && (
                    <View className="bg-primary/10 px-2 py-0.5 rounded-full mt-2 self-start">
                      <Text className="text-primary text-xs">Predeterminada</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteAddress(addr.id)}
                  className="ml-2 px-3 py-1.5 border border-danger rounded-lg"
                >
                  <Text className="text-danger text-xs">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Add Address Form */}
          {showAddAddress ? (
            <View className="bg-surface-secondary rounded-2xl p-4 border border-border gap-3">
              <Text className="text-text-primary font-medium text-sm">Nueva dirección</Text>
              {[
                { key: 'street', label: 'Calle / Dirección', placeholder: 'Carrera 7 #45-89' },
                { key: 'city', label: 'Ciudad', placeholder: 'Bogotá' },
                { key: 'state', label: 'Departamento / Estado', placeholder: 'Cundinamarca' },
                { key: 'country', label: 'País', placeholder: 'Colombia' },
                { key: 'zipCode', label: 'Código postal', placeholder: '110111' },
              ].map((field) => (
                <View key={field.key}>
                  <Text className="text-xs text-text-secondary mb-1">{field.label}</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-text-primary text-sm"
                    placeholder={field.placeholder}
                    placeholderTextColor="#A0A0A0"
                    value={(newAddress as any)[field.key]}
                    onChangeText={(val) =>
                      setNewAddress((prev) => ({ ...prev, [field.key]: val }))
                    }
                  />
                </View>
              ))}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 border border-border rounded-xl py-3"
                  onPress={() => setShowAddAddress(false)}
                >
                  <Text className="text-text-secondary text-center text-sm font-medium">
                    Cancelar
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary rounded-xl py-3"
                  onPress={handleAddAddress}
                >
                  <Text className="text-text-inverse text-center text-sm font-semibold">
                    Guardar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              className="border border-dashed border-border rounded-2xl py-4 items-center"
              onPress={() => setShowAddAddress(true)}
              activeOpacity={0.7}
            >
              <Text className="text-text-muted text-sm">+ Agregar dirección</Text>
            </TouchableOpacity>
          )}

          {/* Actions */}
          <SectionHeader title="Cuenta" />

          <View className="gap-3">
            <TouchableOpacity
              className="border border-border rounded-xl py-4 items-center"
              onPress={confirmLogout}
              activeOpacity={0.8}
            >
              <Text className="text-text-primary font-medium text-sm">
                Cerrar sesión
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border border-danger rounded-xl py-4 items-center"
              onPress={confirmDeactivate}
              activeOpacity={0.8}
            >
              <Text className="text-danger font-medium text-sm">
                Desactivar cuenta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}