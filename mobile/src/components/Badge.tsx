import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../theme';

interface BadgeProps {
  label: string;
  variant?: 'default' | 'green' | 'yellow' | 'match';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', style }) => {
  const getColors = () => {
    switch (variant) {
      case 'green':
        return { bg: colors.greenbg, text: colors.green };
      case 'yellow':
        return { bg: colors.yellow, text: colors.yellowink };
      case 'match':
        return { bg: '#e8f0fe', text: '#1967d2' };
      default:
        return { bg: colors.soft, text: '#5d626a' };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10.5,
    fontWeight: '700',
  },
});
