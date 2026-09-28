import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/api';
import { Button } from '../../components/Button';
import { LocationPickerModal } from '../../components/LocationPickerModal';
import { DateTimePickerModal } from '../../components/DateTimePickerModal';
import { LocationItem } from '../../services/location';
import { colors, borderRadius, spacing } from '../../theme';
import { TravelPreference, Vehicle } from '../../types';

export const OfferRideScreen = ({ navigation }: any) => {
  const { user, vehicles, fetchVehicles } = useAuth();

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

  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [selectedTimeStr, setSelectedTimeStr] = useState<string>('8:00 AM');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [seats, setSeats] = useState<number>(2);
  const [whoCanJoin, setWhoCanJoin] = useState<TravelPreference>(user?.gender === 'female' ? 'women_only' : 'anyone');

  const [showFromModal, setShowFromModal] = useState(false);
  const [showToModal, setShowToModal] = useState(false);
  const [showDateTimeModal, setShowDateTimeModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchVehicles().then((vList) => {
      if (vList.length > 0) {
        setSelectedVehicle(vList[0]);
        setSeats(Math.min(vList[0].capacity, 2));
      }
    });
  }, []);

  const handleCreateRide = async () => {
    setErrorMsg('');

    if (!selectedVehicle) {
      Alert.alert('Vehicle Required', 'Please add a vehicle before offering a ride.', [
        { text: 'Add Vehicle', onPress: () => navigation.navigate('AddVehicle') },
      ]);
      return;
    }

    if (!fromLoc || !fromLoc.lat || !fromLoc.lng) {
      setErrorMsg('Please select a starting point.');
      return;
    }

    if (!toLoc || !toLoc.lat || !toLoc.lng) {
      setErrorMsg('Please select a destination.');
      return;
    }

    const dist = Math.hypot(fromLoc.lat - toLoc.lat, fromLoc.lng - toLoc.lng);
    if (dist < 0.001 || fromLoc.name.toLowerCase() === toLoc.name.toLowerCase()) {
      setErrorMsg('Starting point and destination cannot be the exact same location.');
      return;
    }

    if (whoCanJoin === 'women_only' && user?.gender !== 'female') {
      setErrorMsg('Only female drivers can offer Women-only rides.');
      return;
    }

    setLoading(true);
    try {
      const dateIso = selectedDate.toISOString().split('T')[0];
      const departureTime = `${dateIso}T08:00:00Z`;

      await fetchWithAuth('/rides', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          origin_name: fromLoc.name,
          origin_lat: fromLoc.lat,
          origin_lng: fromLoc.lng,
          destination_name: toLoc.name,
          destination_lat: toLoc.lat,
          destination_lng: toLoc.lng,
          departure_time: departureTime,
          travel_preference: whoCanJoin,
          total_seats: seats,
          waypoints: [
            { name: 'Samalkota', lat: 17.0500, lng: 82.1667, order: 1 }
          ]
        }),
      });

      Alert.alert('Ride Published!', 'Your ride has been successfully created.', [
        { text: 'View My Rides', onPress: () => navigation.navigate('MyRides') },
      ]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
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

    return `${dateLabel} · ${selectedTimeStr}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Offer a ride</Text>

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

        <Text style={styles.label}>DATE & TIME</Text>
        <TouchableOpacity style={styles.inputBox} onPress={() => setShowDateTimeModal(true)}>
          <Text style={styles.inputText}>📅 {getFormattedDateTimeText()}</Text>
          <Text style={styles.iconText}>⌄</Text>
        </TouchableOpacity>

        <Text style={styles.label}>VEHICLE</Text>
        {vehicles.length === 0 ? (
          <TouchableOpacity style={styles.addVehicleBox} onPress={() => navigation.navigate('AddVehicle')}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>＋ Add your vehicle</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.inputBox}
            onPress={() => {
              const nextIndex = (vehicles.indexOf(selectedVehicle!) + 1) % vehicles.length;
              setSelectedVehicle(vehicles[nextIndex]);
            }}
          >
            <Text style={styles.inputText}>
              {selectedVehicle?.vehicle_type === 'car' ? '🚗' : '🏍️'} {selectedVehicle?.model} ({selectedVehicle?.capacity} seats)
            </Text>
            <Text style={styles.iconText}>⌄</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>WHO CAN JOIN?</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBox, whoCanJoin === 'women_only' && styles.choiceSelected]}
            onPress={() => {
              if (user?.gender !== 'female') {
                alert('Women-only rides can only be created by female drivers.');
                return;
              }
              setWhoCanJoin('women_only');
            }}
          >
            <Text style={[styles.choiceText, whoCanJoin === 'women_only' && styles.choiceTextSelected]}>
              Women only
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, whoCanJoin === 'anyone' && styles.choiceSelected]}
            onPress={() => setWhoCanJoin('anyone')}
          >
            <Text style={[styles.choiceText, whoCanJoin === 'anyone' && styles.choiceTextSelected]}>
              Anyone
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            We'll estimate the petrol share from your route. Pickup and drop-off can be at suitable points along the route.
          </Text>
        </View>

        <Button
          title="Create ride"
          onPress={handleCreateRide}
          loading={loading}
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>

      <LocationPickerModal
        visible={showFromModal}
        title="Select Starting Point"
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
  addVehicleBox: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.ink,
    borderRadius: borderRadius.md,
    padding: 14,
    alignItems: 'center',
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
  noticeCard: {
    backgroundColor: colors.greenbg,
    borderRadius: borderRadius.md,
    padding: 12,
    marginTop: 17,
  },
  noticeText: {
    color: '#176b4b',
    fontSize: 11,
    lineHeight: 16,
  },
});
