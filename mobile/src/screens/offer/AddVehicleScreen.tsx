import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { colors, borderRadius, spacing } from '../../theme';
import { VehicleType } from '../../types';

export const AddVehicleScreen = ({ navigation }: any) => {
  const { addVehicle } = useAuth();
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [model, setModel] = useState('Honda City');
  const [regNum, setRegNum] = useState('AP 39 AB 1234');
  const [capacity, setCapacity] = useState('3');
  const [mileage, setMileage] = useState('15');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!model.trim()) {
      setError('Please enter vehicle model.');
      return;
    }
    const capNum = parseInt(capacity, 10);
    const milNum = parseFloat(mileage);

    if (vehicleType === 'bike' && capNum > 1) {
      setError('A bike can only carry 1 passenger.');
      return;
    }

    if (capNum < 1 || capNum > 6) {
      setError('Passenger capacity must be between 1 and 6.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await addVehicle(vehicleType, model.trim(), capNum, milNum || 15.0, regNum.trim());
      Alert.alert('Success', 'Vehicle added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to add vehicle.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add a vehicle</Text>

        <Text style={styles.label}>VEHICLE TYPE</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBox, vehicleType === 'car' && styles.choiceSelected]}
            onPress={() => {
              setVehicleType('car');
              setCapacity('3');
              setMileage('15');
            }}
          >
            <Text style={[styles.choiceText, vehicleType === 'car' && styles.choiceTextSelected]}>🚗 Car</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBox, vehicleType === 'bike' && styles.choiceSelected]}
            onPress={() => {
              setVehicleType('bike');
              setCapacity('1');
              setMileage('40');
            }}
          >
            <Text style={[styles.choiceText, vehicleType === 'bike' && styles.choiceTextSelected]}>🏍️ Bike</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="VEHICLE MODEL"
          value={model}
          onChangeText={(txt) => {
            setModel(txt);
            setError('');
          }}
          placeholder="e.g. Honda City"
          error={error}
        />

        <Input
          label="REGISTRATION NUMBER (OPTIONAL)"
          value={regNum}
          onChangeText={setRegNum}
          placeholder="e.g. AP 39 AB 1234"
        />

        <Input
          label="AVAILABLE PASSENGER SEATS"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />

        <Input
          label="ESTIMATED MILEAGE (KM/LITER)"
          value={mileage}
          onChangeText={setMileage}
          keyboardType="numeric"
        />

        <Button
          title="Save vehicle"
          onPress={handleAdd}
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
