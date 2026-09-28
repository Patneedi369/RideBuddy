import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { colors, borderRadius, spacing } from '../../theme';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, vehicles, logout } = useAuth();

  const handleLogout = async () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Ride Buddy?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'S'}</Text>
          </View>
          <Text style={styles.nameText}>{user?.name || 'Satya'}</Text>
          <Text style={styles.phoneText}>{user?.phone_number || '+91 98765 43210'}</Text>

          <View style={styles.badgeRow}>
            <Badge label={`Gender: ${user?.gender ? user.gender.toUpperCase() : 'FEMALE'}`} variant="yellow" />
            <Badge label="Phone Verified ✓" variant="green" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>My Vehicles</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddVehicle')}>
              <Text style={styles.addText}>＋ Add Vehicle</Text>
            </TouchableOpacity>
          </View>

          {vehicles.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptySub}>No vehicles registered yet.</Text>
            </View>
          ) : (
            vehicles.map((v) => (
              <View key={v.id} style={styles.vehicleCard}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>
                  {v.vehicle_type === 'car' ? '🚗' : '🏍️'} {v.model}
                </Text>
                <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                  {v.registration_number || 'Registered'} · {v.capacity} seat{v.capacity === 1 ? '' : 's'} · {v.mileage_kml} km/l
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety & Account</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ReportUser', { userId: 0 })}
          >
            <Text style={styles.menuText}>🛡️ Report an issue or user</Text>
            <Text style={{ color: colors.muted }}>›</Text>
          </TouchableOpacity>
        </View>

        <Button
          title="Log out"
          variant="danger"
          onPress={handleLogout}
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: 94,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
    marginBottom: spacing.md,
  },
  profileHeaderCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e5e7ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.ink,
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  section: {
    marginTop: 24,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  addText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: 16,
    alignItems: 'center',
  },
  emptySub: {
    fontSize: 11,
    color: colors.muted,
  },
  vehicleCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: 14,
    marginBottom: 8,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
});
