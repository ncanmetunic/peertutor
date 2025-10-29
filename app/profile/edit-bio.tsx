import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';

export default function EditBioScreen() {
  const { user, setUser } = useAuthStore();
  
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const maxBioLength = 500;

  const handleSave = async () => {
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      
      // Save bio to Firebase
      await DatabaseService.updateUser(user.uid, {
        bio: bio.trim() || undefined
      });

      // Update local user state
      setUser({
        ...user,
        bio: bio.trim() || undefined
      });
      
      Alert.alert('Success', 'Bio updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update bio. Please try again.');
      console.error('Bio update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-6">
          
          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-secondary-900 mb-2">
              Edit Bio
            </Text>
            <Text className="text-secondary-600">
              Tell other students about yourself, your interests, and what makes you a great study partner.
            </Text>
          </View>

          {/* Form */}
          <Card variant="elevated" className="mb-6">
            <Input
              label="About Me"
              value={bio}
              onChangeText={setBio}
              placeholder="Tell others about yourself, your study habits, interests, or what makes you a great study partner..."
              multiline
              numberOfLines={8}
              maxLength={maxBioLength}
              hint={`${bio.length}/${maxBioLength} characters`}
              style={{ 
                textAlignVertical: 'top',
                minHeight: 120
              }}
            />

            {/* Bio Tips */}
            <View className="mt-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <Text className="text-primary-800 font-medium mb-2">💡 Tips for a great bio:</Text>
              <View className="space-y-1">
                <Text className="text-primary-700 text-sm">• Share your study style and preferences</Text>
                <Text className="text-primary-700 text-sm">• Mention your academic interests or projects</Text>
                <Text className="text-primary-700 text-sm">• Include any teaching or tutoring experience</Text>
                <Text className="text-primary-700 text-sm">• Be friendly and approachable</Text>
                <Text className="text-primary-700 text-sm">• Keep it concise but informative</Text>
              </View>
            </View>
          </Card>

          {/* Preview */}
          {bio.trim().length > 0 && (
            <Card variant="outlined" className="mb-6">
              <Text className="text-lg font-semibold text-secondary-900 mb-3">
                Preview
              </Text>
              <Text className="text-secondary-700 leading-5">
                {bio.trim()}
              </Text>
            </Card>
          )}

          {/* Action Buttons */}
          <View className="flex-row space-x-4 mb-8">
            <Button
              title="Cancel"
              variant="outline"
              size="lg"
              onPress={handleCancel}
              style={{ flex: 1 }}
            />
            <Button
              title="Save Bio"
              variant="primary"
              size="lg"
              onPress={handleSave}
              style={{ flex: 1 }}
              loading={isLoading}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}