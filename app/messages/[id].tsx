import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  collection, query, orderBy, onSnapshot, addDoc,
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { ChatBubble } from '../../components/messaging/ChatBubble';
import { useAuth } from '../../context/AuthContext';

interface ChatMsg {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: 'text' | 'viewing_request' | 'booking';
}

const QUICK_REPLIES = [
  'Is this still available?',
  'Can we arrange a viewing?',
  'What documents do I need?',
  'Is the price negotiable?',
];

export default function ChatScreen() {
  const { id, propertyId, propertyTitle } = useLocalSearchParams<{
    id: string;          // other user's UID
    propertyId?: string;
    propertyTitle?: string;
  }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { user: me } = useAuth();

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    name: string; avatar: string; isVerified: boolean; phone?: string;
  } | null>(null);

  // Deterministic conversation ID — same for both parties
  const conversationId = me && id ? [me.id, id].sort().join('_') : '';

  // ── Fetch other participant's profile ─────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', id));
        if (snap.exists()) {
          const d = snap.data();
          setOtherUser({
            name: d.displayName || d.name || 'User',
            avatar: d.avatarUrl || d.avatar || '',
            isVerified: !!d.isVerified,
            phone: d.phoneNumber || d.phone,
          });
        } else {
          setOtherUser({ name: 'User', avatar: '', isVerified: false });
        }
      } catch (e) {
        setOtherUser({ name: 'User', avatar: '', isVerified: false });
      }
    })();
  }, [id]);

  // ── Real-time messages listener (subcollection) ───────────────────────────
  useEffect(() => {
    if (!conversationId) return;

    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: ChatMsg[] = snap.docs.map(d => {
        const data = d.data();
        const ts = data.createdAt?.seconds
          ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : 'Just now';
        return {
          id: d.id,
          senderId: data.senderId || '',
          senderName: data.senderName || '',
          text: data.text || '',
          timestamp: ts,
          type: data.type || 'text',
        };
      });
      setMessages(list);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }, err => {
      console.log('Chat listener error:', err.message);
    });

    return () => unsub();
  }, [conversationId]);

  // ── Ensure conversation doc exists before sending first message ───────────
  const ensureConversation = useCallback(async (lastMsg: string) => {
    if (!me || !id || !conversationId) return;
    await setDoc(doc(db, 'conversations', conversationId), {
      participants: [me.id, id],
      lastMessage: lastMsg,
      lastMessageSenderId: me.id,
      updatedAt: serverTimestamp(),
      propertyTitle: propertyTitle || 'Rentify Listing',
      propertyId: propertyId || null,
    }, { merge: true });
  }, [me, id, conversationId, propertyTitle, propertyId]);

  // ── Send a message ────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (msg?: string) => {
    const content = (msg ?? text).trim();
    if (!content || !me || !conversationId) return;
    setSending(true);
    setText('');
    try {
      const msgsRef = collection(db, 'conversations', conversationId, 'messages');
      await Promise.all([
        addDoc(msgsRef, {
          senderId: me.id,
          senderName: me.name,
          text: content,
          type: 'text',
          createdAt: serverTimestamp(),
        }),
        ensureConversation(content),
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  }, [text, me, conversationId, ensureConversation]);

  // ── Send viewing request as a special message ─────────────────────────────
  const sendViewingRequest = useCallback(async () => {
    if (!me || !conversationId) return;
    const preview = '📆 Requested a property viewing';
    try {
      const msgsRef = collection(db, 'conversations', conversationId, 'messages');
      await Promise.all([
        addDoc(msgsRef, {
          senderId: me.id,
          senderName: me.name,
          text: preview,
          type: 'viewing_request',
          createdAt: serverTimestamp(),
        }),
        ensureConversation(preview),
      ]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send viewing request.');
    }
  }, [me, conversationId, ensureConversation]);

  const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'U')}&background=1A56DB&color=fff&size=120`;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>

        <Image
          source={{ uri: otherUser?.avatar || avatarFallback }}
          style={styles.avatar}
          defaultSource={{ uri: avatarFallback }}
        />

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser?.name || 'Loading…'}
            </Text>
            {otherUser?.isVerified && (
              <MaterialCommunityIcons name="shield-check" size={14} color={Colors.trust} />
            )}
          </View>
          {propertyTitle ? (
            <Text style={styles.propertySubtitle} numberOfLines={1}>
              📍 {propertyTitle}
            </Text>
          ) : (
            <Text style={styles.activeStatus}>● Active now</Text>
          )}
        </View>

        {otherUser?.phone && (
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => {
              const { Linking } = require('react-native');
              Linking.openURL(`tel:${otherUser.phone}`).catch(() => Alert.alert('Error', 'Unable to place call.'));
            }}
          >
            <MaterialCommunityIcons name="phone" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.callBtn}
          onPress={() => router.push(`/screens/viewing-request?propertyId=${propertyId || ''}&landlordId=${id}` as any)}
        >
          <MaterialCommunityIcons name="calendar-plus" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Property context banner ─────────────────────────────────────── */}
      {propertyTitle && (
        <View style={styles.contextBanner}>
          <MaterialCommunityIcons name="office-building-outline" size={14} color={Colors.primary} />
          <Text style={styles.contextText} numberOfLines={1}>Chatting about: {propertyTitle}</Text>
        </View>
      )}

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <View style={styles.emptyChatIcon}>
              <MaterialCommunityIcons name="chat-outline" size={32} color={Colors.muted} />
            </View>
            <Text style={styles.emptyChatTitle}>Start the conversation</Text>
            <Text style={styles.emptyChatSub}>
              Say hi or use a quick reply below to get started.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChatBubble
            text={item.text}
            isMe={item.senderId === me?.id}
            timestamp={item.timestamp}
            type={item.type}
          />
        )}
      />

      {/* ── Input area ─────────────────────────────────────────────────── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Quick replies — only show when no messages or first chat */}
        {messages.length < 3 && (
          <FlatList
            horizontal
            data={QUICK_REPLIES}
            keyExtractor={r => r}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickRepliesRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.quickReply}
                onPress={() => sendMessage(item)}
                activeOpacity={0.75}
              >
                <Text style={styles.quickReplyText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={styles.inputBar}>
          {/* Viewing request shortcut */}
          <TouchableOpacity style={styles.attachBtn} onPress={sendViewingRequest}>
            <MaterialCommunityIcons name="calendar-check-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage()}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (text.trim().length === 0 || sending) && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={text.trim().length === 0 || sending}
          >
            {sending
              ? <ActivityIndicator size="small" color={Colors.white} />
              : <MaterialCommunityIcons name="send" size={18} color={Colors.white} />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.surfaceSecondary,
  },
  headerInfo: { flex: 1, gap: 2, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, flex: 1 },
  activeStatus: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.medium },
  propertySubtitle: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  callBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },

  contextBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.base, paddingVertical: 7,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 0.5, borderBottomColor: Colors.primary + '20',
  },
  contextText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.semibold, flex: 1 },

  messageList: { padding: Spacing.base, paddingBottom: Spacing.sm, flexGrow: 1 },

  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: Spacing.md },
  emptyChatIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center',
  },
  emptyChatTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  emptyChatSub: { fontSize: FontSize.sm, color: Colors.muted, textAlign: 'center', lineHeight: 19, paddingHorizontal: Spacing.xl },

  quickRepliesRow: { paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm },
  quickReply: {
    paddingHorizontal: Spacing.md, paddingVertical: 7,
    borderRadius: Radius.full, borderWidth: 1.2, borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  quickReplyText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  attachBtn: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1, fontSize: FontSize.base, color: Colors.text,
    maxHeight: 100, paddingVertical: 9, paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bg, borderRadius: Radius.xl,
    borderWidth: 1.2, borderColor: Colors.border,
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.border },
});
