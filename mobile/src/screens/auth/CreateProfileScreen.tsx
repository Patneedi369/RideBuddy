import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, borderRadius, spacing } from '../../theme';
import { Gender } from '../../types';

export const CreateProfileScreen = ({ navigation }: any) => {
  const { createProfile } = useAuth();
  const [name, setName] = useState('Satya');
  const [gender, setGender] = useState<Gender>('female');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await createProfile(name.trim(), gender);
      // Navigation will update automatically to authenticated tabs
    } catch (err: any) {
      setError(err.message || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create your profile</Text>

        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : 'S'}</Text>
        </View>

        <Input
          label="YOUR NAME"
          value={name}
          onChangeText={(txt) => {
            setName(txt);
            setError('');
          }}
          placeholder="e.g. Satya"
          error={error}
        />

        <Text style={styles.label}>GENDER</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBox, gender === 'female' && styles.choiceSelected]}
            onPress={() => setGender('female')}
          >
            <Text style={[styles.choiceText, gender === 'female' && styles.choiceTextSelected]}>Female</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, gender === 'male' && styles.choiceSelected]}
            onPress={() => setGender('male')}
          >
            <Text style={[styles.choiceText, gender === 'male' && styles.choiceTextSelected]}>Male</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, gender === 'other' && styles.choiceSelected]}
            onPress={() => setGender('other')}
          >
            <Text style={[styles.choiceText, gender === 'other' && styles.choiceTextSelected]}>Other</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          PROFILE PHOTO <Text style={{ fontWeight: '400', color: '#999' }}>(optional)</Text>
        </Text>
        <View style={styles.photoBox}>
          <Text style={{ fontSize: 13, color: colors.ink }}>Add a photo</Text>
          <Text style={{ fontSize: 16, fontWeight: '700' }}>＋</Text>
        </View>

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Your phone number is verified. You can update your profile later from Settings.
          </Text>
        </View>

        <Button
          title="Create profile"
          onPress={handleCreate}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#e5e7ea',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.ink,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#656a72',
    marginTop: 15,
    marginBottom: 7,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceBox: {
    flex: 1,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md - 1,
    alignItems: 'center',
  },
  choiceSelected: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: '#f0f1f3',
  },
  choiceText: {
    fontSize: 12,
    color: colors.ink,
  },
  choiceTextSelected: {
    fontWeight: '700',
  },
  photoBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeBox: {
    backgroundColor: colors.greenbg,
    borderRadius: borderRadius.md - 1,
    padding: 12,
    marginTop: 17,
  },
  noticeText: {
    color: '#176b4b',
    fontSize: 11,
    lineHeight: 16,
  },
});
