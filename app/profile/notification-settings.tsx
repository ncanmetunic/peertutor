import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/store/authStore';
import { userService } from '../../src/services/userService';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  newMessages: boolean;
  peerRequests: boolean;
  matchSuggestions: boolean;
  promotions: boolean;
}

export default function NotificationSettingsScreen() {
  const { user, updateUserProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: user?.notificationSettings?.pushEnabled ?? true,
    emailEnabled: user?.notificationSettings?.emailEnabled ?? true,
    newMessages: user?.notificationSettings?.newMessages ?? true,
    peerRequests: user?.notificationSettings?.peerRequests ?? true,
    matchSuggestions: user?.notificationSettings?.matchSuggestions ?? true,
    promotions: user?.notificationSettings?.promotions ?? false,
  });

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      await userService.updateUserProfile(user.uid, { 
        notificationSettings: settings 
      });
      
      updateUserProfile({ notificationSettings: settings });
      
      Alert.alert('Success', 'Notification settings updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
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
            Notification Settings
          </Text>
          <Text className="text-secondary-600">
            Choose when and how you want to be notified about important activities.
          </Text>
        </View>

        {/* General Settings */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            General
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Push Notifications
                </Text>
                <Text className="text-sm text-secondary-600">
                  Receive notifications on your device
                </Text>
              </View>
              <Switch
                value={settings.pushEnabled}
                onValueChange={() => handleToggle('pushEnabled')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.pushEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>

            <View className="h-px bg-secondary-200" />

            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Email Notifications
                </Text>
                <Text className="text-sm text-secondary-600">
                  Receive notifications via email
                </Text>
              </View>
              <Switch
                value={settings.emailEnabled}
                onValueChange={() => handleToggle('emailEnabled')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.emailEnabled ? '#FFFFFF' : '#9CA3AF'}
              />
            </View>
          </View>
        </Card>

        {/* Activity Notifications */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Activity Notifications
          </Text>
          
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  New Messages
                </Text>
                <Text className="text-sm text-secondary-600">
                  Get notified when you receive new chat messages
                </Text>
              </View>
              <Switch
                value={settings.newMessages}
                onValueChange={() => handleToggle('newMessages')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.newMessages ? '#FFFFFF' : '#9CA3AF'}
                disabled={!settings.pushEnabled && !settings.emailEnabled}
              />
            </View>

            <View className="h-px bg-secondary-200" />

            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Peer Requests
                </Text>
                <Text className="text-sm text-secondary-600">
                  Get notified when someone sends you a peer request
                </Text>
              </View>
              <Switch
                value={settings.peerRequests}
                onValueChange={() => handleToggle('peerRequests')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.peerRequests ? '#FFFFFF' : '#9CA3AF'}
                disabled={!settings.pushEnabled && !settings.emailEnabled}
              />
            </View>

            <View className="h-px bg-secondary-200" />

            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-secondary-900 font-medium">
                  Match Suggestions
                </Text>
                <Text className="text-sm text-secondary-600">
                  Get notified about new potential peer matches
                </Text>
              </View>
              <Switch
                value={settings.matchSuggestions}
                onValueChange={() => handleToggle('matchSuggestions')}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={settings.matchSuggestions ? '#FFFFFF' : '#9CA3AF'}
                disabled={!settings.pushEnabled && !settings.emailEnabled}
              />
            </View>
          </View>
        </Card>

        {/* Marketing */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Marketing & Updates
          </Text>
          
          <View className="flex-row justify-between items-center">
            <View className="flex-1 mr-4">
              <Text className="text-secondary-900 font-medium">
                Promotions & Tips
              </Text>
              <Text className="text-sm text-secondary-600">
                Receive updates about new features and learning tips
              </Text>
            </View>
            <Switch
              value={settings.promotions}
              onValueChange={() => handleToggle('promotions')}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={settings.promotions ? '#FFFFFF' : '#9CA3AF'}
              disabled={!settings.emailEnabled}
            />
          </View>
        </Card>

        {/* Help Text */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-secondary-700 text-sm leading-5">
            💡 You can always change these settings later. Some notifications may still be sent for critical account security updates.
          </Text>
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