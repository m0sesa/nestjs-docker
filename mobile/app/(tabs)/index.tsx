import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { UserAPI, NotificationAPI } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface DashboardStats {
  totalUsers: number;
  recentNotifications: number;
  systemStatus: 'online' | 'offline' | 'maintenance';
}

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    recentNotifications: 0,
    systemStatus: 'online',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Simulated dashboard data - replace with actual API calls
      const [usersResponse, notificationsResponse] = await Promise.allSettled([
        UserAPI.getUsers(1, 1), // Just to get total count
        NotificationAPI.getNotifications(1, 10),
      ]);

      setStats({
        totalUsers: usersResponse.status === 'fulfilled' ? usersResponse.value.totalCount || 0 : 0,
        recentNotifications: notificationsResponse.status === 'fulfilled' ? notificationsResponse.value.totalCount || 0 : 0,
        systemStatus: 'online',
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#10b981';
      case 'maintenance': return '#f59e0b';
      case 'offline': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people" size={24} color="#3b82f6" />
          </View>
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="notifications" size={24} color="#f59e0b" />
          </View>
          <Text style={styles.statNumber}>{stats.recentNotifications}</Text>
          <Text style={styles.statLabel}>Notifications</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(stats.systemStatus) }
              ]}
            />
          </View>
          <Text style={[styles.statLabel, { marginTop: 8 }]}>System Status</Text>
          <Text style={[styles.statusText, { color: getStatusColor(stats.systemStatus) }]}>
            {stats.systemStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/profile')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="person" size={24} color="#3b82f6" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Profile Settings</Text>
            <Text style={styles.actionSubtitle}>Update your profile information</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(tabs)/camera')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="camera" size={24} color="#10b981" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Take Photo</Text>
            <Text style={styles.actionSubtitle}>Capture and upload images</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={async () => {
            try {
              await NotificationAPI.sendTestNotification('Test notification from mobile app');
              Alert.alert('Success', 'Test notification sent!');
            } catch (error) {
              Alert.alert('Error', 'Failed to send notification');
            }
          }}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="send" size={24} color="#f59e0b" />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Send Test Notification</Text>
            <Text style={styles.actionSubtitle}>Test notification system</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});