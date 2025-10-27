import React from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { useAuthStore } from '../../src/store/authStore';

// Mock data for now
const mockMatches = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    university: 'METU',
    department: 'Computer Engineering',
    matchScore: 8.5,
    commonTopics: ['React Native', 'Machine Learning'],
    lastActivity: '2 hours ago'
  },
  {
    id: '2', 
    name: 'Elif Kaya',
    university: 'METU',
    department: 'Mathematics',
    matchScore: 7.2,
    commonTopics: ['Statistics', 'Python'],
    lastActivity: '1 day ago'
  }
];

export default function MatchesScreen() {
  const { user } = useAuthStore();

  const renderMatchCard = ({ item }: { item: typeof mockMatches[0] }) => (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-secondary-900 mb-1">
            {item.name}
          </Text>
          <Text className="text-secondary-600 text-sm">
            {item.department} • {item.university}
          </Text>
        </View>
        <View className="bg-primary-100 px-2 py-1 rounded-full">
          <Text className="text-primary-700 font-medium text-sm">
            {item.matchScore}/10
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
          Active {item.lastActivity}
        </Text>
        <Button 
          title="Open Chat" 
          variant="primary"
          size="sm"
          onPress={() => {/* TODO: Navigate to chat */}}
        />
      </View>
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Welcome Section */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-secondary-900 mb-2">
            Welcome back, {user?.displayName || 'Student'}! 👋
          </Text>
          <Text className="text-secondary-600">
            You have {mockMatches.length} active learning partnerships
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row space-x-4 mb-6">
          <Card variant="elevated" className="flex-1">
            <Text className="text-2xl font-bold text-primary-600 mb-1">
              {mockMatches.length}
            </Text>
            <Text className="text-secondary-600 text-sm">Active Matches</Text>
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

        {/* Matches List */}
        <View className="mb-6">
          <Text className="text-xl font-semibold text-secondary-900 mb-4">
            Your Matches
          </Text>
          
          {mockMatches.length > 0 ? (
            <FlatList
              data={mockMatches}
              renderItem={renderMatchCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Card variant="outlined" className="items-center py-8">
              <Text className="text-secondary-600 text-center mb-4">
                No matches yet. Start by discovering new peers!
              </Text>
              <Button
                title="Discover Peers"
                variant="primary"
                onPress={() => {/* TODO: Navigate to discover tab */}}
              />
            </Card>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
