import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
}

type FeedbackCategory = 'suggestion' | 'bug' | 'question' | 'other';

export function FeedbackModal({ visible, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>('suggestion');
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comments.trim()) {
      Alert.alert('Feedback Empty', 'Please tell us what you think before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const { collection, addDoc } = require('firebase/firestore');
      const { db } = require('../../config/firebase');

      await addDoc(collection(db, 'feedback'), {
        userId: user?.id || 'guest',
        userEmail: user?.email || 'guest@rentify.app',
        userName: user?.name || 'Guest User',
        category,
        rating,
        comments: comments.trim(),
        createdAt: new Date().toISOString()
      });

      Alert.alert(
        'Thank You! 💖',
        'Your feedback has been submitted successfully. We appreciate your input to make Rentify better!'
      );
      setComments('');
      setRating(5);
      setCategory('suggestion');
      onClose();
    } catch (e: any) {
      Alert.alert('Submission Failed', e.message || 'Could not submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Give Feedback 💬</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            We'd love to hear your thoughts, bugs, suggestions, or ideas to make Rentify better.
          </Text>

          {/* Categories */}
          <View style={styles.categoryRow}>
            {(['suggestion', 'bug', 'question', 'other'] as FeedbackCategory[]).map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, category === cat && styles.categoryBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Rating */}
          <Text style={styles.sectionLabel}>Rate your experience:</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <MaterialCommunityIcons 
                  name={star <= rating ? "star" : "star-outline"} 
                  size={32} 
                  color={star <= rating ? Colors.warning : Colors.muted} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Comments */}
          <Text style={styles.sectionLabel}>Tell us more:</Text>
          <TextInput
            style={styles.input}
            multiline
            numberOfLines={4}
            value={comments}
            onChangeText={setComments}
            placeholder="Type your feedback, suggestions, or report bugs here..."
            placeholderTextColor={Colors.placeholder}
          />

          {/* Privacy statement */}
          <View style={styles.privacyGuarantee}>
            <MaterialCommunityIcons name="shield-lock-outline" size={16} color={Colors.muted} />
            <Text style={styles.privacyText}>
              🔒 Rentify Guarantee: We use your feedback solely to improve the app experience and will never share your personal information.
            </Text>
          </View>

          <Button 
            label={submitting ? "Submitting..." : "Submit Feedback"} 
            onPress={handleSubmit} 
            fullWidth 
            style={{ marginTop: Spacing.sm }}
            disabled={submitting}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: Colors.overlay,
    alignItems: 'center', justifyContent: 'center', padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface, borderRadius: Radius['2xl'],
    padding: Spacing.xl, width: '100%', ...Shadow.lg,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
  closeBtn: { padding: 4 },
  description: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18, marginBottom: Spacing.md },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.text, marginBottom: Spacing.xs },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  categoryBtn: {
    backgroundColor: Colors.bg, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  categoryBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  categoryText: { fontSize: FontSize.xs, color: Colors.muted, fontWeight: FontWeight.semibold },
  categoryTextActive: { color: Colors.white },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  starBtn: { padding: 4 },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.lg,
    padding: Spacing.md, fontSize: FontSize.sm, color: Colors.text,
    backgroundColor: Colors.bg, height: 100, textAlignVertical: 'top',
    marginBottom: Spacing.md,
  },
  privacyGuarantee: { flexDirection: 'row', gap: Spacing.xs, alignItems: 'center', marginBottom: Spacing.md },
  privacyText: { fontSize: 10, color: Colors.muted, flex: 1, lineHeight: 14 },
});
