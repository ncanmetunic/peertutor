import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { MatchingService } from '../../src/services/matching';
import { User } from '../../src/types';

export default function SendRequestScreen() {
  const { user } = useAuthStore();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (userId) {
      loadTargetUser();
    }
  }, [userId]);

  const loadTargetUser = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const userData = await DatabaseService.getUser(userId);
      setTargetUser(userData);
    } catch (error) {
      console.error('Error loading target user:', error);
      Alert.alert('Error', 'Failed to load user information');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchInfo = () => {
    if (!user || !targetUser) return { score: 0, commonTopics: [] };
    return {
      score: MatchingService.calculateMatchScore(user, targetUser),
      commonTopics: MatchingService.getCommonTopics(user, targetUser)
    };
  };

  const handleSendRequest = async () => {
    if (!user?.uid || !targetUser?.uid) return;

    try {
      setSending(true);
      
      // Send the peer request
      await DatabaseService.sendPeerRequest(
        user.uid, 
        targetUser.uid, 
        message.trim() || undefined
      );

      Alert.alert(
        'Request Sent! 🎉',
        `Your peer request has been sent to ${targetUser.displayName}. They'll be notified and can accept or decline your request.`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Loading user information...</Text>
      </SafeAreaView>
    );
  }

  if (!targetUser) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <Text className="text-secondary-600">User not found</Text>
        <Button
          title="Go Back"
          variant="primary"
          onPress={handleCancel}
          style={{ marginTop: 16 }}
        />
      </SafeAreaView>
    );
  }

  const matchInfo = calculateMatchInfo();

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
              Send Peer Request
            </Text>
            <Text className="text-secondary-600">
              Send a request to connect with this study partner
            </Text>
          </View>

          {/* Target User Profile */}
          <Card variant="elevated" className="mb-6">
            <View className="items-center mb-4">
              <View className="w-16 h-16 bg-primary-100 rounded-full items-center justify-center mb-3">
                <Text className="text-primary-600 font-bold text-xl">
                  {targetUser.displayName?.charAt(0) || 'U'}
                </Text>
              </View>
              
              <Text className="text-xl font-bold text-secondary-900 mb-1">
                {targetUser.displayName}
              </Text>
              
              <Text className="text-secondary-600 text-center">
                {targetUser.department} • {targetUser.university}
              </Text>
              
              {targetUser.city && (
                <Text className="text-secondary-500 text-center">
                  {targetUser.city}
                </Text>
              )}
            </View>

            {/* Match Score */}
            <View className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-primary-800 font-medium">Match Score</Text>
                <Text className="text-primary-700 font-bold text-lg">
                  {matchInfo.score}/10
                </Text>
              </View>
              
              <Text className="text-primary-700 text-sm">
                Based on complementary skills and shared interests
              </Text>
            </View>

            {/* Common Topics */}
            {matchInfo.commonTopics.length > 0 && (
              <View className="mb-4">
                <Text className="text-secondary-700 font-medium mb-2">
                  Common Topics:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {matchInfo.commonTopics.map((topic, index) => (
                    <Chip key={index} label={topic} variant="topic" />
                  ))}
                </View>
              </View>
            )}

            {/* User's Skills */}
            {targetUser.skills && targetUser.skills.length > 0 && (
              <View className="mb-4">
                <Text className="text-secondary-700 font-medium mb-2">
                  Can teach:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {targetUser.skills.slice(0, 3).map((skill, index) => (
                    <Chip key={index} label={skill} variant="skill" />
                  ))}
                  {targetUser.skills.length > 3 && (
                    <Chip label={`+${targetUser.skills.length - 3} more`} variant="default" />
                  )}
                </View>
              </View>
            )}

            {/* User's Needs */}
            {targetUser.needs && targetUser.needs.length > 0 && (
              <View>
                <Text className="text-secondary-700 font-medium mb-2">
                  Wants to learn:
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {targetUser.needs.slice(0, 3).map((need, index) => (
                    <Chip key={index} label={need} variant="need" />
                  ))}
                  {targetUser.needs.length > 3 && (
                    <Chip label={`+${targetUser.needs.length - 3} more`} variant="default" />
                  )}
                </View>
              </View>
            )}
          </Card>

          {/* Bio */}
          {targetUser.bio && (
            <Card variant="outlined" className="mb-6">
              <Text className="text-lg font-semibold text-secondary-900 mb-3">
                About {targetUser.displayName}
              </Text>
              <Text className="text-secondary-700 leading-5">
                {targetUser.bio}
              </Text>
            </Card>
          )}

          {/* Message Input */}
          <Card variant="outlined" className="mb-6">
            <Input
              label="Personal Message (Optional)"
              value={message}
              onChangeText={setMessage}
              placeholder="Hi! I'd love to study together and help each other learn..."
              multiline
              numberOfLines={4}
              maxLength={300}
              hint={`${message.length}/300 characters • Add a personal touch to your request`}
              style={{ 
                textAlignVertical: 'top',
                minHeight: 100
              }}
            />

            <View className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Text className="text-blue-800 text-sm">
                💡 <Text className="font-medium">Tip:</Text> Mention specific subjects you'd like to study together or how you can help each other.
              </Text>
            </View>
          </Card>

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
              title="Send Request"
              variant="primary"
              size="lg"
              onPress={handleSendRequest}
              style={{ flex: 1 }}
              loading={sending}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}