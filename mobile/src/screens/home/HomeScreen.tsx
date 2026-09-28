import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { fetchWithAuth } from '../../services/api';
import { RouteCard } from '../../components/RouteCard';
import { colors, borderRadius, spacing } from '../../theme';
import { Ride } from '../../types';

export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [upcomingRide, setUpcomingRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUpcoming = async () => {
    try {
      setLoading(true);
      const rides = await fetchWithAuth('/rides/my/upcoming');
      if (rides && rides.length > 0) {
        setUpcomingRide(rides[0]);
      } else {
        setUpcomingRide(null);
      }
    } catch (e) {
      console.log('Failed to fetch upcoming ride:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchUpcoming} />}
      >
        <View style={styles.topHeader}>
          <Text style={styles.brandTitle}>
            ride <Text style={styles.brandSub}>buddy</Text>
          </Text>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.greetingText}>Good morning, {user?.name || 'Satya'}</Text>
        <Text style={styles.mainHeadline}>Where are you{'\n'}heading today?</Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.darkCard]}
            onPress={() => navigation.navigate('Find')}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, styles.darkIcon]}>
              <Text style={{ color: '#fff', fontSize: 20 }}>⌕</Text>
            </View>
            <Text style={styles.actionTitleDark}>Find a ride</Text>
            <Text style={styles.actionSubDark}>Join someone going your way</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.lightCard]}
            onPress={() => navigation.navigate('Offer')}
            activeOpacity={0.85}
          >
            <View style={[styles.iconCircle, styles.lightIcon]}>
              <Text style={{ color: colors.ink, fontSize: 20 }}>＋</Text>
            </View>
            <Text style={styles.actionTitleLight}>Offer a ride</Text>
            <Text style={styles.actionSubLight}>Share your empty seat</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How Ride Buddy works</Text>
          <View style={styles.howGrid}>
            <View style={styles.howCard}>
              <View style={styles.howIcon}><Text style={{ fontSize: 15 }}>⌕</Text></View>
              <Text style={styles.howTitle}>Find</Text>
              <Text style={styles.howSub}>Match your route</Text>
            </View>
            <View style={styles.howCard}>
              <View style={styles.howIcon}><Text style={{ fontSize: 15 }}>✓</Text></View>
              <Text style={styles.howTitle}>Request</Text>
              <Text style={styles.howSub}>Ask for a seat</Text>
            </View>
            <View style={styles.howCard}>
              <View style={styles.howIcon}><Text style={{ fontSize: 15 }}>→</Text></View>
              <Text style={styles.howTitle}>Ride</Text>
              <Text style={styles.howSub}>Travel together</Text>
            </View>
            <View style={styles.howCard}>
              <View style={styles.howIcon}><Text style={{ fontSize: 15 }}>₹</Text></View>
              <Text style={styles.howTitle}>Share</Text>
              <Text style={styles.howSub}>Split petrol</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming ride</Text>
          {upcomingRide ? (
            <RouteCard
              origin={upcomingRide.origin_name}
              destination={upcomingRide.destination_name}
              departureTime={new Date(upcomingRide.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              availableSeats={upcomingRide.available_seats}
              vehicleModel={upcomingRide.vehicle?.model}
              isWomenOnly={upcomingRide.travel_preference === 'women_only'}
              statusText={upcomingRide.status === 'IN_PROGRESS' ? 'In Progress' : 'Confirmed'}
              statusVariant="green"
              onPress={() => navigation.navigate('RideDetails', { rideId: upcomingRide.id })}
            />
          ) : (
            <View style={styles.emptyUpcomingCard}>
              <Text style={styles.emptyTitle}>No upcoming rides</Text>
              <Text style={styles.emptySub}>Find a ride or offer a ride to get started.</Text>
            </View>
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 94,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.xs,
  },
  brandTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  brandSub: {
    fontWeight: '500',
  },
  avatarCircle: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: '#e3e5e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '800',
    fontSize: 16,
    color: colors.ink,
  },
  greetingText: {
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
    marginTop: spacing.xs,
  },
  mainHeadline: {
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 32,
    letterSpacing: -1.25,
    color: colors.ink,
    marginBottom: 22,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 21,
    padding: 19,
    minHeight: 148,
  },
  darkCard: {
    backgroundColor: colors.ink,
  },
  lightCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  iconCircle: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 17,
  },
  darkIcon: {
    backgroundColor: '#2b2e33',
  },
  lightIcon: {
    backgroundColor: '#f0f2f4',
  },
  actionTitleDark: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  actionSubDark: {
    color: colors.white,
    opacity: 0.62,
    fontSize: 11,
    lineHeight: 15,
  },
  actionTitleLight: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 4,
  },
  actionSubLight: {
    color: colors.ink,
    opacity: 0.62,
    fontSize: 11,
    lineHeight: 15,
  },
  section: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 12,
  },
  howGrid: {
    flexDirection: 'row',
    gap: 7,
  },
  howCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 17,
    paddingVertical: 13,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  howIcon: {
    width: 31,
    height: 31,
    borderRadius: 10,
    backgroundColor: '#f0f2f4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  howTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 3,
  },
  howSub: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 11,
  },
  emptyUpcomingCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 11,
    color: colors.muted,
    textAlign: 'center',
  },
});
