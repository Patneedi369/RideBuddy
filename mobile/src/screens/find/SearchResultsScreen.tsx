import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { fetchWithAuth } from '../../services/api';
import { RouteCard } from '../../components/RouteCard';
import { colors, borderRadius, spacing } from '../../theme';
import { RideSearchResult } from '../../types';

export const SearchResultsScreen = ({ route, navigation }: any) => {
  const params = route.params || {};
  const [results, setResults] = useState<RideSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<number | null>(null);

  const performSearch = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        origin_lat: String(params.originLat || 16.9891),
        origin_lng: String(params.originLng || 82.2475),
        destination_lat: String(params.destinationLat || 17.0005),
        destination_lng: String(params.destinationLng || 81.8040),
        pickup_name: params.originName || 'Pickup point',
        drop_name: params.destinationName || 'Drop point',
        travel_preference: params.travelPreference || 'anyone',
      });

      if (params.travelDate) {
        queryParams.append('travel_date', params.travelDate);
      }
      if (params.travelTime) {
        queryParams.append('travel_time', params.travelTime.includes('PM') ? '17:00' : '08:00');
      }

      const res = await fetchWithAuth(`/rides/search?${queryParams.toString()}`);
      setResults(res || []);
    } catch (e: any) {
      console.log('Search error:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, []);

  const handleRequestSeat = async (item: RideSearchResult) => {
    setRequestingId(item.ride.id);
    try {
      await fetchWithAuth(`/rides/${item.ride.id}/requests`, {
        method: 'POST',
        body: JSON.stringify({
          pickup_name: item.pickup_name,
          pickup_lat: params.originLat || 16.9891,
          pickup_lng: params.originLng || 82.2475,
          drop_name: item.drop_name,
          drop_lat: params.destinationLat || 17.0005,
          drop_lng: params.destinationLng || 81.8040,
          seats_requested: 1,
        }),
      });

      Alert.alert(
        'Seat Requested!',
        `Your request to join ${item.ride.driver?.name || 'the driver'}'s ride has been submitted. You will be notified when accepted.`,
        [{ text: 'View My Rides', onPress: () => navigation.navigate('MyRides') }]
      );
    } catch (err: any) {
      Alert.alert('Request Failed', err.message || 'Unable to request seat.');
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Change search</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.resultsHead}>
          <Text style={styles.headCount}>{results.length} ride{results.length === 1 ? '' : 's'} found</Text>
          <Text style={styles.headSub}>Best route match</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.ink} />
            <Text style={styles.loadingText}>Finding matching rides...</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No matching rides</Text>
            <Text style={styles.emptySub}>
              We couldn't find a published ride for this route and time window.{'\n\n'}
              You can try searching another date, time, or nearby location.
            </Text>
          </View>
        ) : (
          results.map((item) => (
            <RouteCard
              key={item.ride.id}
              origin={item.pickup_name}
              destination={item.drop_name}
              departureTime={new Date(item.ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              driverName={item.ride.driver?.name || 'Driver'}
              driverRating={4.8}
              driverRidesCount={23}
              matchScore={item.route_match_score}
              availableSeats={item.ride.available_seats}
              vehicleModel={item.ride.vehicle?.model || 'Car'}
              isWomenOnly={item.ride.travel_preference === 'women_only'}
              petrolShare={item.estimated_petrol_share}
              onRequestPress={() => handleRequestSeat(item)}
              onPress={() => navigation.navigate('RideDetails', { rideId: item.ride.id })}
            />
          ))
        )}

        <View style={styles.noticeCard}>
          <Text style={styles.noticeText}>
            Petrol share is an estimate based on distance, mileage and fuel price. Ride Buddy does not process payment in V1.
          </Text>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  resultsHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.sm + 4,
  },
  headCount: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  headSub: {
    fontSize: 11,
    color: colors.muted,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: colors.muted,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  noticeCard: {
    backgroundColor: colors.greenbg,
    borderRadius: borderRadius.md,
    padding: 12,
    marginTop: spacing.md,
  },
  noticeText: {
    color: '#176b4b',
    fontSize: 11,
    lineHeight: 16,
  },
});
