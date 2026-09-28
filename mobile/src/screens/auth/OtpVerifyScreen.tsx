import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { colors, borderRadius, spacing } from '../../theme';

export const OtpVerifyScreen = ({ route, navigation }: any) => {
  const phone = route?.params?.phone || '+91 98765 43210';
  const { verifyOtp, sendOtp } = useAuth();
  
  const [otp, setOtp] = useState(['4', '8', '2', '1', '6', '9']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(24);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    setError('');

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setTimer(24);
    setCanResend(false);
    setError('');
    try {
      await sendOtp(phone);
    } catch (err: any) {
      setError('Failed to resend OTP.');
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP code.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await verifyOtp(phone, code);
      if (!res.is_profile_complete) {
        navigation.navigate('CreateProfile');
      }
      // If profile is complete, AuthContext triggers main app stack
    } catch (err: any) {
      setError(err.message || 'Invalid OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Change number</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Verify your number</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={{ fontWeight: '700', color: colors.ink }}>{phone}</Text>
        </Text>

        <View style={styles.otpBoxesContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : null,
                error ? styles.otpBoxError : null,
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendBtnText}>Didn't receive it? <Text style={{ fontWeight: '700', color: colors.ink }}>Resend OTP</Text></Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimerText}>
              Didn't receive it? <Text style={{ fontWeight: '700', color: colors.ink }}>Resend in {timer}s</Text>
            </Text>
          )}
        </View>

        <Button
          title="Verify & continue"
          onPress={handleVerify}
          loading={loading}
          style={{ marginTop: spacing.lg }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  content: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  otpBoxesContainer: {
    flexDirection: 'row',
    gap: 9,
    marginVertical: 25,
  },
  otpBox: {
    width: 47,
    height: 53,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: 13,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.ink,
  },
  otpBoxFilled: {
    borderColor: colors.ink,
    backgroundColor: colors.soft,
  },
  otpBoxError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 11,
    color: colors.danger,
    marginBottom: 10,
    textAlign: 'center',
  },
  resendContainer: {
    marginBottom: 15,
  },
  resendTimerText: {
    fontSize: 11,
    color: colors.muted,
  },
  resendBtnText: {
    fontSize: 11,
    color: colors.muted,
  },
});
