import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { useAuthStore } from '../../src/store/authStore';
import { storageService } from '../../src/services/storage';
import { userService } from '../../src/services/userService';

export default function ProfileScreen() {
  const { user, signOut, updateUserProfile } = useAuthStore();
  const [isUploading, setIsUploading] = useState(false);

  // Calculate profile completion percentage
  const calculateProfileCompleteness = () => {
    if (!user) return 0;
    
    let completed = 0;
    const totalFields = 8;
    
    if (user.displayName) completed++;
    if (user.university) completed++;
    if (user.department) completed++;
    if (user.city) completed++;
    if (user.bio && user.bio.length > 10) completed++;
    if (user.experience) completed++;
    if (user.skills && user.skills.length > 0) completed++;
    if (user.needs && user.needs.length > 0) completed++;
    
    return Math.round((completed / totalFields) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();

  const handleAvatarUpload = async () => {
    if (!user) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant access to your photo library to upload a profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setIsUploading(true);
      const imageUri = result.assets[0].uri;
      
      const downloadURL = await storageService.uploadProfilePicture(user.uid, imageUri);
      
      await userService.updateUserProfile(user.uid, { photoURL: downloadURL });
      updateUserProfile({ photoURL: downloadURL });
      
      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Profile Header */}
        <Card variant="elevated" className="mb-6 items-center">
          <TouchableOpacity 
            className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4 overflow-hidden"
            onPress={handleAvatarUpload}
            disabled={isUploading}
          >
            {user?.photoURL ? (
              <Image 
                source={{ uri: user.photoURL }} 
                className="w-full h-full"
                style={{ opacity: isUploading ? 0.5 : 1 }}
              />
            ) : (
              <Text className="text-primary-600 font-bold text-3xl">
                {user?.displayName?.charAt(0) || 'U'}
              </Text>
            )}
            {isUploading && (
              <View className="absolute inset-0 bg-black/20 items-center justify-center">
                <Text className="text-white text-xs">Uploading...</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <Text className="text-2xl font-bold text-secondary-900 mb-1">
            {user?.displayName || 'User Name'}
          </Text>
          
          <Text className="text-secondary-600 text-center mb-2">
            {user?.email}
          </Text>
          
          {user?.age && (
            <Text className="text-secondary-500 text-center mb-4">
              Age: {user.age}
            </Text>
          )}

          {/* Profile Completion */}
          <View className="w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-secondary-600">Profile Completeness</Text>
              <Text className="text-sm font-medium text-primary-600">{profileCompleteness}%</Text>
            </View>
            <View className="w-full bg-secondary-200 rounded-full h-2">
              <View 
                className="bg-primary-600 h-2 rounded-full" 
                style={{ width: `${profileCompleteness}%` }}
              />
            </View>
          </View>
        </Card>

        {/* Academic Info */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Academic Information
          </Text>
          
          <View className="space-y-3">
            <View>
              <Text className="text-sm text-secondary-600 mb-1">University</Text>
              <Text className="text-secondary-900">
                {user?.university || 'Not specified'}
              </Text>
            </View>
            
            <View>
              <Text className="text-sm text-secondary-600 mb-1">Department</Text>
              <Text className="text-secondary-900">
                {user?.department || 'Not specified'}
              </Text>
            </View>
            
            <View>
              <Text className="text-sm text-secondary-600 mb-1">City</Text>
              <Text className="text-secondary-900">
                {user?.city || 'Not specified'}
              </Text>
            </View>
          </View>

          <Button
            title="Edit Academic Info"
            variant="outline"
            size="sm"
            onPress={() => router.push('/profile/edit-academic')}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Skills */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            What I Can Teach
          </Text>
          
          {user?.skills && user.skills.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {user.skills.map((skill, index) => (
                <Chip key={index} label={skill} variant="skill" />
              ))}
            </View>
          ) : (
            <Text className="text-secondary-600 mb-4">
              No skills added yet
            </Text>
          )}

          <Button
            title="Manage Skills"
            variant="outline"
            size="sm"
            onPress={() => router.push('/profile/edit-skills')}
          />
        </Card>

        {/* Learning Needs */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            What I Want to Learn
          </Text>
          
          {user?.needs && user.needs.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {user.needs.map((need, index) => (
                <Chip key={index} label={need} variant="need" />
              ))}
            </View>
          ) : (
            <Text className="text-secondary-600 mb-4">
              No learning goals added yet
            </Text>
          )}

          <Button
            title="Manage Learning Goals"
            variant="outline"
            size="sm"
            onPress={() => router.push('/profile/edit-skills')}
          />
        </Card>

        {/* Bio */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            About Me
          </Text>
          
          <Text className="text-secondary-700 mb-4 leading-5">
            {user?.bio || 'No bio added yet. Tell others about yourself!'}
          </Text>

          <Button
            title="Edit Bio"
            variant="outline"
            size="sm"
            onPress={() => router.push('/profile/edit-bio')}
          />
        </Card>

        {/* Settings */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            Settings
          </Text>
          
          <View className="space-y-3">
            <Button
              title="Privacy Settings"
              variant="ghost"
              onPress={() => router.push('/profile/privacy-settings')}
            />
            
            <Button
              title="Notification Settings"
              variant="ghost"
              onPress={() => router.push('/profile/notification-settings')}
            />
            
            <Button
              title="Change Password"
              variant="ghost"
              onPress={() => router.push('/profile/change-password')}
            />
          </View>
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={signOut}
          style={{ marginBottom: 32 }}
        />

      </ScrollView>
    </SafeAreaView>
  );
}