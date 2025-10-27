import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { Chip } from '../../src/components/ui/Chip';
import { useAuthStore } from '../../src/store/authStore';
import { SKILLS_DATABASE, searchSkills } from '../../src/data/skillsDatabase';

export default function OnboardingSkillsScreen() {
  const { user } = useAuthStore();
  
  // Skills the user can teach
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  
  // Skills the user wants to learn
  const [learningNeeds, setLearningNeeds] = useState<string[]>([]);
  
  // Selected category for browsing
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  
  // Current mode: 'teaching' or 'learning'
  const [currentMode, setCurrentMode] = useState<'teaching' | 'learning'>('teaching');

  const MAX_SKILLS = 5;

  const addSkill = (skill: string, type: 'teaching' | 'learning') => {
    if (type === 'teaching') {
      if (teachingSkills.length >= MAX_SKILLS) {
        Alert.alert('Limit Reached', `You can select up to ${MAX_SKILLS} skills to teach`);
        return;
      }
      if (!teachingSkills.includes(skill)) {
        setTeachingSkills(prev => [...prev, skill]);
      }
    } else {
      if (learningNeeds.length >= MAX_SKILLS) {
        Alert.alert('Limit Reached', `You can select up to ${MAX_SKILLS} skills to learn`);
        return;
      }
      if (!learningNeeds.includes(skill)) {
        setLearningNeeds(prev => [...prev, skill]);
      }
    }
  };

  const removeSkill = (skill: string, type: 'teaching' | 'learning') => {
    if (type === 'teaching') {
      setTeachingSkills(prev => prev.filter(s => s !== skill));
    } else {
      setLearningNeeds(prev => prev.filter(s => s !== skill));
    }
  };

  const getDisplayedSkills = () => {
    if (searchQuery.trim()) {
      return searchSkills(searchQuery);
    }
    
    if (selectedCategory) {
      const category = SKILLS_DATABASE.find(cat => cat.id === selectedCategory);
      return category ? category.skills : [];
    }
    
    return [];
  };

  const validateForm = () => {
    if (teachingSkills.length === 0) {
      Alert.alert('Skills Required', 'Please select at least one skill you can teach to help others.');
      return false;
    }
    
    if (learningNeeds.length === 0) {
      Alert.alert('Learning Goals Required', 'Please select at least one skill you want to learn.');
      return false;
    }
    
    return true;
  };

  const handleFinish = () => {
    if (!validateForm()) return;

    // Store skills data temporarily (in real app, save to Firestore)
    console.log('Skills to teach:', teachingSkills);
    console.log('Skills to learn:', learningNeeds);
    
    Alert.alert(
      'Profile Complete! 🎉',
      'Welcome to PeerTutor! You can now start connecting with study partners.',
      [
        {
          text: 'Start Exploring',
          onPress: () => router.replace('/(tabs)')
        }
      ]
    );
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6 py-6">
          
          {/* Progress Header */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-primary-600 font-medium">Step 2 of 3</Text>
              <Text className="text-secondary-500 text-sm">Skills & Learning</Text>
            </View>
            
            {/* Progress Bar */}
            <View className="w-full bg-secondary-200 rounded-full h-2">
              <View className="bg-primary-600 h-2 rounded-full" style={{ width: '66%' }} />
            </View>
          </View>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-secondary-900 mb-2">
              Share your expertise 🎯
            </Text>
            <Text className="text-secondary-600">
              Select skills you can teach and subjects you want to learn. This helps us find the perfect study partners for you.
            </Text>
          </View>

          {/* Mode Toggle */}
          <View className="flex-row mb-6">
            <Button
              title={`Skills I Can Teach (${teachingSkills.length}/${MAX_SKILLS})`}
              variant={currentMode === 'teaching' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setCurrentMode('teaching')}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={`Want to Learn (${learningNeeds.length}/${MAX_SKILLS})`}
              variant={currentMode === 'learning' ? 'primary' : 'outline'}
              size="sm"
              onPress={() => setCurrentMode('learning')}
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>

          {/* Selected Skills Display */}
          <Card variant="elevated" className="mb-6">
            <Text className="text-lg font-semibold text-secondary-900 mb-4">
              {currentMode === 'teaching' ? 'Skills You Can Teach' : 'Skills You Want to Learn'}
            </Text>
            
            {(currentMode === 'teaching' ? teachingSkills : learningNeeds).length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {(currentMode === 'teaching' ? teachingSkills : learningNeeds).map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    variant={currentMode === 'teaching' ? 'skill' : 'need'}
                    removable
                    onRemove={() => removeSkill(skill, currentMode)}
                  />
                ))}
              </View>
            ) : (
              <Text className="text-secondary-500 italic">
                {currentMode === 'teaching' 
                  ? 'Select skills you can help others learn'
                  : 'Select skills you want to learn from peers'
                }
              </Text>
            )}
          </Card>

          {/* Search */}
          <Input
            label="Search Skills"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="e.g., JavaScript, Calculus, Chemistry..."
            hint="Type to search through 200+ skills"
            style={{ marginBottom: 16 }}
          />

          {/* Categories */}
          {!searchQuery.trim() && (
            <Card variant="outlined" className="mb-6">
              <Text className="text-base font-medium text-secondary-900 mb-4">
                Browse by Category
              </Text>
              
              <View className="flex-row flex-wrap gap-2">
                {SKILLS_DATABASE.map((category) => (
                  <Button
                    key={category.id}
                    title={`${category.icon} ${category.name}`}
                    variant={selectedCategory === category.id ? 'primary' : 'outline'}
                    size="sm"
                    onPress={() => {
                      setSelectedCategory(selectedCategory === category.id ? null : category.id);
                    }}
                    style={{ marginBottom: 8 }}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* Skills List */}
          {(searchQuery.trim() || selectedCategory) && (
            <Card variant="outlined" className="mb-6">
              <Text className="text-base font-medium text-secondary-900 mb-4">
                {searchQuery.trim() 
                  ? `Search Results (${getDisplayedSkills().length})`
                  : `${SKILLS_DATABASE.find(cat => cat.id === selectedCategory)?.name} Skills`
                }
              </Text>
              
              {getDisplayedSkills().length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {getDisplayedSkills().map((skill, index) => {
                    const isSelected = currentMode === 'teaching' 
                      ? teachingSkills.includes(skill)
                      : learningNeeds.includes(skill);
                    
                    return (
                      <Button
                        key={index}
                        title={skill}
                        variant={isSelected ? 'primary' : 'ghost'}
                        size="sm"
                        onPress={() => {
                          if (isSelected) {
                            removeSkill(skill, currentMode);
                          } else {
                            addSkill(skill, currentMode);
                          }
                        }}
                        style={{ marginBottom: 8 }}
                      />
                    );
                  })}
                </View>
              ) : (
                <Text className="text-secondary-500 italic">
                  No skills found. Try a different search term.
                </Text>
              )}
            </Card>
          )}

          {/* Navigation Buttons */}
          <View className="flex-row space-x-4 mb-8">
            <Button
              title="Back"
              variant="outline"
              size="lg"
              onPress={handleBack}
              style={{ flex: 1 }}
            />
            <Button
              title="Complete Setup"
              variant="primary"
              size="lg"
              onPress={handleFinish}
              style={{ flex: 2 }}
              disabled={teachingSkills.length === 0 || learningNeeds.length === 0}
            />
          </View>

          {/* Help Text */}
          <View className="items-center">
            <Text className="text-secondary-500 text-sm text-center">
              You need at least 1 skill to teach and 1 skill to learn. You can add more skills later in your profile.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}