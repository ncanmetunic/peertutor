import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Send, ArrowLeft } from 'lucide-react-native';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { Message, User } from '../../src/types';

export default function ChatConversationScreen() {
  const { user } = useAuthStore();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const unsubscribeRef = useRef<() => void>();

  useEffect(() => {
    if (conversationId && user?.uid) {
      loadConversationData();
      subscribeToMessages();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, user]);

  const loadConversationData = async () => {
    if (!conversationId || !user?.uid) return;

    try {
      setLoading(true);
      
      // Get match data to find the other user
      const match = await DatabaseService.getUserMatches(user.uid);
      const currentMatch = match.find(m => m.id === conversationId);
      
      if (currentMatch) {
        const otherUserUid = currentMatch.uids.find(uid => uid !== user.uid);
        if (otherUserUid) {
          const userData = await DatabaseService.getUser(otherUserUid);
          setOtherUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading conversation data:', error);
      Alert.alert('Error', 'Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    if (!conversationId) return;

    const unsubscribe = DatabaseService.subscribeToMessages(
      conversationId,
      (newMessages) => {
        setMessages(newMessages);
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    );

    unsubscribeRef.current = unsubscribe;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user?.uid || sending) return;

    try {
      setSending(true);
      
      await DatabaseService.sendMessage(
        conversationId,
        user.uid,
        'text',
        { text: newMessage.trim() }
      );

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatMessageTime = (date: Date): string => {
    const now = new Date();
    const messageDate = new Date(date);
    
    // If today, show time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return messageDate.toLocaleDateString();
  };

  const renderMessage = (message: Message, index: number) => {
    const isMyMessage = message.senderUid === user?.uid;
    const showSenderName = !isMyMessage && index === 0 || 
      (index > 0 && messages[index - 1].senderUid !== message.senderUid);

    return (
      <View
        key={message.id}
        className={`mb-4 ${isMyMessage ? 'items-end' : 'items-start'}`}
      >
        {showSenderName && !isMyMessage && (
          <Text className="text-secondary-600 text-xs mb-1 px-3">
            {otherUser?.displayName}
          </Text>
        )}
        
        <View
          className={`max-w-[80%] px-4 py-3 rounded-2xl ${
            isMyMessage
              ? 'bg-primary-600 rounded-br-md'
              : 'bg-white border border-secondary-200 rounded-bl-md'
          }`}
        >
          <Text
            className={`text-base leading-5 ${
              isMyMessage ? 'text-white' : 'text-secondary-900'
            }`}
          >
            {message.text}
          </Text>
          
          <Text
            className={`text-xs mt-1 ${
              isMyMessage ? 'text-primary-100' : 'text-secondary-500'
            }`}
          >
            {formatMessageTime(message.sentAt)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Loading conversation...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className="bg-white border-b border-secondary-200 px-4 py-3">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
            >
              <ArrowLeft size={24} color="#6b7280" />
            </TouchableOpacity>
            
            <View className="w-10 h-10 bg-primary-100 rounded-full items-center justify-center mr-3">
              <Text className="text-primary-600 font-semibold">
                {otherUser?.displayName?.charAt(0) || 'U'}
              </Text>
            </View>
            
            <View className="flex-1">
              <Text className="text-lg font-semibold text-secondary-900">
                {otherUser?.displayName || 'User'}
              </Text>
              <Text className="text-secondary-600 text-sm">
                {otherUser?.university}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          showsVerticalScrollIndicator={false}
        >
          {messages.length > 0 ? (
            messages.map((message, index) => renderMessage(message, index))
          ) : (
            <View className="flex-1 justify-center items-center py-12">
              <Text className="text-secondary-600 text-center mb-4">
                This is the beginning of your conversation with {otherUser?.displayName}
              </Text>
              <Text className="text-secondary-500 text-center text-sm">
                Say hello and start studying together! 👋
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-white border-t border-secondary-200 px-4 py-3">
          <View className="flex-row items-end space-x-3">
            <TextInput
              className="flex-1 min-h-[40px] max-h-[120px] bg-secondary-100 rounded-2xl px-4 py-2 text-base"
              placeholder="Type a message..."
              placeholderTextColor="#94a3b8"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              textAlignVertical="center"
            />
            
            <TouchableOpacity
              onPress={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !sending
                  ? 'bg-primary-600'
                  : 'bg-secondary-300'
              }`}
            >
              {sending ? (
                <LoadingSpinner size="small" color="white" />
              ) : (
                <Send 
                  size={20} 
                  color="white"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}