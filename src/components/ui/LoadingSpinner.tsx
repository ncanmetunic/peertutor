import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  color = '#2563eb'
}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="text-secondary-600 mt-4 text-center">
          {text}
        </Text>
      )}
    </View>
  );
};