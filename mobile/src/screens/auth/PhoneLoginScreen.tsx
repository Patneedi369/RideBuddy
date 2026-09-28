import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, borderRadius, spacing } from '../../theme';

export const PhoneLoginScreen = ({ navigation }: any) => {
  const { sendOtp } = useAuth();
  const [phone, setPhone] = useState('9876543210');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp(`+91${phone.trim()}`);
      navigation.navigate('OtpVerify', { phone: `+91${phone.trim()}` });
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerSpacer} />
          
          <View style={styles.centerContainer}>
            <View style={styles.logoBadge}>
              <Text style={{ fontSize: 36 }}>🚗</Text>
            </View>
            
            <Text style={styles.title}>Welcome to Ride Buddy</Text>
            <Text style={styles.subtitle}>
              Enter your phone number to sign up or log in.{'\n'}We'll send you a one-time password.
            </Text>

            <View style={styles.formContainer}>
              <Input
                label="PHONE NUMBER"
                value={phone}
                onChangeText={(txt) => {
                  setPhone(txt);
                  setError('');
                }}
                prefix="🇮🇳 +91"
                keyboardType="phone-pad"
                maxLength={10}
                error={error}
              />

              <Button
                title="Send OTP"
                onPress={handleSendOtp}
                loading={loading}
                style={{ marginTop: spacing.md }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerSpacer: {
    height: 40,
  },
  centerContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoBadge: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: spacing.xs + 2,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  formContainer: {
    width: '100%',
    marginTop: spacing.md,
  },
});
