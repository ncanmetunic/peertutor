import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { userService } from '../../src/services/userService';

export default function PrivacySettingsScreen() {
  const { user, updateUserProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    profilePublic: user?.visibility?.profilePublic ?? true,
    showUniversity: user?.visibility?.showUniversity ?? true,
    showCity: user?.visibility?.showCity ?? true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const updatedVisibility = {
        ...user.visibility,
        ...settings
      };

      await userService.updateUserProfile(user.uid, { 
        visibility: updatedVisibility 
      });
      
      updateUserProfile({ visibility: updatedVisibility });
      
      Alert.alert('Success', 'Privacy settings updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      Alert.alert('Error', 'Failed to update privacy settings. Please try again.');
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
            Privacy Settings
          </Text>
          <Text className="text-secondary-600">
            Control who can see your information and how you appear to others.
          </Text>
        </View>

        {/* Profile Visibility */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Profile Visibility
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Public Profile
                </Text>
                <Text className="text-sm text-secondary-600">
                  Allow others to discover and view your profile
                </Text>
              </View>
              <Switch
                value={settings.profilePublic}
                onValueChange={() => handleToggle('profilePublic')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.profilePublic ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View className="h-px bg-secondary-200" />

            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Show University
                </Text>
                <Text className="text-sm text-secondary-600">
                  Display your university information to other users
                </Text>
              </View>
              <Switch
                value={settings.showUniversity}
                onValueChange={() => handleToggle('showUniversity')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.showUniversity ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View className="h-px bg-secondary-200" />

            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Show City
                </Text>
                <Text className="text-sm text-secondary-600">
                  Display your city information for location-based matching
                </Text>
              </View>
              <Switch
                value={settings.showCity}
                onValueChange={() => handleToggle('showCity')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.showCity ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>
        </Card>

        {/* Data & Security */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Data & Security
          </Text>
          
          <View className="space-y-3">
            <Text className="text-secondary-700">
              Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.
            </Text>
            
            <View className="flex-row items-center space-x-2">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-sm text-secondary-600">
                End-to-end encrypted messaging
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-sm text-secondary-600">
                Secure profile data storage
              </Text>
            </View>
            
            <View className="flex-row items-center space-x-2">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
              <Text className="text-sm text-secondary-600">
                GDPR compliant data handling
              </Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View className="space-y-3 mb-6">
          <Button
            title={isLoading ? "Saving..." : "Save Changes"}
            onPress={handleSave}
            disabled={isLoading}
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