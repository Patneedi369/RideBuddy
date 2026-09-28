import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#cbd0d6';
    switch (variant) {
      case 'primary': return colors.ink;
      case 'secondary': return colors.soft;
      case 'outline': return colors.card;
      case 'danger': return colors.danger;
      default: return colors.ink;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#8c9199';
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.ink;
      case 'outline': return colors.ink;
      case 'danger': return colors.white;
      default: return colors.white;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outlineBorder,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xs,
  },
  outlineBorder: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  text: {
    fontFamily: 'System',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
