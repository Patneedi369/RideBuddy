import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';

interface DateTimePickerModalProps {
  visible: boolean;
  selectedDate: Date;
  selectedTimeStr: string;
  onClose: () => void;
  onSelectDateTime: (date: Date, timeStr: string) => void;
}

const COMMON_TIMES = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '12:00 PM', '5:00 PM', '6:00 PM', '8:00 PM'];

export const DateTimePickerModal: React.FC<DateTimePickerModalProps> = ({
  visible,
  selectedDate,
  selectedTimeStr,
  onClose,
  onSelectDateTime,
}) => {
  const [dateChoice, setDateChoice] = useState<'today' | 'tomorrow' | 'day_after'>('today');
  const [timeChoice, setTimeChoice] = useState<string>(selectedTimeStr || '8:00 AM');

  const getDateObject = () => {
    const d = new Date();
    if (dateChoice === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (dateChoice === 'day_after') {
      d.setDate(d.getDate() + 2);
    }
    return d;
  };

  const handleApply = () => {
    onSelectDateTime(getDateObject(), timeChoice);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Travel Date & Time</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>DATE</Text>
          <View style={styles.choiceRow}>
            <TouchableOpacity
              style={[styles.choiceBox, dateChoice === 'today' && styles.choiceSelected]}
              onPress={() => setDateChoice('today')}
            >
              <Text style={[styles.choiceText, dateChoice === 'today' && styles.choiceTextSelected]}>Today</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBox, dateChoice === 'tomorrow' && styles.choiceSelected]}
              onPress={() => setDateChoice('tomorrow')}
            >
              <Text style={[styles.choiceText, dateChoice === 'tomorrow' && styles.choiceTextSelected]}>Tomorrow</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.choiceBox, dateChoice === 'day_after' && styles.choiceSelected]}
              onPress={() => setDateChoice('day_after')}
            >
              <Text style={[styles.choiceText, dateChoice === 'day_after' && styles.choiceTextSelected]}>Day After</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>APPROXIMATE DEPARTURE TIME</Text>
          <View style={styles.timeGrid}>
            {COMMON_TIMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.timeBox, timeChoice === t && styles.timeSelected]}
                onPress={() => setTimeChoice(t)}
              >
                <Text style={[styles.timeText, timeChoice === t && styles.timeTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.applyBtn} onPress={handleApply}>
            <Text style={styles.applyBtnText}>Set Time & Date</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
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
    borderRadius: borderRadius.md,
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
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  timeBox: {
    width: '23%',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  timeSelected: {
    borderWidth: 1.5,
    borderColor: colors.ink,
    backgroundColor: '#f0f1f3',
  },
  timeText: {
    fontSize: 11,
    color: colors.ink,
  },
  timeTextSelected: {
    fontWeight: '700',
  },
  applyBtn: {
    backgroundColor: colors.ink,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  applyBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
