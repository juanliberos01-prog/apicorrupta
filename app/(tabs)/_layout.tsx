import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

function TabIcon({
  label,
  focused,
  icon,
}: {
  label: string;
  focused: boolean;
  icon: string;
}) {
  return (
    <View className="items-center justify-center pt-1">
      <Text className={`text-xl ${focused ? 'opacity-100' : 'opacity-40'}`}>
        {icon}
      </Text>
      <Text
        className={`text-xs mt-0.5 font-medium ${
          focused ? 'text-primary' : 'text-text-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E5E3',
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Inicio" focused={focused} icon="◈" />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Productos" focused={focused} icon="▦" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon label="Perfil" focused={focused} icon="◉" />
          ),
        }}
      />
    </Tabs>
  );
}