import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  prefix,
  suffix,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}
      <View style={[styles.inputBox, error ? styles.inputError : null]}>
        {prefix && <Text style={styles.affix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.muted}
          {...props}
        />
        {suffix && <Text style={styles.affix}>{suffix}</Text>}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#656a72',
    marginBottom: 7,
  },
  inputBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    paddingHorizontal: 14,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputError: {
    borderColor: colors.danger,
  },
  affix: {
    fontSize: 13,
    color: colors.ink,
    marginRight: 6,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },
});
