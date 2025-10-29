import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { TextInput } from '../../src/components/ui/TextInput';
import { authService } from '../../src/services/authService';

export default function ChangePasswordScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };

    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleChangePassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      
      Alert.alert(
        'Success', 
        'Password changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect.';
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak.';
        setErrors(prev => ({
          ...prev,
          newPassword: 'Password is too weak'
        }));
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again before changing your password.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-secondary-900 mb-2">
            Change Password
          </Text>
          <Text className="text-secondary-600">
            Enter your current password and choose a new secure password.
          </Text>
        </View>

        {/* Form */}
        <Card variant="outlined" className="mb-6">
          <View className="space-y-4">
            
            {/* Current Password */}
            <View>
              <Text className="text-sm font-medium text-secondary-900 mb-2">
                Current Password
              </Text>
              <TextInput
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChangeText={(value) => handleInputChange('currentPassword', value)}
                secureTextEntry
                error={errors.currentPassword}
                autoCapitalize="none"
              />
              {errors.currentPassword ? (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.currentPassword}
                </Text>
              ) : null}
            </View>

            {/* New Password */}
            <View>
              <Text className="text-sm font-medium text-secondary-900 mb-2">
                New Password
              </Text>
              <TextInput
                placeholder="Enter a new password (min 6 characters)"
                value={formData.newPassword}
                onChangeText={(value) => handleInputChange('newPassword', value)}
                secureTextEntry
                error={errors.newPassword}
                autoCapitalize="none"
              />
              {errors.newPassword ? (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.newPassword}
                </Text>
              ) : null}
            </View>

            {/* Confirm New Password */}
            <View>
              <Text className="text-sm font-medium text-secondary-900 mb-2">
                Confirm New Password
              </Text>
              <TextInput
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                error={errors.confirmPassword}
                autoCapitalize="none"
              />
              {errors.confirmPassword ? (
                <Text className="text-red-600 text-sm mt-1">
                  {errors.confirmPassword}
                </Text>
              ) : null}
            </View>

          </View>
        </Card>

        {/* Security Tips */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-3">
            Password Security Tips
          </Text>
          
          <View className="space-y-2">
            <View className="flex-row items-center space-x-2">
              <Text className="text-secondary-600">•</Text>
              <Text className="text-sm text-secondary-600 flex-1">
                Use at least 8 characters
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <Text className="text-secondary-600">•</Text>
              <Text className="text-sm text-secondary-600 flex-1">
                Include uppercase and lowercase letters
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <Text className="text-secondary-600">•</Text>
              <Text className="text-sm text-secondary-600 flex-1">
                Add numbers and special characters
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <Text className="text-secondary-600">•</Text>
              <Text className="text-sm text-secondary-600 flex-1">
                Avoid using personal information
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View className="space-y-3 mb-6">
          <Button
            title={isLoading ? "Changing Password..." : "Change Password"}
            onPress={handleChangePassword}
            disabled={isLoading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
          />
          
          <Button
            title="Cancel"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}