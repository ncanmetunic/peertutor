import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  required = false,
  style,
  ...props
}) => {
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-secondary-700 mb-2">
          {label}
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </Text>
      )}
      
      <TextInput
        className={`
          border rounded-lg px-3 py-3 text-base
          ${error 
            ? 'border-red-500 bg-red-50' 
            : 'border-secondary-300 bg-white focus:border-primary-500'
          }
        `}
        style={style}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      
      {error && (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      )}
      
      {hint && !error && (
        <Text className="text-secondary-500 text-sm mt-1">{hint}</Text>
      )}
    </View>
  );
};