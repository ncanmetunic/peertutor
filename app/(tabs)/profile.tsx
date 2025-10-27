import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Chip } from '../../src/components/ui/Chip';
import { useAuthStore } from '../../src/store/authStore';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();

  // Mock profile completion percentage
  const profileCompleteness = 75;

  const mockSkills = ['React Native', 'JavaScript', 'Node.js', 'MongoDB'];
  const mockNeeds = ['Machine Learning', 'Python', 'Data Science'];

  return (
    <SafeAreaView className="flex-1 bg-secondary-50">
      <ScrollView className="flex-1 px-4 py-6">
        
        {/* Profile Header */}
        <Card variant="elevated" className="mb-6 items-center">
          <View className="w-24 h-24 bg-primary-100 rounded-full items-center justify-center mb-4">
            <Text className="text-primary-600 font-bold text-3xl">
              {user?.displayName?.charAt(0) || 'U'}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold text-secondary-900 mb-1">
            {user?.displayName || 'User Name'}
          </Text>
          
          <Text className="text-secondary-600 text-center mb-4">
            {user?.email}
          </Text>

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
            onPress={() => {/* TODO: Edit profile */}}
            style={{ marginTop: 16 }}
          />
        </Card>

        {/* Skills */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            What I Can Teach
          </Text>
          
          {mockSkills.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {mockSkills.map((skill, index) => (
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
            onPress={() => {/* TODO: Edit skills */}}
          />
        </Card>

        {/* Learning Needs */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-lg font-semibold text-secondary-900 mb-4">
            What I Want to Learn
          </Text>
          
          {mockNeeds.length > 0 ? (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {mockNeeds.map((need, index) => (
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
            onPress={() => {/* TODO: Edit needs */}}
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
            onPress={() => {/* TODO: Edit bio */}}
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
              onPress={() => {/* TODO: Privacy settings */}}
            />
            
            <Button
              title="Notification Settings"
              variant="ghost"
              onPress={() => {/* TODO: Notification settings */}}
            />
            
            <Button
              title="Change Password"
              variant="ghost"
              onPress={() => {/* TODO: Change password */}}
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