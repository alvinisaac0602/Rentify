import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { MOCK_CHAT, MOCK_LANDLORDS, ChatMessage } from '../../constants/mockData';
import { ChatBubble } from '../../components/messaging/ChatBubble';
import { ViewingRequestModal } from '../../components/modals/ViewingRequestModal';

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

  const landlord = MOCK_LANDLORDS.find(l => l.id === id) ?? MOCK_LANDLORDS[0];
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [text, setText] = useState('');
  const [showViewing, setShowViewing] = useState(false);

  const sendMessage = (msg?: string) => {
    const content = msg ?? text.trim();
    if (!content) return;
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: content,
      timestamp: 'Just now',
      type: 'text',
    }]);
    setText('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendViewingRequest = () => {
    setShowViewing(false);
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      senderId: 'me',
      text: '',
      timestamp: 'Just now',
      type: 'viewing_request',
    }]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Image source={{ uri: landlord.avatar }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{landlord.name}</Text>
            {landlord.isVerified && (
              <MaterialCommunityIcons name="shield-check" size={14} color={Colors.trust} />
            )}
          </View>
          <Text style={styles.activeStatus}>● Active now</Text>
        </View>
        <TouchableOpacity style={styles.callBtn}>
          <MaterialCommunityIcons name="phone" size={20} color={Colors.primary} />
        </TouchableOpacity>
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
            isMe={item.senderId === 'me'}
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
