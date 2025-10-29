import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { MatchingService } from '../../src/services/matching';
import { User, MatchSuggestion } from '../../src/types';

interface MatchSuggestionWithUser extends MatchSuggestion {
  user: User;
}

export default function MatchesScreen() {
  const { user } = useAuthStore();
  const [matchSuggestions, setMatchSuggestions] = useState<MatchSuggestionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadMatchSuggestions();
    }
  }, [user]);

  const loadMatchSuggestions = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Get all users for matching (in a real app, this would be optimized with server-side matching)
      const allUsers = await DatabaseService.discoverUsers(user.uid);
      
      // Generate match suggestions using the matching service
      const suggestions = MatchingService.generateSuggestions(user, allUsers, 10);
      
      // Combine suggestions with user data
      const suggestionsWithUsers: MatchSuggestionWithUser[] = suggestions.map(suggestion => {
        const matchedUser = allUsers.find(u => u.uid === suggestion.uid);
        return {
          ...suggestion,
          user: matchedUser!
        };
      }).filter(s => s.user); // Filter out any null users
      
      setMatchSuggestions(suggestionsWithUsers);
    } catch (error) {
      console.error('Error loading match suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMatchSuggestions();
    setRefreshing(false);
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSendRequest = async (targetUser: User) => {
    // TODO: Navigate to send request screen or show modal
    router.push(`/requests/send?userId=${targetUser.uid}`);
  };

  const renderMatchCard = ({ item }: { item: MatchSuggestionWithUser }) => (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-secondary-900 mb-1">
            {item.user.displayName}
          </Text>
          <Text className="text-secondary-600 text-sm">
            {item.user.department} • {item.user.university}
          </Text>
        </View>
        <View className="bg-primary-100 px-2 py-1 rounded-full">
          <Text className="text-primary-700 font-medium text-sm">
            {item.score}/10
          </Text>
        </View>
      </View>
      
      <View className="mb-3">
        <Text className="text-secondary-600 text-sm mb-2">Common Topics:</Text>
        <View className="flex-row flex-wrap gap-2">
          {item.commonTopics.map((topic, index) => (
            <Chip key={index} label={topic} variant="topic" />
          ))}
        </View>
      </View>
      
      <View className="flex-row justify-between items-center">
        <Text className="text-secondary-500 text-xs">
          Match computed {formatTime(item.lastComputedAt)}
        </Text>
        <Button 
          title="Send Request" 
          variant="primary"
          size="sm"
          onPress={() => handleSendRequest(item.user)}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Finding your perfect study partners...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView 
        className="flex-1 px-4 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.displayName || 'Student'}! 👋
          </Text>
          <Text className="text-secondary-600">
            You have {matchSuggestions.length} potential study partners
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row space-x-4 mb-6">
          <Card variant="elevated" className="flex-1">
            <Text className="text-2xl font-bold text-primary-600 mb-1">
              {matchSuggestions.length}
            </Text>
            <Text className="text-secondary-600 text-sm">Match Suggestions</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1">
            <Text className="text-2xl font-bold text-green-600 mb-1">
              {user?.skills?.length || 0}
            </Text>
            <Text className="text-secondary-600 text-sm">Skills Shared</Text>
          </Card>
          
          <Card variant="elevated" className="flex-1">
            <Text className="text-2xl font-bold text-blue-600 mb-1">
              {user?.needs?.length || 0}
            </Text>
            <Text className="text-secondary-600 text-sm">Learning Goals</Text>
          </Card>
        </View>

        {/* Match Suggestions List */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-secondary-900 mb-4">
            Recommended Study Partners
          </Text>
          
          {matchSuggestions.length > 0 ? (
            <FlatList
              data={matchSuggestions}
              renderItem={renderMatchCard}
              keyExtractor={(item) => item.uid}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card variant="outlined" className="items-center py-8">
              <Text className="text-secondary-600 text-center mb-4">
                No match suggestions found. Complete your profile to get better matches!
              </Text>
              <Button
                title="Complete Profile"
                variant="primary"
                onPress={() => router.push('/(tabs)/profile')}
              />
            </Card>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
