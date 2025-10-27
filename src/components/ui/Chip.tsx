import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { X } from 'lucide-react-native';

interface ChipProps {
  label: string;
  variant?: 'skill' | 'need' | 'topic' | 'default';
  removable?: boolean;
  onRemove?: () => void;
  onPress?: () => void;
  selected?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'default',
  removable = false,
  onRemove,
  onPress,
  selected = false
}) => {
  const getChipClasses = () => {
    const baseClasses = 'rounded-full px-3 py-1.5 flex-row items-center';
    
    const variantClasses = {
      skill: selected 
        ? 'bg-green-100 border border-green-500' 
        : 'bg-green-50 border border-green-200',
      need: selected 
        ? 'bg-blue-100 border border-blue-500' 
        : 'bg-blue-50 border border-blue-200',
      topic: 'bg-purple-50 border border-purple-200',
      default: selected 
        ? 'bg-primary-100 border border-primary-500' 
        : 'bg-secondary-100 border border-secondary-200'
    };

    return `${baseClasses} ${variantClasses[variant]}`;
  };

  const getTextClasses = () => {
    const variantClasses = {
      skill: selected ? 'text-green-700' : 'text-green-600',
      need: selected ? 'text-blue-700' : 'text-blue-600', 
      topic: 'text-purple-600',
      default: selected ? 'text-primary-700' : 'text-secondary-600'
    };

    return `text-sm font-medium ${variantClasses[variant]}`;
  };

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper 
      className={getChipClasses()}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Text className={getTextClasses()}>{label}</Text>
      
      {removable && onRemove && (
        <TouchableOpacity
          onPress={onRemove}
          className="ml-1.5"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X 
            size={14} 
            color={variant === 'skill' ? '#059669' : variant === 'need' ? '#2563eb' : '#6b7280'} 
          />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};