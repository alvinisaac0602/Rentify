import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { FontSize, FontWeight, Radius, Spacing, Shadow } from '../../constants/theme';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  disabled, loading, fullWidth, style, textStyle, leftIcon, rightIcon,
}: ButtonProps) {
  const variantStyle = styles[variant];
  const textVariantStyle = textStyles[variant];
  const sizeStyle = sizeStyles[size];
  const textSizeStyle = textSizeStyles[size];

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base, variantStyle, sizeStyle,
        fullWidth && { width: '100%' },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {leftIcon && !loading && leftIcon}
      {loading
        ? <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? Colors.primary : Colors.white} />
        : <Text style={[textStyles.base, textVariantStyle, textSizeStyle, textStyle]}>{label}</Text>
      }
      {rightIcon && !loading && rightIcon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    ...Shadow.sm,
  },
  primary: { backgroundColor: Colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.primaryLight, shadowOpacity: 0 },
  danger: { backgroundColor: Colors.danger },
  success: { backgroundColor: Colors.success },
  disabled: { opacity: 0.5 },
});

const textStyles = StyleSheet.create({
  base: { fontWeight: FontWeight.semibold },
  primary: { color: Colors.white },
  outline: { color: Colors.primary },
  ghost: { color: Colors.primary },
  danger: { color: Colors.white },
  success: { color: Colors.white },
});

const sizeStyles = StyleSheet.create({
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: 13 },
  lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.base },
});

const textSizeStyles = StyleSheet.create({
  sm: { fontSize: FontSize.sm },
  md: { fontSize: FontSize.base },
  lg: { fontSize: FontSize.md },
});
