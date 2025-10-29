import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { PeerRequest, User } from '../../src/types';

interface RequestWithUser extends PeerRequest {
  otherUser: User;
}

export default function RequestsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [receivedRequests, setReceivedRequests] = useState<RequestWithUser[]>([]);
  const [sentRequests, setSentRequests] = useState<RequestWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadRequests();
    }
  }, [user]);

  const loadRequests = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      
      // Load received and sent requests in parallel
      const [received, sent] = await Promise.all([
        DatabaseService.getUserRequests(user.uid, 'received'),
        DatabaseService.getUserRequests(user.uid, 'sent')
      ]);

      // Get user data for each request
      const receivedWithUsers = await Promise.all(
        received.map(async (request) => {
          const otherUser = await DatabaseService.getUser(request.fromUid);
          return {
            ...request,
            otherUser: otherUser!
          };
        })
      );

      const sentWithUsers = await Promise.all(
        sent.map(async (request) => {
          const otherUser = await DatabaseService.getUser(request.toUid);
          return {
            ...request,
            otherUser: otherUser!
          };
        })
      );

      // Filter out requests where user data couldn't be loaded
      setReceivedRequests(receivedWithUsers.filter(r => r.otherUser));
      setSentRequests(sentWithUsers.filter(r => r.otherUser));
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
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

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await DatabaseService.updateRequestStatus(requestId, 'accepted');
      await loadRequests(); // Refresh the list
      Alert.alert('Success', 'Request accepted! You can now start chatting.');
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept request. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.updateRequestStatus(requestId, 'declined');
              await loadRequests(); // Refresh the list
            } catch (error) {
              console.error('Error declining request:', error);
              Alert.alert('Error', 'Failed to decline request. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderReceivedRequest = ({ item }: { item: RequestWithUser }) => (
    <Card variant="outlined" className="mb-4">
      <View className="mb-3">
        <Text className="text-lg font-semibold text-secondary-900 mb-1">
          {item.otherUser.displayName}
        </Text>
        <Text className="text-secondary-600 text-sm">
          {item.otherUser.department} • {item.otherUser.university}
        </Text>
        <Text className="text-secondary-500 text-xs mt-1">
          {formatTime(item.createdAt)}
        </Text>
      </View>

      {item.message && (
        <Text className="text-secondary-700 mb-3 leading-5">
          "{item.message}"
        </Text>
      )}

      <View className="mb-4">
        {item.otherUser.skills && item.otherUser.skills.length > 0 && (
          <>
            <Text className="text-secondary-600 text-sm mb-2">Can teach:</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {item.otherUser.skills.slice(0, 3).map((skill, index) => (
                <Chip key={index} label={skill} variant="skill" />
              ))}
              {item.otherUser.skills.length > 3 && (
                <Chip label={`+${item.otherUser.skills.length - 3} more`} variant="default" />
              )}
            </View>
          </>
        )}
        
        {item.otherUser.needs && item.otherUser.needs.length > 0 && (
          <>
            <Text className="text-secondary-600 text-sm mb-2">Wants to learn:</Text>
            <View className="flex-row flex-wrap gap-2">
              {item.otherUser.needs.slice(0, 3).map((need, index) => (
                <Chip key={index} label={need} variant="need" />
              ))}
              {item.otherUser.needs.length > 3 && (
                <Chip label={`+${item.otherUser.needs.length - 3} more`} variant="default" />
              )}
            </View>
          </>
        )}
      </View>

      {item.status === 'pending' && (
        <View className="flex-row space-x-3">
          <Button 
            title="Accept" 
            variant="primary"
            size="sm"
            onPress={() => handleAcceptRequest(item.id)}
            style={{ flex: 1 }}
          />
          <Button 
            title="Decline" 
            variant="outline"
            size="sm"
            onPress={() => handleDeclineRequest(item.id)}
            style={{ flex: 1 }}
          />
        </View>
      )}

      {item.status === 'accepted' && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3">
          <Text className="text-green-800 text-sm font-medium">
            ✅ Request accepted! You can now chat with {item.otherUser.displayName}.
          </Text>
        </View>
      )}

      {item.status === 'declined' && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3">
          <Text className="text-red-800 text-sm font-medium">
            ❌ Request declined
          </Text>
        </View>
      )}
    </Card>
  );

  const getStatusBadge = (status: PeerRequest['status']) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepted' },
      declined: { bg: 'bg-red-100', text: 'text-red-700', label: 'Declined' },
      blocked: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Blocked' }
    };
    
    const config = statusConfig[status];
    return (
      <View className={`${config.bg} px-2 py-1 rounded-full`}>
        <Text className={`${config.text} font-medium text-xs`}>
          {config.label}
        </Text>
      </View>
    );
  };

  const renderSentRequest = ({ item }: { item: RequestWithUser }) => (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-secondary-900 mb-1">
            {item.otherUser.displayName}
          </Text>
          <Text className="text-secondary-600 text-sm">
            {item.otherUser.department} • {item.otherUser.university}
          </Text>
          <Text className="text-secondary-500 text-xs mt-1">
            Sent {formatTime(item.createdAt)}
          </Text>
        </View>
        {getStatusBadge(item.status)}
      </View>

      {item.message && (
        <Text className="text-secondary-700 mb-3 leading-5">
          "{item.message}"
        </Text>
      )}

      {item.status === 'accepted' && (
        <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <Text className="text-green-800 text-sm font-medium">
            🎉 {item.otherUser.displayName} accepted your request! You can now start chatting.
          </Text>
        </View>
      )}

      {item.status === 'declined' && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <Text className="text-red-800 text-sm">
            {item.otherUser.displayName} declined your request.
          </Text>
        </View>
      )}

      {item.status === 'pending' && (
        <Text className="text-secondary-500 text-sm">
          Waiting for {item.otherUser.displayName} to respond...
        </Text>
      )}
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Loading your requests...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="flex-1">
        
        {/* Tab Navigation */}
        <View className="flex-row bg-white border-b border-secondary-200">
          <Button
            title={`Received (${receivedRequests.filter(r => r.status === 'pending').length})`}
            variant={activeTab === 'received' ? 'primary' : 'ghost'}
            onPress={() => setActiveTab('received')}
            style={{ flex: 1, borderRadius: 0 }}
          />
          <Button
            title={`Sent (${sentRequests.length})`}
            variant={activeTab === 'sent' ? 'primary' : 'ghost'}
            onPress={() => setActiveTab('sent')}
            style={{ flex: 1, borderRadius: 0 }}
          />
        </View>

        <ScrollView 
          className="flex-1 px-4 py-6"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'received' ? (
            <>
              {receivedRequests.length > 0 ? (
                <FlatList
                  data={receivedRequests}
                  renderItem={renderReceivedRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Card variant="outlined" className="items-center py-8">
                  <Text className="text-secondary-600 text-center mb-4">
                    No peer requests received yet
                  </Text>
                  <Text className="text-secondary-500 text-center text-sm">
                    When other students send you requests, they'll appear here
                  </Text>
                </Card>
              )}
            </>
          ) : (
            <>
              {sentRequests.length > 0 ? (
                <FlatList
                  data={sentRequests}
                  renderItem={renderSentRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Card variant="outlined" className="items-center py-8">
                  <Text className="text-secondary-600 text-center mb-4">
                    No requests sent yet
                  </Text>
                  <Text className="text-secondary-500 text-center text-sm">
                    Find study partners and send them requests to start collaborating
                  </Text>
                </Card>
              )}
            </>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}