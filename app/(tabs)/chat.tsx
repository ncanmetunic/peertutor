import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { Match, User } from '../../src/types';

// Real conversation interface that extends Match with additional data

interface ConversationItem extends Match {
  participant: User;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export default function ChatScreen() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const matches = await DatabaseService.getUserMatches(user.uid);
      
      const conversationItems: ConversationItem[] = await Promise.all(
        matches.map(async (match) => {
          const otherUserUid = match.uids.find(uid => uid !== user.uid);
          if (!otherUserUid) return null;
          
          const participant = await DatabaseService.getUser(otherUserUid);
          if (!participant) return null;
          
          return {
            ...match,
            participant,
            unreadCount: 0,
            lastMessage: 'Start a conversation!',
            lastMessageTime: match.startedAt ? formatTime(match.startedAt) : 'Now'
          };
        })
      );
      
      setConversations(conversationItems.filter(Boolean) as ConversationItem[]);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNavigateToConversation = (conversation: ConversationItem) => {
    router.push(`/chat/${conversation.id}`);
  };

  const renderConversation = ({ item }: { item: ConversationItem }) => (
    <TouchableOpacity onPress={() => handleNavigateToConversation(item)}>
      <Card variant="outlined" className="mb-3">
        <View className="flex-row items-center">
          
          {/* Avatar */}
          <View className="w-12 h-12 bg-primary-100 rounded-full items-center justify-center mr-3">
            <Text className="text-primary-600 font-semibold text-lg">
              {item.participant.displayName?.charAt(0) || 'U'}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <View className="flex-row justify-between items-start mb-1">
              <Text className="text-lg font-semibold text-secondary-900 flex-1">
                {item.participant.displayName}
              </Text>
              <Text className="text-secondary-500 text-xs">
                {item.lastMessageTime}
              </Text>
            </View>
            
            <Text className="text-secondary-600 text-sm mb-1">
              {item.participant.university}
            </Text>
            
            <View className="flex-row justify-between items-center">
              <Text 
                className="text-secondary-700 text-sm flex-1 mr-2"
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
              {item.unreadCount > 0 && (
                <View className="bg-primary-600 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-medium">
                    {item.unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Loading conversations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-secondary-900 mb-2">
            Messages
          </Text>
          <Text className="text-secondary-600">
            {conversations.filter(c => c.unreadCount > 0).length} unread conversations
          </Text>
        </View>

        {/* Conversations List */}
        {conversations.length > 0 ? (
          <FlatList
            data={conversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-secondary-600 text-center mb-4">
              No conversations yet
            </Text>
            <Text className="text-secondary-500 text-center text-sm mb-4">
              Start chatting when you get matched with peers!
            </Text>
            <Button
              title="Find Peers"
              variant="primary"
              onPress={() => router.push('/(tabs)/discover')}
            />
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}