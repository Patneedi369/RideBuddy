import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { fetchWithAuth } from '../../services/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, borderRadius, spacing } from '../../theme';

const CATEGORIES = [
  'Unsafe behavior',
  'Harassment',
  'Wrong information',
  'No-show',
  'Other',
];

export const ReportUserScreen = ({ route, navigation }: any) => {
  const userId = route?.params?.userId || 0;
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    setLoading(true);
    try {
      await fetchWithAuth('/reports', {
        method: 'POST',
        body: JSON.stringify({
          reported_user_id: userId || 1,
          category: selectedCategory,
          description,
        }),
      });

      Alert.alert('Report Submitted', 'Thank you for keeping Ride Buddy safe. Our team will review this report.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      await fetchWithAuth(`/users/${userId || 1}/block`, { method: 'POST' });
      Alert.alert('User Blocked', 'You will no longer see rides or messages from this user.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Safety & Report</Text>
        <Text style={styles.subTitle}>Select a category to report a concern about a user or ride.</Text>

        <Text style={styles.label}>CATEGORY</Text>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catBox, selectedCategory === cat && styles.catSelected]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextSelected]}>{cat}</Text>
          </TouchableOpacity>
        ))}

        <Input
          label="ADDITIONAL DETAILS (OPTIONAL)"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened..."
          multiline
          numberOfLines={4}
          style={{ height: 90, textAlignVertical: 'top', paddingTop: 10 }}
        />

        <Button
          title="Submit Report"
          onPress={handleReport}
          loading={loading}
          style={{ marginTop: spacing.md }}
        />

        {userId > 0 && (
          <Button
            title="Block User"
            variant="danger"
            onPress={handleBlock}
            style={{ marginTop: spacing.sm }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  backBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  subTitle: {
    fontSize: 12,
    color: colors.muted,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#656a72',
    marginTop: 10,
    marginBottom: 7,
  },
  catBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 6,
  },
  catSelected: {
    borderColor: colors.ink,
    backgroundColor: '#f0f1f3',
    borderWidth: 1.5,
  },
  catText: {
    fontSize: 13,
    color: colors.ink,
  },
  catTextSelected: {
    fontWeight: '700',
  },
});
