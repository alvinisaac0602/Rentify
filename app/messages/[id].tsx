import { StatusBar } from 'expo-status-bar';
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { ChatMessage } from '../../constants/mockData';
import { ChatBubble } from '../../components/messaging/ChatBubble';
import { ViewingRequestModal } from '../../components/modals/ViewingRequestModal';
import { useAuth } from '../../context/AuthContext';

const QUICK_REPLIES = [
  'Is this still available?',
  'Can we arrange a viewing?',
  'What documents do I need?',
  'Is the price negotiable?',
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { user: currentUser } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [showViewing, setShowViewing] = useState(false);
  const [otherUser, setOtherUser] = useState<{
    name: string;
    avatar: string;
    isVerified: boolean;
    phone?: string;
  } | null>(null);

  // 1. Fetch other participant's details (landlord or tenant)
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!id) return;
      
      // Fetch from Firestore
      try {
        const { getDoc, doc } = require('firebase/firestore');
        const { db } = require('../../config/firebase');
        const userRef = doc(db, 'users', id);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setOtherUser({
            name: userData.name || 'User',
            avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
            isVerified: !!userData.isVerified,
            phone: userData.phone || undefined,
          });
        } else {
          setOtherUser({
            name: 'User',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
            isVerified: false,
          });
        }
      } catch (err) {
        console.error('Error fetching chat user details:', err);
      }
    };

    fetchOtherUser();
  }, [id]);

  // 2. Generate Conversation ID and listen to messages in real-time
  const conversationId = currentUser && id 
    ? [currentUser.id, id].sort().join('_') 
    : '';

  useEffect(() => {
    if (!conversationId) return;

    const { collection, query, where, orderBy, onSnapshot } = require('firebase/firestore');
    const { db } = require('../../config/firebase');

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        msgs.push({
          id: docSnap.id,
          senderId: data.senderId,
          text: data.text || '',
          timestamp: data.createdAt 
            ? new Date(data.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : 'Just now',
          type: data.type || 'text',
        });
      });
      
      if (msgs.length === 0) {
        // Default welcoming mock greeting
        setMessages([
          {
            id: 'welcome',
            senderId: id || 'system',
            text: `Hello! Thanks for your interest. Let me know if you have any questions!`,
            timestamp: 'Just now',
            type: 'text',
          }
        ]);
      } else {
        setMessages(msgs);
      }
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
    });

    return () => unsubscribe();
  }, [conversationId, id]);

  const sendMessage = async (msg?: string) => {
    const content = msg ?? text.trim();
    if (!content || !currentUser || !conversationId) return;

    try {
      const { addDoc, collection, serverTimestamp, doc, setDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');

      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: content,
        createdAt: serverTimestamp(),
        type: 'text',
      });

      // Update the main conversations summary list document
      await setDoc(doc(db, 'conversations', conversationId), {
        id: conversationId,
        participants: [currentUser.id, id],
        lastMessage: content,
        lastMessageSenderId: currentUser.id,
        updatedAt: serverTimestamp(),
        propertyTitle: 'Rentify Listing',
      }, { merge: true });
      
      setText('');
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const sendViewingRequest = async () => {
    setShowViewing(false);
    if (!currentUser || !conversationId) return;

    try {
      const { addDoc, collection, serverTimestamp, doc, setDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');

      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: 'Sent a viewing request calendar invite',
        createdAt: serverTimestamp(),
        type: 'viewing_request',
      });

      // Update the main conversations summary list document
      await setDoc(doc(db, 'conversations', conversationId), {
        id: conversationId,
        participants: [currentUser.id, id],
        lastMessage: '📆 Requested a property viewing',
        lastMessageSenderId: currentUser.id,
        updatedAt: serverTimestamp(),
        propertyTitle: 'Rentify Listing',
      }, { merge: true });

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.error('Error sending viewing request:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="auto" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Image source={{ uri: otherUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80' }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{otherUser?.name || 'Loading...'}</Text>
            {otherUser?.isVerified && (
              <MaterialCommunityIcons name="shield-check" size={14} color={Colors.trust} />
            )}
          </View>
          <Text style={styles.activeStatus}>● Active now</Text>
        </View>
        {otherUser?.phone && (
          <TouchableOpacity style={styles.callBtn} onPress={() => {
            const { Linking } = require('react-native');
            Linking.openURL(`tel:${otherUser.phone}`).catch(() => Alert.alert('Error', 'Unable to place call.'));
          }}>
            <MaterialCommunityIcons name="phone" size={20} color={Colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <ChatBubble
            text={item.text}
            isMe={item.senderId === currentUser?.id}
            timestamp={item.timestamp}
            type={item.type}
          />
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Quick replies */}
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

        {/* Input bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowViewing(true)}
          >
            <MaterialCommunityIcons name="calendar-plus" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Type a message…"
            placeholderTextColor={Colors.placeholder}
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, text.trim().length === 0 && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            disabled={text.trim().length === 0}
          >
            <MaterialCommunityIcons name="send" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <ViewingRequestModal
        visible={showViewing}
        onClose={() => setShowViewing(false)}
        onSent={sendViewingRequest}
        propertyTitle="this property"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.md,
    backgroundColor: Colors.surface, borderBottomWidth: 0.5, borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  headerInfo: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  activeStatus: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.medium },
  callBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  messageList: { padding: Spacing.base, paddingBottom: Spacing.sm },
  quickRepliesRow: {
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm, gap: Spacing.sm,
  },
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
    backgroundColor: Colors.surface, borderTopWidth: 0.5, borderTopColor: Colors.border,
  },
  attachBtn: {
    width: 38, height: 38, alignItems: 'center', justifyContent: 'center',
  },
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
