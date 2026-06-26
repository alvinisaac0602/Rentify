import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { FontWeight } from '../../constants/theme';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
  style?: StyleProp<any>;
}

const AVATAR_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#0891B2', // Cyan
];

function getInitials(name: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
}

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export function Avatar({ name, uri, size = 50, style }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  // Check if we have a valid custom uploaded image (not a placeholder image)
  const hasCustomImage = uri && uri.startsWith('http') && !uri.includes('pravatar.cc');

  if (hasCustomImage && !imageError) {
    return (
      <Image
        source={{ uri }}
        onError={() => setImageError(true)}
        style={[
          styles.avatarImage,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarFallback,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.avatarText,
          {
            fontSize: size * 0.42,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold as any,
    textAlign: 'center',
  },
});
