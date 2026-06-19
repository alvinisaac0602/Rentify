import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ChatBubbleProps {
  text: string;
  isMe: boolean;
  timestamp: string;
  type?: 'text' | 'viewing_request' | 'booking';
}

export function ChatBubble({ text, isMe, timestamp, type = 'text' }: ChatBubbleProps) {
  if (type === 'viewing_request') {
    return (
      <View style={[styles.row, isMe && styles.rowMe]}>
        <View style={styles.specialBubble}>
          <MaterialCommunityIcons name="calendar-check" size={18} color={Colors.primary} />
          <Text style={styles.specialText}>Viewing request sent</Text>
          <Text style={styles.specialSub}>Waiting for confirmation</Text>
        </View>
        <Text style={[styles.time, isMe && { textAlign: 'right' }]}>{timestamp}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.text, isMe && styles.textMe]}>{text}</Text>
      </View>
      <Text style={[styles.time, isMe && { textAlign: 'right' }]}>{timestamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    gap: 3,
    maxWidth: '75%',
    marginBottom: Spacing.md,
  },
  rowMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.xl,
  },
  bubbleThem: {
    backgroundColor: Colors.surfaceSecondary,
    borderBottomLeftRadius: 4,
  },
  bubbleMe: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 21,
  },
  textMe: {
    color: Colors.white,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginHorizontal: 4,
  },
  specialBubble: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '40',
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    minWidth: 170,
  },
  specialText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.primary,
  },
  specialSub: {
    fontSize: FontSize.xs,
    color: Colors.trust,
  },
});
