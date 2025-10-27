import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { Input } from '../../src/components/ui/Input';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';
import { MatchingService } from '../../src/services/matching';
import { User, MatchSuggestion } from '../../src/types';

// Mock data for potential matches
const mockPeers = [
  {
    id: '1',
    name: 'Zeynep Demir',
    university: 'METU',
    department: 'Industrial Engineering',
    city: 'Ankara',
    bio: 'Love solving optimization problems and teaching statistics!',
    skills: ['Statistics', 'Operations Research', 'Python'],
    needs: ['Machine Learning', 'Data Science'],
    matchScore: 8.2,
    profileComplete: 95
  },
  {
    id: '2',
    name: 'Can Özkan', 
    university: 'METU',
    department: 'Computer Engineering',
    city: 'Ankara',
    bio: 'Full-stack developer passionate about teaching programming.',
    skills: ['React', 'Node.js', 'JavaScript'],
    needs: ['System Design', 'DevOps'],
    matchScore: 7.8,
    profileComplete: 88
  },
  {
    id: '3',
    name: 'Selin Yıldız',
    university: 'Bilkent University', 
    department: 'Mathematics',
    city: 'Ankara',
    bio: 'PhD student interested in applied mathematics and tutoring.',
    skills: ['Calculus', 'Linear Algebra', 'Mathematical Modeling'],
    needs: ['Programming', 'Data Analysis'],
    matchScore: 6.9,
    profileComplete: 92
  }
];

interface PeerWithScore extends User {
  matchScore: number;
  commonTopics: string[];
}

export default function DiscoverScreen() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [peers, setPeers] = useState<PeerWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  const filterOptions = ['METU', 'Bilkent University', 'JavaScript', 'Python', 'Mathematics', 'Engineering'];

  useEffect(() => {
    loadPeers();
  }, [user]);

  const loadPeers = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const discoveredUsers = await DatabaseService.discoverUsers(user.uid);
      
      const peersWithScores: PeerWithScore[] = discoveredUsers.map(otherUser => {
        const score = MatchingService.calculateMatchScore(user, otherUser);
        const commonTopics = MatchingService.getCommonTopics(user, otherUser);
        
        return {
          ...otherUser,
          matchScore: score,
          commonTopics
        };
      }).filter(peer => peer.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
      
      setPeers(peersWithScores);
    } catch (error) {
      console.error('Error loading peers:', error);
      Alert.alert('Error', 'Failed to load potential matches');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         peer.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         peer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.some(filter => 
                            peer.university?.includes(filter) ||
                            peer.skills.includes(filter) ||
                            peer.needs.includes(filter)
                          );
    
    return matchesSearch && matchesFilters;
  });

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const sendPeerRequest = async (toUid: string) => {
    if (!user?.uid) return;
    
    try {
      setSending(toUid);
      await DatabaseService.sendPeerRequest(user.uid, toUid, 'Hi! I would love to connect and learn together.');
      Alert.alert('Success', 'Peer request sent successfully!');
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send peer request');
    } finally {
      setSending(null);
    }
  };

  const renderPeerCard = ({ item }: { item: PeerWithScore }) => (
    <Card variant="outlined" className="mb-4">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-lg font-semibold text-secondary-900 flex-1">
              {item.displayName}
            </Text>
            <View className="bg-primary-100 px-2 py-1 rounded-full ml-2">
              <Text className="text-primary-700 font-medium text-sm">
                {item.matchScore}/10
              </Text>
            </View>
          </View>
          <Text className="text-secondary-600 text-sm mb-1">
            {item.department} • {item.university}
          </Text>
          <Text className="text-secondary-500 text-xs">
            📍 {item.city}
          </Text>
        </View>
      </View>
      
      {item.bio && (
        <Text className="text-secondary-700 text-sm mb-3 leading-5">
          {item.bio}
        </Text>
      )}
      
      <View className="mb-3">
        <Text className="text-secondary-600 text-sm mb-2">Can teach:</Text>
        <View className="flex-row flex-wrap gap-2 mb-3">
          {item.skills.map((skill, index) => (
            <Chip key={index} label={skill} variant="skill" />
          ))}
        </View>
        
        <Text className="text-secondary-600 text-sm mb-2">Wants to learn:</Text>
        <View className="flex-row flex-wrap gap-2">
          {item.needs.map((need, index) => (
            <Chip key={index} label={need} variant="need" />
          ))}
        </View>
      </View>
      
      <View className="flex-row space-x-3">
        <Button 
          title={sending === item.uid ? "Sending..." : "Send Request"}
          variant="primary"
          size="sm"
          onPress={() => sendPeerRequest(item.uid)}
          loading={sending === item.uid}
          disabled={sending !== null}
          style={{ flex: 1 }}
        />
        <Button 
          title="View Profile" 
          variant="outline"
          size="sm"
          onPress={() => {/* TODO: View full profile */}}
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-50 justify-center items-center">
        <LoadingSpinner size="large" />
        <Text className="text-secondary-600 mt-4">Finding potential matches...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Search */}
        <View className="mb-4">
          <Input
            placeholder="Search by name, skill, or subject..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-secondary-700 mb-3">
            Quick Filters:
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <Chip
                key={filter}
                label={filter}
                selected={selectedFilters.includes(filter)}
                onPress={() => toggleFilter(filter)}
              />
            ))}
          </View>
        </View>

        {/* Results Summary */}
        <View className="mb-4">
          <Text className="text-secondary-600 text-sm">
            Found {filteredPeers.length} potential learning partner{filteredPeers.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Peers List */}
        {filteredPeers.length > 0 ? (
          <FlatList
            data={filteredPeers}
            renderItem={renderPeerCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <Card variant="outlined" className="items-center py-8">
            <Text className="text-secondary-600 text-center mb-4">
              No peers found matching your criteria.
            </Text>
            <Text className="text-secondary-500 text-center text-sm">
              Try adjusting your search or filters.
            </Text>
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}