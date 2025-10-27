import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle
}) => {
  const getButtonClasses = () => {
    const baseClasses = 'rounded-lg flex-row items-center justify-center';
    
    const variantClasses = {
      primary: 'bg-primary-600',
      secondary: 'bg-secondary-600',
      outline: 'border-2 border-primary-600 bg-transparent',
      ghost: 'bg-transparent'
    };

    const sizeClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4'
    };

    const disabledClasses = (disabled || loading) ? 'opacity-50' : '';

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses}`;
  };

  const getTextClasses = () => {
    const baseClasses = 'font-medium text-center';
    
    const variantClasses = {
      primary: 'text-white',
      secondary: 'text-white',
      outline: 'text-primary-600',
      ghost: 'text-primary-600'
    };

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`;
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator 
          size="small" 
          color={variant === 'outline' || variant === 'ghost' ? '#2563eb' : '#ffffff'} 
          style={{ marginRight: 8 }}
        />
      )}
      <Text className={getTextClasses()} style={textStyle}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};