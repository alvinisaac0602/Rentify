import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';
import { Button } from '../ui/Button';
import { Mover, MOCK_MOVERS } from '../../constants/mockData';

interface MovingServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onBook: (mover: Mover) => void;
}

export function MovingServiceModal({ visible, onClose, onBook }: MovingServiceModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.title}>Need Help Moving In? 🚚</Text>
          <Text style={styles.subtitle}>Choose a verified mover near you</Text>
        </View>

        {MOCK_MOVERS.map(mover => (
          <View key={mover.id} style={styles.moverCard}>
            <View style={styles.moverLeft}>
              <View style={styles.moverAvatar}>
                <MaterialCommunityIcons name="truck" size={22} color={Colors.primary} />
              </View>
              <View>
                <View style={styles.moverNameRow}>
                  <Text style={styles.moverName}>{mover.name}</Text>
                  {mover.isVerified && (
                    <MaterialCommunityIcons name="shield-check" size={14} color={Colors.trust} />
                  )}
                </View>
                <Text style={styles.moverPrice}>{mover.priceEstimate}</Text>
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={12} color={Colors.warning} />
                  <Text style={styles.moverRating}>{mover.rating}</Text>
                  <Text style={styles.moverTime}>· {mover.responseTime}</Text>
                </View>
              </View>
            </View>
            <Button label="Book" onPress={() => onBook(mover)} size="sm" />
          </View>
        ))}

        <Button label="No Thanks" onPress={onClose} variant="ghost" fullWidth style={{ marginTop: Spacing.sm }} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: Colors.overlay },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xl, paddingTop: Spacing.md, ...Shadow.lg,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border, alignSelf: 'center', marginBottom: Spacing.lg,
  },
  header: { marginBottom: Spacing.lg },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  subtitle: { fontSize: FontSize.sm, color: Colors.muted, marginTop: 4 },
  moverCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderRadius: Radius.lg,
    backgroundColor: Colors.bg, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  moverLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  moverAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  moverNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  moverName: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.text },
  moverPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium, marginBottom: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  moverRating: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.text },
  moverTime: { fontSize: FontSize.sm, color: Colors.muted },
});
