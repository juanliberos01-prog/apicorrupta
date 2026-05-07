import { FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { View } from 'react-native';

function TabIcon({
  focused,
  icon,
}: {
  focused: boolean;
  icon: string;
}) {
  return (
    <View className="items-center justify-center pt-1">
      <FontAwesome
        name={icon as any}
        size={26}
        color={focused ? '#2563EB' : '#A1A1AA'}
      />
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
          height: 95,
          paddingBottom: 18,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="shopping-cart" />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="heart" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="user" />
          ),
        }}
      />
    </Tabs>
  );
}