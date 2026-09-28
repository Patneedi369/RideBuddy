import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, borderRadius, spacing } from '../../theme';
import { TravelPreference } from '../../types';

// Preset locations for quick selection in India
const INDIAN_CITIES = [
  { name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  { name: 'Samalkota', lat: 17.0500, lng: 82.1667 },
  { name: 'Rajahmundry', lat: 17.0005, lng: 81.8040 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
];

export const FindRideScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [originIndex, setOriginIndex] = useState(0); // Kakinada
  const [destIndex, setDestIndex] = useState(2); // Rajahmundry
  const [travelPref, setTravelPref] = useState<TravelPreference>(user?.gender === 'female' ? 'women_only' : 'anyone');

  const origin = INDIAN_CITIES[originIndex];
  const destination = INDIAN_CITIES[destIndex];

  const handleSearch = () => {
    navigation.navigate('SearchResults', {
      originName: origin.name,
      originLat: origin.lat,
      originLng: origin.lng,
      destinationName: destination.name,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
      travelPreference: travelPref,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Find a ride</Text>

        <Text style={styles.label}>FROM</Text>
        <TouchableOpacity
          style={styles.inputBox}
          onPress={() => setOriginIndex((prev) => (prev + 1) % INDIAN_CITIES.length)}
        >
          <Text style={styles.inputText}>📍 {origin.name}</Text>
          <Text style={styles.iconText}>⌖</Text>
        </TouchableOpacity>

        <Text style={styles.label}>TO</Text>
        <TouchableOpacity
          style={styles.inputBox}
          onPress={() => setDestIndex((prev) => (prev + 1) % INDIAN_CITIES.length)}
        >
          <Text style={styles.inputText}>📍 {destination.name}</Text>
          <Text style={styles.iconText}>⌖</Text>
        </TouchableOpacity>

        <Text style={styles.label}>WHEN</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>Today · 8:00 – 9:00 AM</Text>
          <Text style={styles.iconText}>⌄</Text>
        </View>

        <Text style={styles.label}>TRAVEL WITH</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBox, travelPref === 'women_only' && styles.choiceSelected]}
            onPress={() => {
              if (user?.gender !== 'female') {
                alert('Women-only search preference is reserved for female passengers.');
                return;
              }
              setTravelPref('women_only');
            }}
          >
            <Text style={[styles.choiceText, travelPref === 'women_only' && styles.choiceTextSelected]}>
              Women only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, travelPref === 'anyone' && styles.choiceSelected]}
            onPress={() => setTravelPref('anyone')}
          >
            <Text style={[styles.choiceText, travelPref === 'anyone' && styles.choiceTextSelected]}>
              Anyone
            </Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Find matching rides"
          onPress={handleSearch}
          style={{ marginTop: spacing.xl }}
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
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#656a72',
    marginTop: 15,
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
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  iconText: {
    fontSize: 16,
    color: colors.muted,
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
});
