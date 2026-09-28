import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../theme';
import { Badge } from './Badge';

interface RouteCardProps {
  origin: string;
  destination: string;
  departureTime: string;
  driverName?: string;
  driverRating?: number;
  driverRidesCount?: number;
  matchScore?: number;
  availableSeats?: number;
  vehicleModel?: string;
  isWomenOnly?: boolean;
  petrolShare?: number;
  statusText?: string;
  statusVariant?: 'default' | 'green' | 'yellow' | 'match';
  onRequestPress?: () => void;
  onPress?: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  origin,
  destination,
  departureTime,
  driverName,
  driverRating,
  driverRidesCount,
  matchScore,
  availableSeats,
  vehicleModel,
  isWomenOnly,
  petrolShare,
  statusText,
  statusVariant = 'default',
  onRequestPress,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
    >
      <View style={styles.cardHead}>
        {driverName ? (
          <View>
            <Text style={styles.driverName}>{driverName}</Text>
            {(driverRating !== undefined || driverRidesCount !== undefined) && (
              <Text style={styles.subText}>
                ⭐ {driverRating || 4.8} · {driverRidesCount || 12} rides
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.headTime}>{departureTime}</Text>
        )}

        {matchScore !== undefined ? (
          <Badge label={`${matchScore}% match`} variant="match" />
        ) : statusText ? (
          <Badge label={statusText} variant={statusVariant} />
        ) : availableSeats !== undefined ? (
          <Text style={styles.seatsText}>{availableSeats} seat{availableSeats === 1 ? '' : 's'} left</Text>
        ) : null}
      </View>

      <View style={styles.routeContainer}>
        <View style={styles.dotsColumn}>
          <View style={styles.dotStart} />
          <View style={styles.dashLine} />
          <View style={styles.dotEnd} />
        </View>

        <View style={styles.placesColumn}>
          <Text style={styles.placeText}>{origin}</Text>
          <Text style={styles.subText}>Pickup · {departureTime}</Text>
          <View style={{ height: 12 }} />
          <Text style={styles.placeText}>{destination}</Text>
          <Text style={styles.subText}>Drop point</Text>
        </View>
      </View>

      <View style={styles.metaContainer}>
        {vehicleModel && <Badge label={`🚗 ${vehicleModel}`} style={{ marginRight: 6 }} />}
        {isWomenOnly && <Badge label="Women only" variant="yellow" />}
      </View>

      {petrolShare !== undefined && (
        <View style={styles.priceFooter}>
          <View>
            <Text style={styles.priceText}>₹{petrolShare}</Text>
            <Text style={styles.priceSub}>estimated petrol share</Text>
          </View>
          {onRequestPress && (
            <TouchableOpacity style={styles.requestBtn} onPress={onRequestPress}>
              <Text style={styles.requestBtnText}>Request seat</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xs + 4,
  },
  cardHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs + 4,
  },
  headTime: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ink,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  subText: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
  seatsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.ink,
  },
  routeContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  dotsColumn: {
    width: 22,
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
  placesColumn: {
    flex: 1,
    paddingLeft: 6,
  },
  placeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  metaContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs + 4,
  },
  priceFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    marginTop: spacing.xs + 6,
    paddingTop: spacing.xs + 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.ink,
  },
  priceSub: {
    fontSize: 10,
    color: colors.muted,
  },
  requestBtn: {
    backgroundColor: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
  },
  requestBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
