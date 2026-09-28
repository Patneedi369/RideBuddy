import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/api';
import { Button } from '../../components/Button';
import { colors, borderRadius, spacing } from '../../theme';
import { TravelPreference, Vehicle } from '../../types';

const INDIAN_CITIES = [
  { name: 'Kakinada', lat: 16.9891, lng: 82.2475 },
  { name: 'Samalkota', lat: 17.0500, lng: 82.1667 },
  { name: 'Rajahmundry', lat: 17.0005, lng: 81.8040 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185 },
  { name: 'Vijayawada', lat: 16.5062, lng: 80.6480 },
];

export const OfferRideScreen = ({ navigation }: any) => {
  const { user, vehicles, fetchVehicles } = useAuth();
  const [originIndex, setOriginIndex] = useState(0);
  const [destIndex, setDestIndex] = useState(2);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [seats, setSeats] = useState<number>(2);
  const [whoCanJoin, setWhoCanJoin] = useState<TravelPreference>(user?.gender === 'female' ? 'women_only' : 'anyone');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVehicles().then((vList) => {
      if (vList.length > 0) {
        setSelectedVehicle(vList[0]);
        setSeats(Math.min(vList[0].capacity, 2));
      }
    });
  }, []);

  const handleCreateRide = async () => {
    if (!selectedVehicle) {
      Alert.alert('Vehicle Required', 'Please add a vehicle before offering a ride.', [
        { text: 'Add Vehicle', onPress: () => navigation.navigate('AddVehicle') },
      ]);
      return;
    }

    if (whoCanJoin === 'women_only' && user?.gender !== 'female') {
      Alert.alert('Gender Restriction', 'Only female drivers can offer Women-only rides.');
      return;
    }

    const origin = INDIAN_CITIES[originIndex];
    const dest = INDIAN_CITIES[destIndex];

    setLoading(true);
    try {
      const departureTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await fetchWithAuth('/rides', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: selectedVehicle.id,
          origin_name: origin.name,
          origin_lat: origin.lat,
          origin_lng: origin.lng,
          destination_name: dest.name,
          destination_lat: dest.lat,
          destination_lng: dest.lng,
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
      Alert.alert('Failed to Create Ride', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const origin = INDIAN_CITIES[originIndex];
  const dest = INDIAN_CITIES[destIndex];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Offer a ride</Text>

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
          <Text style={styles.inputText}>📍 {dest.name}</Text>
          <Text style={styles.iconText}>⌖</Text>
        </TouchableOpacity>

        <Text style={styles.label}>DATE & TIME</Text>
        <View style={styles.inputBox}>
          <Text style={styles.inputText}>Tomorrow · 8:10 AM</Text>
          <Text style={styles.iconText}>⌄</Text>
        </View>

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
