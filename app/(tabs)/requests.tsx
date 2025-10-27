import React, { useState } from 'react';
import { View, Text, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';

// Mock data for requests
const mockRequests = {
  received: [
    {
      id: '1',
      fromUser: {
        name: 'Ali Veli',
        university: 'METU',
        department: 'Physics',
        skills: ['Mathematics', 'Physics'],
        needs: ['Programming']
      },
      message: 'Hi! I saw we both study at METU. I can help with math and physics, and would love to learn programming from you.',
      createdAt: '2 hours ago',
      status: 'pending'
    }
  ],
  sent: [
    {
      id: '2', 
      toUser: {
        name: 'Ayşe Yılmaz',
        university: 'Bilkent',
        department: 'Computer Science',
        skills: ['Machine Learning', 'Python'],
        needs: ['Web Development']
      },
      message: 'Hello! I\'d like to learn ML from you and can teach web development.',
      createdAt: '1 day ago',
      status: 'pending'
    }
  ]
};

export default function RequestsScreen() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const handleAcceptRequest = (requestId: string) => {
    // TODO: Implement accept request
    console.log('Accept request:', requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    // TODO: Implement decline request
    console.log('Decline request:', requestId);
  };

  const renderReceivedRequest = ({ item }: { item: typeof mockRequests.received[0] }) => (
    <Card variant="outlined" className="mb-4">
      <View className="mb-3">
        <Text className="text-lg font-semibold text-secondary-900 mb-1">
          {item.fromUser.name}
        </Text>
        <Text className="text-secondary-600 text-sm">
          {item.fromUser.department} • {item.fromUser.university}
        </Text>
        <Text className="text-secondary-500 text-xs mt-1">
          {item.createdAt}
        </Text>
      </View>

      <Text className="text-secondary-700 mb-3 leading-5">
        {item.message}
      </Text>

      <View className="mb-4">
        <Text className="text-secondary-600 text-sm mb-2">Can teach:</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {item.fromUser.skills.map((skill, index) => (
            <Chip key={index} label={skill} variant="skill" />
          ))}
        </View>
        
        <Text className="text-secondary-600 text-sm mb-2">Wants to learn:</Text>
        <View className="flex-row flex-wrap gap-2">
          {item.fromUser.needs.map((need, index) => (
            <Chip key={index} label={need} variant="need" />
          ))}
        </View>
      </View>

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
    </Card>
  );

  const renderSentRequest = ({ item }: { item: typeof mockRequests.sent[0] }) => (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-secondary-900 mb-1">
            {item.toUser.name}
          </Text>
          <Text className="text-secondary-600 text-sm">
            {item.toUser.department} • {item.toUser.university}
          </Text>
          <Text className="text-secondary-500 text-xs mt-1">
            Sent {item.createdAt}
          </Text>
        </View>
        <View className="bg-yellow-100 px-2 py-1 rounded-full">
          <Text className="text-yellow-700 font-medium text-xs">
            Pending
          </Text>
        </View>
      </View>

      <Text className="text-secondary-700 mb-3 leading-5">
        {item.message}
      </Text>

      <Button 
        title="Cancel Request" 
        variant="ghost"
        size="sm"
        onPress={() => {/* TODO: Cancel request */}}
      />
    </Card>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <View className="flex-1">
        
        {/* Tab Navigation */}
        <View className="flex-row bg-white border-b border-secondary-200">
          <Button
            title={`Received (${mockRequests.received.length})`}
            variant={activeTab === 'received' ? 'primary' : 'ghost'}
            onPress={() => setActiveTab('received')}
            style={{ flex: 1, borderRadius: 0 }}
          />
          <Button
            title={`Sent (${mockRequests.sent.length})`}
            variant={activeTab === 'sent' ? 'primary' : 'ghost'}
            onPress={() => setActiveTab('sent')}
            style={{ flex: 1, borderRadius: 0 }}
          />
        </View>

        <ScrollView className="flex-1 px-4 py-6">
          {activeTab === 'received' ? (
            <>
              {mockRequests.received.length > 0 ? (
                <FlatList
                  data={mockRequests.received}
                  renderItem={renderReceivedRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Card variant="outlined" className="items-center py-8">
                  <Text className="text-secondary-600 text-center">
                    No pending requests received
                  </Text>
                </Card>
              )}
            </>
          ) : (
            <>
              {mockRequests.sent.length > 0 ? (
                <FlatList
                  data={mockRequests.sent}
                  renderItem={renderSentRequest}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <Card variant="outlined" className="items-center py-8">
                  <Text className="text-secondary-600 text-center">
                    No requests sent yet
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