import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { signUp, isLoading, error } = useAuthStore();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { displayName: '', email: '', password: '', confirmPassword: '' };

    // Display name validation
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
      isValid = false;
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password, formData.displayName);
      
      Alert.alert(
        'Registration Successful!',
        'Please check your email to verify your account before signing in.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6">
          <View className="flex-1 justify-center py-12">
            
            {/* Header */}
            <View className="mb-8 items-center">
              <Text className="text-3xl font-bold text-secondary-900 mb-2">
                Create Account
              </Text>
              <Text className="text-secondary-600 text-center">
                Join PeerTutor to connect with study partners
              </Text>
            </View>

            {/* Registration Form */}
            <Card variant="elevated" className="mb-6">
              <View className="space-y-4">
                <Input
                  label="Display Name"
                  value={formData.displayName}
                  onChangeText={(value) => updateField('displayName', value)}
                  error={errors.displayName}
                  placeholder="Enter your display name"
                  autoCapitalize="words"
                  autoComplete="name"
                  required
                />

                <Input
                  label="Email"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  error={errors.email}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                />

                <Input
                  label="Password"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  error={errors.password}
                  placeholder="Create a password"
                  secureTextEntry
                  hint="Minimum 6 characters"
                  required
                />

                <Input
                  label="Confirm Password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  secureTextEntry
                  required
                />

                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <Text className="text-red-600 text-sm">{error}</Text>
                  </View>
                )}

                <Button
                  title="Create Account"
                  onPress={handleSignUp}
                  loading={isLoading}
                  size="lg"
                />
              </View>
            </Card>

            {/* Footer Links */}
            <View className="space-y-4">
              <Text className="text-secondary-500 text-xs text-center leading-5">
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>

              <View className="flex-row justify-center items-center space-x-1">
                <Text className="text-secondary-600">Already have an account?</Text>
                <Link href="/auth/login" asChild>
                  <Text className="text-primary-600 font-medium">
                    Sign In
                  </Text>
                </Link>
              </View>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}