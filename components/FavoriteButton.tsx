import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function FavoriteButton({
  isFavorite,
  onPress,
}: {
  isFavorite: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="bg-surface/90 border border-border rounded-full w-10 h-10 items-center justify-center"
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text className={`text-lg ${isFavorite ? 'text-danger' : 'text-text-muted'}`}>
        {isFavorite ? '♥' : '♡'}
      </Text>
    </TouchableOpacity>
  );
}
