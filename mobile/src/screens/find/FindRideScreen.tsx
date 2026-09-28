import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';
import { LocationItem } from '../../services/location';
import { colors, borderRadius, spacing } from '../../theme';
import { TravelPreference } from '../../types';

export const FindRideScreen = ({ navigation }: any) => {
  const { user } = useAuth();

  const [fromLoc, setFromLoc] = useState<LocationItem>({
    id: 'kakinada',
    name: 'Kakinada',
    description: 'Andhra Pradesh, India',
    lat: 16.9891,
    lng: 82.2475,
  });

  const [toLoc, setToLoc] = useState<LocationItem>({
    id: 'rajahmundry',
    name: 'Rajahmundry',
    description: 'East Godavari, Andhra Pradesh',
    lat: 17.0005,
    lng: 81.8040,
  });

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('8:00 AM');
  const [travelPref, setTravelPref] = useState<TravelPreference>(user?.gender === 'female' ? 'women_only' : 'anyone');

  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = () => {
    setErrorMsg('');

    if (!fromLoc || !fromLoc.lat || !fromLoc.lng) {
      setErrorMsg('Please select a valid pickup location.');
      return;
    }

    if (!toLoc || !toLoc.lat || !toLoc.lng) {
      setErrorMsg('Please select a valid destination location.');
      return;
    }

    // Validation: From and To cannot be the exact same location
    const dist = Math.hypot(fromLoc.lat - toLoc.lat, fromLoc.lng - toLoc.lng);
    if (dist < 0.001 || fromLoc.name.toLowerCase() === toLoc.name.toLowerCase()) {
      setErrorMsg('Pickup and destination cannot be the exact same location.');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];

    navigation.navigate('SearchResults', {
      originName: fromLoc.name,
      originLat: fromLoc.lat,
      originLng: fromLoc.lng,
      destinationName: toLoc.name,
      destinationLat: toLoc.lat,
      destinationLng: toLoc.lng,
      travelDate: dateStr,
      travelTime: selectedTimeStr,
      travelPreference: travelPref,
    });
  };

  const getFormattedDateTimeText = () => {
    const today = new Date().toDateString();
    const tom = new Date();
    tom.setDate(tom.getDate() + 1);
    const tomString = tom.toDateString();

    let dateLabel = 'Today';
    if (selectedDate.toDateString() === tomString) {
      dateLabel = 'Tomorrow';
    } else if (selectedDate.toDateString() !== today) {
      dateLabel = selectedDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return `${dateLabel} · Around ${selectedTimeStr}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Find a ride</Text>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>FROM</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowFromModal(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputText}>📍 {fromLoc.name}</Text>
            <Text style={styles.inputSub} numberOfLines={1}>{fromLoc.description}</Text>
          </View>
          <Text style={styles.iconText}>⌖</Text>
        </TouchableOpacity>

        <Text style={styles.label}>TO</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowToModal(true)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputText}>📍 {toLoc.name}</Text>
            <Text style={styles.inputSub} numberOfLines={1}>{toLoc.description}</Text>
          </View>
          <Text style={styles.iconText}>⌖</Text>
        </TouchableOpacity>

        <Text style={styles.label}>WHEN</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowDateTimeModal(true)}>
          <Text style={styles.inputText}>📅 {getFormattedDateTimeText()}</Text>
          <Text style={styles.iconText}>⌄</Text>
        </TouchableOpacity>

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

      <LocationPickerModal
        visible={showFromModal}
        title="Select Pickup Location"
        onClose={() => setShowFromModal(false)}
        onSelectLocation={(loc) => {
          setFromLoc(loc);
          setErrorMsg('');
        }}
      />

      <LocationPickerModal
        visible={showToModal}
        title="Select Destination"
        onClose={() => setShowToModal(false)}
        onSelectLocation={(loc) => {
          setToLoc(loc);
          setErrorMsg('');
        }}
      />

      <DateTimePickerModal
        visible={showDateTimeModal}
        selectedDate={selectedDate}
        selectedTimeStr={selectedTimeStr}
        onClose={() => setShowDateTimeModal(false)}
        onSelectDateTime={(d, t) => {
          setSelectedDate(d);
          setSelectedTimeStr(t);
        }}
      />
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
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.dangerbg,
    borderRadius: borderRadius.md,
    padding: 12,
    marginBottom: spacing.xs,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
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
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 13,
    color: colors.ink,
    fontWeight: '600',
  },
  inputSub: {
    fontSize: 10,
    color: colors.muted,
    marginTop: 1,
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
