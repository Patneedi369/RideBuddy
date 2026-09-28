import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/api';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, borderRadius, spacing } from '../../theme';
import { Ride, RideRequest } from '../../types';

export const RideDetailsScreen = ({ route, navigation }: any) => {
  const { rideId } = route.params || {};
  const { user } = useAuth();

  const [ride, setRide] = useState<Ride | null>(null);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadRideDetails = async () => {
    try {
      setLoading(true);
      const r = await fetchWithAuth(`/rides/${rideId}`);
      setRide(r);
      if (r.driver_id === user?.id) {
        const reqs = await fetchWithAuth(`/rides/${rideId}/requests`);
        setRequests(reqs);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rideId) loadRideDetails();
  }, [rideId]);

  const handleStartRide = async () => {
    setActionLoading(true);
    try {
      const updated = await fetchWithAuth(`/rides/${rideId}/start`, { method: 'POST' });
      setRide(updated);
      Alert.alert('Ride Started!', 'Your passenger(s) will be notified.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteRide = async () => {
    setActionLoading(true);
    try {
      const updated = await fetchWithAuth(`/rides/${rideId}/complete`, { method: 'POST' });
      setRide(updated);
      Alert.alert('Ride Completed!', 'Thank you for sharing your ride.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async (reqId: number) => {
    try {
      await fetchWithAuth(`/requests/${reqId}/accept`, { method: 'POST' });
      Alert.alert('Request Accepted');
      loadRideDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleRejectRequest = async (reqId: number) => {
    try {
      await fetchWithAuth(`/requests/${reqId}/reject`, { method: 'POST' });
      Alert.alert('Request Rejected');
      loadRideDetails();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading || !ride) {
    return (
      <SafeAreaView style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.ink} />
        </View>
      </SafeAreaView>
    );
  }

  const isDriver = ride.driver_id === user?.id;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headRow}>
          <Text style={styles.title}>Ride Details</Text>
          <Badge
            label={ride.status}
            variant={ride.status === 'IN_PROGRESS' ? 'yellow' : ride.status === 'COMPLETED' ? 'green' : 'default'}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeadText}>ROUTE</Text>
          <View style={styles.routeRow}>
            <View style={styles.dotsCol}>
              <View style={styles.dotStart} />
              <View style={styles.dashLine} />
              <View style={styles.dotEnd} />
            </View>
            <View style={{ flex: 1, paddingLeft: 8 }}>
              <Text style={styles.placeTitle}>{ride.origin_name}</Text>
              <Text style={styles.subText}>Pickup point</Text>
              <View style={{ height: 16 }} />
              <Text style={styles.placeTitle}>{ride.destination_name}</Text>
              <Text style={styles.subText}>Destination</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeadText}>INFO</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Driver</Text>
            <Text style={styles.infoVal}>{ride.driver?.name || 'Driver'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vehicle</Text>
            <Text style={styles.infoVal}>{ride.vehicle?.model || 'Car'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Available Seats</Text>
            <Text style={styles.infoVal}>{ride.available_seats} / {ride.total_seats}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Travel Preference</Text>
            <Text style={styles.infoVal}>{ride.travel_preference === 'women_only' ? 'Women Only' : 'Anyone'}</Text>
          </View>
        </View>

        {isDriver && requests.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeadText}>PASSENGER REQUESTS</Text>
            {requests.map((req) => (
              <View key={req.id} style={styles.reqItem}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.ink }}>{req.passenger?.name || 'Passenger'}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted }}>{req.pickup_name} → {req.drop_name}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.green, marginTop: 2 }}>
                    ₹{req.estimated_petrol_share} est. petrol share
                  </Text>
                </View>
                {req.status === 'PENDING' ? (
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAcceptRequest(req.id)}>
                      <Text style={styles.btnTextLight}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectRequest(req.id)}>
                      <Text style={styles.btnTextDark}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Badge label={req.status} variant={req.status === 'ACCEPTED' ? 'green' : 'default'} />
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.md }}>
          <Button
            title="Open Ride Chat 💬"
            variant="outline"
            onPress={() => navigation.navigate('RideChat', { rideId: ride.id })}
          />

          {isDriver && ride.status === 'PUBLISHED' && (
            <Button
              title="Start Ride 🚀"
              onPress={handleStartRide}
              loading={actionLoading}
              style={{ marginTop: spacing.xs }}
            />
          )}

          {isDriver && ride.status === 'IN_PROGRESS' && (
            <Button
              title="Complete Ride Checkmark"
              onPress={handleCompleteRide}
              loading={actionLoading}
              style={{ marginTop: spacing.xs }}
            />
          )}
        </View>
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
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm + 4,
  },
  cardHeadText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#656a72',
    marginBottom: 10,
  },
  routeRow: {
    flexDirection: 'row',
  },
  dotsCol: {
    width: 20,
    alignItems: 'center',
    paddingTop: 4,
  },
  dotStart: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.ink,
  },
  dashLine: {
    height: 28,
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#b9bdc3',
    marginVertical: 3,
  },
  dotEnd: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ink,
    backgroundColor: colors.white,
  },
  placeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  subText: {
    fontSize: 11,
    color: colors.muted,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.soft,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.muted,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  reqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.soft,
  },
  acceptBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  rejectBtn: {
    backgroundColor: colors.soft,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
  btnTextLight: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  btnTextDark: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '700',
  },
});
