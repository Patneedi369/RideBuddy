import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { fetchWithAuth } from '../../services/api';
import { RouteCard } from '../../components/RouteCard';
import { colors, borderRadius, spacing } from '../../theme';
import { Ride } from '../../types';

export const MyRidesScreen = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');
  const [upcomingRides, setUpcomingRides] = useState<Ride[]>([]);
  const [historyRides, setHistoryRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRides = async () => {
    setLoading(true);
    try {
      if (activeTab === 'upcoming') {
        const rides = await fetchWithAuth('/rides/my/upcoming');
        setUpcomingRides(rides);
      } else {
        const rides = await fetchWithAuth('/rides/my/history');
        setHistoryRides(rides);
      }
    } catch (e) {
      console.log('Error loading my rides:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My rides</Text>
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>Upcoming</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchRides} />}
      >
        {activeTab === 'upcoming' ? (
          upcomingRides.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming rides</Text>
            </View>
          ) : (
            upcomingRides.map((ride) => (
              <RouteCard
                key={ride.id}
                origin={ride.origin_name}
                destination={ride.destination_name}
                departureTime={new Date(ride.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                availableSeats={ride.available_seats}
                vehicleModel={ride.vehicle?.model}
                isWomenOnly={ride.travel_preference === 'women_only'}
                statusText={ride.status === 'IN_PROGRESS' ? 'In Progress' : 'Confirmed'}
                statusVariant={ride.status === 'IN_PROGRESS' ? 'yellow' : 'green'}
                onPress={() => navigation.navigate('RideDetails', { rideId: ride.id })}
              />
            ))
          )
        ) : historyRides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No past ride history</Text>
          </View>
        ) : (
          historyRides.map((ride) => (
            <RouteCard
              key={ride.id}
              origin={ride.origin_name}
              destination={ride.destination_name}
              departureTime={new Date(ride.departure_time).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              statusText={ride.status === 'COMPLETED' ? 'Completed' : 'Cancelled'}
              statusVariant={ride.status === 'COMPLETED' ? 'green' : 'default'}
              onPress={() => navigation.navigate('RideDetails', { rideId: ride.id })}
            />
          ))
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#eceef1',
    borderRadius: borderRadius.sm,
    padding: 3,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.tabInactive,
  },
  tabTextActive: {
    color: colors.ink,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 94,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: colors.muted,
  },
});
