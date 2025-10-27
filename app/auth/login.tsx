import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { signIn, isLoading, error } = useAuthStore();

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message);
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
                Welcome Back
              </Text>
              <Text className="text-secondary-600 text-center">
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Login Form */}
            <Card variant="elevated" className="mb-6">
              <View className="space-y-4">
                <Input
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  error={emailError}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  required
                />

                <Input
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  error={passwordError}
                  placeholder="Enter your password"
                  secureTextEntry
                  autoComplete="password"
                  required
                />

                {error && (
                  <View className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <Text className="text-red-600 text-sm">{error}</Text>
                  </View>
                )}

                <Button
                  title="Sign In"
                  onPress={handleSignIn}
                  loading={isLoading}
                  size="lg"
                />
              </View>
            </Card>

            {/* Footer Links */}
            <View className="space-y-4">
              <View className="flex-row justify-center">
                <Link href="/auth/forgot-password" asChild>
                  <Text className="text-primary-600 text-center">
                    Forgot your password?
                  </Text>
                </Link>
              </View>

              <View className="flex-row justify-center items-center space-x-1">
                <Text className="text-secondary-600">Don't have an account?</Text>
                <Link href="/auth/register" asChild>
                  <Text className="text-primary-600 font-medium">
                    Sign Up
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