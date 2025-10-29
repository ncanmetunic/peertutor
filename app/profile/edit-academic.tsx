import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card } from '../../src/components/ui/Card';
import { useAuthStore } from '../../src/store/authStore';
import { DatabaseService } from '../../src/services/db';

// Mock data for universities and departments
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

export default function EditAcademicScreen() {
  const { user, setUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    university: user?.university || '',
    department: user?.department || '',
    city: user?.city || '',
    age: user?.age?.toString() || '',
    experience: user?.experience || ''
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    let isValid = true;

    if (!formData.university.trim()) {
      newErrors.university = 'Please select your university';
      isValid = false;
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Please select your department';
      isValid = false;
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please select your city';
      isValid = false;
    }

    if (formData.age && (isNaN(Number(formData.age)) || Number(formData.age) < 16 || Number(formData.age) > 99)) {
      newErrors.age = 'Please enter a valid age (16-99)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!user?.uid) return;

    try {
      setIsLoading(true);
      
      const updateData = {
        university: formData.university,
        department: formData.department,
        city: formData.city,
        age: formData.age ? parseInt(formData.age) : undefined,
        experience: formData.experience || undefined
      };

      await DatabaseService.updateUser(user.uid, updateData);

      // Update local user state
      setUser({
        ...user,
        ...updateData
      });

      Alert.alert('Success', 'Academic information updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update academic information. Please try again.');
      console.error('Academic info update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

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
              Edit Academic Information
            </Text>
            <Text className="text-secondary-600">
              Update your academic details to help us find better study partners for you.
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
                      variant={formData.university === uni ? 'primary' : 'outline'}
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
                      variant={formData.department === dept ? 'primary' : 'outline'}
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
                      variant={formData.city === city ? 'primary' : 'outline'}
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
                value={formData.age}
                onChangeText={(value) => updateField('age', value)}
                error={errors.age}
                placeholder="e.g., 22"
                keyboardType="numeric"
                hint="Helps us show relevant study partners"
              />

              {/* Experience (Optional) */}
              <Input
                label="Study Experience (Optional)"
                value={formData.experience}
                onChangeText={(value) => updateField('experience', value)}
                placeholder="e.g., 3rd year student, tutor experience..."
                hint="Your academic level or teaching experience"
              />

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
              title="Save Changes"
              variant="primary"
              size="lg"
              onPress={handleSave}
              style={{ flex: 1 }}
              loading={isLoading}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}