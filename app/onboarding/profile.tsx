import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';

// Mock data for universities and departments (in real app, this would come from a database)
const UNIVERSITIES = [
  'Middle East Technical University (METU)',
  'Bilkent University',
  'Hacettepe University',
  'Ankara University',
  'Gazi University',
  'Other'
];

const DEPARTMENTS = [
  'Computer Engineering',
  'Software Engineering',
  'Electrical Engineering',
  'Industrial Engineering',
  'Mechanical Engineering',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Psychology',
  'Business Administration',
  'Economics',
  'International Relations',
  'Other'
];

const CITIES = [
  'Ankara',
  'Istanbul',
  'Izmir',
  'Bursa',
  'Antalya',
  'Adana',
  'Konya',
  'Other'
];

interface ProfileData {
  university: string;
  department: string;
  city: string;
  age: string;
  bio: string;
  experience: string;
}

export default function OnboardingProfileScreen() {
  const { user } = useAuthStore();
  
  const [profileData, setProfileData] = useState<ProfileData>({
    university: '',
    department: '',
    city: '',
    age: '',
    bio: '',
    experience: ''
  });

  const [errors, setErrors] = useState<Partial<ProfileData>>({});

  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ProfileData> = {};
    let isValid = true;

    if (!profileData.university.trim()) {
      newErrors.university = 'Please select your university';
      isValid = false;
    }

    if (!profileData.department.trim()) {
      newErrors.department = 'Please select your department';
      isValid = false;
    }

    if (!profileData.city.trim()) {
      newErrors.city = 'Please select your city';
      isValid = false;
    }

    if (profileData.age && (isNaN(Number(profileData.age)) || Number(profileData.age) < 16 || Number(profileData.age) > 99)) {
      newErrors.age = 'Please enter a valid age (16-99)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = async () => {
    if (!validateForm()) return;
    if (!user?.uid) return;

    try {
      // Save profile data to database
      await DatabaseService.updateUser(user.uid, {
        university: profileData.university,
        department: profileData.department,
        city: profileData.city,
        age: profileData.age ? parseInt(profileData.age) : undefined,
        bio: profileData.bio || undefined,
        experience: profileData.experience || undefined
      });
      
      // Navigate to skills selection
      router.push('/onboarding/skills');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to save profile data. Please try again.');
      console.error('Profile save error:', error);
    }
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
              <Text className="text-primary-600 font-medium">Step 1 of 3</Text>
              <Text className="text-secondary-500 text-sm">Academic Info</Text>
            </View>
            
            {/* Progress Bar */}
            <View className="w-full bg-secondary-200 rounded-full h-2">
              <View className="bg-primary-600 h-2 rounded-full" style={{ width: '33%' }} />
            </View>
          </View>

          {/* Header */}
          <View className="mb-8">
            <Text className="text-2xl font-bold text-secondary-900 mb-2">
              Tell us about yourself 📚
            </Text>
            <Text className="text-secondary-600">
              This helps us connect you with peers at your university and in your field of study.
            </Text>
          </View>

          {/* Form */}
          <Card variant="elevated" className="mb-6">
            <View className="space-y-4">
              
              {/* University */}
              <View>
                <Text className="text-sm font-medium text-secondary-700 mb-2">
                  University *
                </Text>
                <View className="space-y-2">
                  {UNIVERSITIES.map((uni) => (
                    <Button
                      key={uni}
                      title={uni}
                      variant={profileData.university === uni ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => updateField('university', uni)}
                    />
                  ))}
                </View>
                {errors.university && (
                  <Text className="text-red-500 text-sm mt-1">{errors.university}</Text>
                )}
              </View>

              {/* Department */}
              <View>
                <Text className="text-sm font-medium text-secondary-700 mb-2">
                  Department *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <Button
                      key={dept}
                      title={dept}
                      variant={profileData.department === dept ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => updateField('department', dept)}
                      style={{ marginBottom: 8 }}
                    />
                  ))}
                </View>
                {errors.department && (
                  <Text className="text-red-500 text-sm mt-1">{errors.department}</Text>
                )}
              </View>

              {/* City */}
              <View>
                <Text className="text-sm font-medium text-secondary-700 mb-2">
                  City *
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {CITIES.map((city) => (
                    <Button
                      key={city}
                      title={city}
                      variant={profileData.city === city ? 'primary' : 'outline'}
                      size="sm"
                      onPress={() => updateField('city', city)}
                      style={{ marginBottom: 8 }}
                    />
                  ))}
                </View>
                {errors.city && (
                  <Text className="text-red-500 text-sm mt-1">{errors.city}</Text>
                )}
              </View>

              {/* Age (Optional) */}
              <Input
                label="Age (Optional)"
                value={profileData.age}
                onChangeText={(value) => updateField('age', value)}
                error={errors.age}
                placeholder="e.g., 22"
                keyboardType="numeric"
                hint="Helps us show relevant study partners"
              />

              {/* Bio (Optional) */}
              <Input
                label="Bio (Optional)"
                value={profileData.bio}
                onChangeText={(value) => updateField('bio', value)}
                placeholder="Tell others about yourself..."
                multiline
                numberOfLines={3}
                hint="Share your interests, study habits, or what makes you a great study partner"
              />

              {/* Experience (Optional) */}
              <Input
                label="Study Experience (Optional)"
                value={profileData.experience}
                onChangeText={(value) => updateField('experience', value)}
                placeholder="e.g., 3rd year student, tutor experience..."
                hint="Your academic level or teaching experience"
              />

            </View>
          </Card>

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
              title="Next: Skills"
              variant="primary"
              size="lg"
              onPress={handleNext}
              style={{ flex: 2 }}
            />
          </View>

          {/* Help Text */}
          <View className="items-center">
            <Text className="text-secondary-500 text-sm text-center">
              Required fields help us find better matches. Optional fields can be added later.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}