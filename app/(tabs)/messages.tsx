import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_MESSAGES } from '../../constants/mockData';
import { useAuth } from '../../context/AuthContext';

export default function MessagesListScreen() {
  const router = useRouter();
  const { isGuest, requireAuth } = useAuth();

  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Inbox 💬</Text>
        </View>

        {/* Guest Lock Card */}
        <View style={styles.centerContainer}>
          <LinearGradient
            colors={[Colors.primaryLight, 'rgba(235, 245, 255, 0.25)']}
            style={styles.guestCard}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="message-lock-outline" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.guestTitle}>Connect with Landlords</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to message property owners, schedule viewings, and negotiate prices in real time.
            </Text>
            
            <TouchableOpacity
              style={styles.signInBtn}
              activeOpacity={0.85}
              onPress={() => requireAuth('Sign in to view your messages')}
            >
              <Text style={styles.signInText}>Sign In / Register</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inbox 💬</Text>
          <Text style={styles.subtitle}>Direct landlord messages</Text>
        </View>
        <TouchableOpacity style={styles.composeBtn} activeOpacity={0.75}>
          <MaterialCommunityIcons name="square-edit-outline" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={MOCK_MESSAGES}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.push(`/messages/${item.senderId}` as any)}
            style={[styles.messageRow, item.unread > 0 && styles.messageRowUnread]}
          >
            {/* Avatar & Online status indicator */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
              <View style={styles.onlineBadge} />
            </View>

            {/* Content preview */}
            <View style={styles.messageContent}>
              <View style={styles.messageTop}>
                <Text style={[styles.senderName, item.unread > 0 && styles.textBold]} numberOfLines={1}>
                  {item.senderName}
                </Text>
                <Text style={styles.timestamp}>{item.timestamp}</Text>
              </View>
              
              {/* Property link reference tag */}
              <View style={styles.propertyBadge}>
                <MaterialCommunityIcons name="office-building-outline" size={10} color={Colors.primary} />
                <Text style={styles.propertyTitle} numberOfLines={1}>{item.propertyTitle}</Text>
              </View>

              <Text
                style={[styles.lastMessage, item.unread > 0 && styles.lastMessageUnread]}
                numberOfLines={1}
              >
                {item.lastMessage}
              </Text>
            </View>

            {/* Unread dot */}
            {item.unread > 0 && (
              <View style={styles.unreadColumn}>
                <View style={styles.unreadIndicator} />
              </View>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialCommunityIcons name="chat-outline" size={38} color={Colors.muted} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              Find a property you like and tap "Message Landlord" to start a chat.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing.md,
  },
  title: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.medium, marginTop: 2 },
  composeBtn: {
    width: 40, height: 40, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingBottom: 120 },
  messageRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  messageRowUnread: {
    backgroundColor: Colors.primaryLight + '20',
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 1.5, borderColor: Colors.border },
  onlineBadge: {
    position: 'absolute', bottom: 0, right: 2,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2, borderColor: Colors.white,
  },
  messageContent: { flex: 1, gap: 4 },
  messageTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  senderName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text, flex: 1, paddingRight: Spacing.xs },
  textBold: { fontWeight: FontWeight.bold, color: Colors.text },
  timestamp: { fontSize: FontSize.xs, color: Colors.muted },
  propertyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.bg,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 0.5, borderColor: Colors.border,
    maxWidth: '85%',
  },
  propertyTitle: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },
  lastMessage: { fontSize: FontSize.sm, color: Colors.muted, lineHeight: 18 },
  lastMessageUnread: { color: Colors.text, fontWeight: FontWeight.semibold },
  unreadColumn: {
    justifyContent: 'center',
    paddingLeft: Spacing.xs,
  },
  unreadIndicator: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.base,
    paddingBottom: 40,
  },
  guestCard: {
    padding: Spacing.xl,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary + '15',
    ...Shadow.sm,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  guestTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  guestSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  signInBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 13,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
    ...Shadow.sm,
  },
  signInText: { color: Colors.white, fontSize: FontSize.base, fontWeight: FontWeight.bold },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    marginTop: 80,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
