import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'application' | 'message' | 'price' | 'alert' | 'match';
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
    const { db } = require('../../config/firebase');

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const list: NotificationItem[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          title: data.title || 'Notification',
          message: data.message || '',
          time: data.createdAt 
            ? new Date(data.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          read: !!data.read,
          type: data.type || 'alert',
        });
      });

      setNotifications(list);
      setLoading(false);
    }, (error: any) => {
      console.log('Notifications onSnapshot error:', error);
      setNotifications([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllRead = async () => {
    if (!user) return;
    try {
      const { doc, writeBatch } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      const batch = writeBatch(db);
      
      notifications.forEach(n => {
        if (!n.read) {
          const docRef = doc(db, 'notifications', n.id);
          batch.update(docRef, { read: true });
        }
      });
      
      await batch.commit();
    } catch (e) {
      console.log('Error marking notifications read:', e);
    }
  };

  const toggleRead = async (id: string) => {
    try {
      const { doc, updateDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      const docRef = doc(db, 'notifications', id);
      await updateDoc(docRef, { read: true });
    } catch (e) {
      console.log('Error marking single notification read:', e);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { doc, deleteDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');
      const docRef = doc(db, 'notifications', id);
      await deleteDoc(docRef);
    } catch (e) {
      console.log('Error deleting notification:', e);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'application': return { name: 'file-check-outline' as const, color: Colors.success };
      case 'message': return { name: 'message-text-outline' as const, color: Colors.primary };
      case 'price': return { name: 'tag-outline' as const, color: Colors.warning };
      case 'alert': return { name: 'shield-alert-outline' as const, color: Colors.trust };
      case 'match': return { name: 'home-search-outline' as const, color: '#7C3AED' };
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markReadText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="bell-off-outline" size={36} color={Colors.muted} />
          </View>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>You don't have any notifications right now.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const iconInfo = getIcon(item.type);
            return (
              <TouchableOpacity
                style={[styles.notificationCard, !item.read && styles.unreadCard]}
                activeOpacity={0.75}
                onPress={() => toggleRead(item.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: iconInfo.color + '10' }]}>
                  <MaterialCommunityIcons name={iconInfo.name} size={20} color={iconInfo.color} />
                </View>

                <View style={styles.contentContainer}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, !item.read && styles.unreadText]}>
                      {item.title}
                    </Text>
                    <Text style={styles.timeText}>{item.time}</Text>
                  </View>
                  <Text style={styles.messageText} numberOfLines={2}>
                    {item.message}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteNotification(item.id)}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.danger} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1, marginLeft: Spacing.xs },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  badge: { backgroundColor: Colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  badgeText: { color: Colors.white, fontSize: FontSize.xs - 1, fontWeight: FontWeight.bold },
  markReadText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.base, gap: Spacing.sm },
  notificationCard: {
    flexDirection: 'row', padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', gap: Spacing.md, ...Shadow.sm,
  },
  unreadCard: {
    backgroundColor: Colors.primaryLight + '20',
    borderColor: Colors.primary + '20',
  },
  iconContainer: {
    width: 40, height: 40, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  contentContainer: { flex: 1, gap: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.semibold, color: Colors.text },
  unreadText: { fontWeight: FontWeight.bold },
  timeText: { fontSize: FontSize.xs, color: Colors.muted },
  messageText: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  deleteBtn: { padding: Spacing.xs },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.sm },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  emptySubtitle: { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center' },
});
