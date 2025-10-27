import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';

export default function OnboardingScreen() {
  const { user } = useAuthStore();
  
  const steps = [
    {
      title: "Welcome to PeerTutor! 🎓",
      description: "Let's set up your profile to find the perfect study partners",
      icon: "👋"
    },
    {
      title: "Tell us about yourself",
      description: "Add your academic information and personal details",
      icon: "📚"
    },
    {
      title: "Share your skills",
      description: "What subjects can you help others learn?",
      icon: "💡"
    },
    {
      title: "Set learning goals",
      description: "What would you like to learn from peers?",
      icon: "🎯"
    },
    {
      title: "You're all set!",
      description: "Start connecting with study partners",
      icon: "🚀"
    }
  ];

  const handleStartOnboarding = () => {
    router.push('/onboarding/profile');
  };

  const handleSkipOnboarding = () => {
    Alert.alert(
      'Skip Onboarding?',
      'You can always complete your profile later in settings. However, a complete profile helps you find better study partners.',
      [
        { text: 'Continue Setup', style: 'default' },
        { 
          text: 'Skip for Now', 
          style: 'destructive',
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-50">
      <ScrollView className="flex-1 px-6 py-8">
        
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🎓</Text>
          </View>
          <Text className="text-3xl font-bold text-primary-900 text-center mb-2">
            Welcome, {user?.displayName}!
          </Text>
          <Text className="text-primary-700 text-center text-lg">
            Let's get you connected with study partners
          </Text>
        </View>

        {/* Steps Overview */}
        <Card variant="elevated" className="mb-8">
          <Text className="text-xl font-semibold text-secondary-900 mb-6 text-center">
            Quick Setup (3 minutes)
          </Text>
          
          <View className="space-y-4">
            {steps.map((step, index) => (
              <View key={index} className="flex-row items-start">
                <View className="w-8 h-8 bg-primary-100 rounded-full items-center justify-center mr-4 mt-1">
                  <Text className="text-lg">{step.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-secondary-900 mb-1">
                    {step.title}
                  </Text>
                  <Text className="text-sm text-secondary-600 leading-5">
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Benefits */}
        <Card variant="outlined" className="mb-8">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Why complete your profile?
          </Text>
          
          <View className="space-y-3">
            <View className="flex-row items-center">
              <Text className="text-green-500 text-lg mr-3">✓</Text>
              <Text className="text-secondary-700 flex-1">
                Get matched with peers who complement your skills
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 text-lg mr-3">✓</Text>
              <Text className="text-secondary-700 flex-1">
                Find study partners at your university
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 text-lg mr-3">✓</Text>
              <Text className="text-secondary-700 flex-1">
                Connect with people who need your expertise
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-green-500 text-lg mr-3">✓</Text>
              <Text className="text-secondary-700 flex-1">
                Build your learning network faster
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View className="space-y-4">
          <Button
            title="Let's Get Started!"
            variant="primary"
            size="lg"
            onPress={handleStartOnboarding}
          />
          
          <Button
            title="Skip for Now"
            variant="ghost"
            size="lg"
            onPress={handleSkipOnboarding}
          />
        </View>

        {/* Footer */}
        <View className="mt-8">
          <Text className="text-secondary-500 text-xs text-center leading-5">
            Your information helps us connect you with the right study partners. 
            You can update your profile anytime in settings.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}