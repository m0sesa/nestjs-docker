import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications in device settings');
        setNotificationsEnabled(false);
      }
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Implement account deletion
            Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showArrow = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color="#3b82f6" />
        </View>
        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showArrow && <Ionicons name="chevron-forward" size={20} color="#9ca3af" />}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Text>
          </View>
          <View>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <SettingItem
          icon="person-outline"
          title="Profile"
          subtitle="Edit your personal information"
          onPress={() => router.push('/profile')}
          showArrow
        />

        <SettingItem
          icon="key-outline"
          title="Change Password"
          subtitle="Update your account password"
          onPress={() => {
            Alert.alert('Feature Coming Soon', 'Password change will be available in a future update');
          }}
          showArrow
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <SettingItem
          icon="notifications-outline"
          title="Push Notifications"
          subtitle="Receive app notifications"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
            />
          }
        />

        <SettingItem
          icon="finger-print-outline"
          title="Biometric Login"
          subtitle="Use fingerprint or face ID"
          rightElement={
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={biometricEnabled ? '#ffffff' : '#f4f3f4'}
            />
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <SettingItem
          icon="help-circle-outline"
          title="Help Center"
          subtitle="Get help and support"
          onPress={() => {
            Alert.alert('Help Center', 'Visit our help center at help.interestingapp.local');
          }}
          showArrow
        />

        <SettingItem
          icon="document-text-outline"
          title="Terms of Service"
          subtitle="Read our terms and conditions"
          onPress={() => {
            Alert.alert('Terms of Service', 'Terms will be displayed in a future update');
          }}
          showArrow
        />

        <SettingItem
          icon="shield-outline"
          title="Privacy Policy"
          subtitle="Learn about our privacy practices"
          onPress={() => {
            Alert.alert('Privacy Policy', 'Privacy policy will be displayed in a future update');
          }}
          showArrow
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <SettingItem
          icon="information-circle-outline"
          title="About"
          subtitle="Version 1.0.0"
          onPress={() => {
            Alert.alert(
              'NestJS Docker Mobile',
              'Version 1.0.0\nBuilt with Expo and React Native\n\n© 2025 NestJS Docker Project'
            );
          }}
          showArrow
        />

        <SettingItem
          icon="bug-outline"
          title="Report Bug"
          subtitle="Help us improve the app"
          onPress={() => {
            Alert.alert('Report Bug', 'Bug reporting will be available in a future update');
          }}
          showArrow
        />
      </View>

      <View style={styles.dangerSection}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, styles.dangerIconContainer]}>
              <Ionicons name="trash-outline" size={24} color="#ef4444" />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.dangerTitle}>Delete Account</Text>
              <Text style={styles.settingSubtitle}>Permanently delete your account</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.logoutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  section: {
    marginTop: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerSection: {
    marginTop: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#fca5a5',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  dangerIconContainer: {
    backgroundColor: '#fef2f2',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ef4444',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});