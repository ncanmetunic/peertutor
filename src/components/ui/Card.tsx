import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  variant = 'default'
}) => {
  const getCardClasses = () => {
    const baseClasses = 'rounded-2xl p-4';
    
    const variantClasses = {
      default: 'bg-white',
      elevated: 'bg-white shadow-sm',
      outlined: 'bg-white border border-secondary-200'
    };

    return `${baseClasses} ${variantClasses[variant]} ${className}`;
  };

  return (
    <View className={getCardClasses()} style={style}>
      {children}
    </View>
  );
};