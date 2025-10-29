import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const { resetPassword } = useAuthStore();

  const validateForm = () => {
    setEmailError('');
    
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await resetPassword(email);
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent',
        'Check your email for instructions to reset your password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
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
                Reset Password
              </Text>
              <Text className="text-secondary-600 text-center">
                Enter your email address and we'll send you instructions to reset your password
              </Text>
            </View>

            {/* Reset Form */}
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

                <Button
                  title={emailSent ? "Email Sent!" : "Send Reset Email"}
                  onPress={handleResetPassword}
                  loading={isLoading}
                  disabled={emailSent}
                  size="lg"
                />
              </View>
            </Card>

            {/* Back to Login */}
            <View className="flex-row justify-center items-center space-x-1">
              <Text className="text-secondary-600">Remember your password?</Text>
              <Link href="/auth/login" asChild>
                <Text className="text-primary-600 font-medium">
                  Sign In
                </Text>
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}