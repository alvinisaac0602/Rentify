import React from 'react';
import {
  TouchableOpacity, View, Text, Image, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, CategoryMeta, CategoryType } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Shadow, Spacing } from '../../constants/theme';

interface CategoryCardProps {
  category: CategoryType;
  onPress?: () => void;
}

const CATEGORY_IMAGES: Record<CategoryType, string> = {
  apartment: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
  hostel: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80',
  shop: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  airbnb: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
};

export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const router = useRouter();
  const meta = CategoryMeta[category];
  const image = CATEGORY_IMAGES[category];

  const handlePress = () => {
    if (onPress) { onPress(); return; }
    router.push(`/explore?category=${category}` as any);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={handlePress}
      style={styles.card}
    >
      <Image source={{ uri: image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(10,10,20,0.85)']}
        style={styles.gradient}
      />

      <View style={styles.content}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
        <Text style={styles.title} numberOfLines={1}>{meta.label}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{meta.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 158,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Shadow.card,
  },
  image: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  content: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  emoji: {
    fontSize: 22,
    marginBottom: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
});
