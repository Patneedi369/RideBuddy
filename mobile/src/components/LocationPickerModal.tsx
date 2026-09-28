import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView } from 'react-native';
import { locationService, LocationItem } from '../services/location';
import { colors, borderRadius, spacing } from '../theme';

interface LocationPickerModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSelectLocation: (location: LocationItem) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  visible,
  title,
  onClose,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      handleSearch(query);
    }
  }, [visible]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    setLoading(true);
    try {
      const items = await locationService.searchLocations(text);
      setResults(items);
    } catch (e) {
      console.log('Location search failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setGpsLoading(true);
    const curr = await locationService.getCurrentLocation();
    setGpsLoading(false);
    if (curr) {
      onSelectLocation(curr);
      onClose();
    } else {
      alert('Location permission was denied or position unavailable. You can search manually.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="Search address, landmark, or city..."
            placeholderTextColor={colors.muted}
            autoFocus
            clearButtonMode="while-editing"
          />
        </View>

        <TouchableOpacity style={styles.gpsRow} onPress={handleUseCurrentLocation} disabled={gpsLoading}>
          <View style={styles.gpsIconCircle}>
            <Text style={{ fontSize: 16 }}>⌖</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.gpsTitle}>Use current location</Text>
            <Text style={styles.gpsSub}>Enable GPS for precise pickup</Text>
          </View>
          {gpsLoading && <ActivityIndicator size="small" color={colors.ink} />}
        </TouchableOpacity>

        <View style={styles.divider} />

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.ink} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id || item.name}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => {
                  onSelectLocation(item);
                  onClose();
                }}
              >
                <View style={styles.pinCircle}>
                  <Text style={{ fontSize: 14 }}>📍</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc} numberOfLines={1}>{item.description}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.ink,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.muted,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.xs,
  },
  searchInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: borderRadius.md,
    height: 48,
    paddingHorizontal: 14,
    fontSize: 13,
    color: colors.ink,
  },
  gpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    backgroundColor: colors.white,
    marginTop: spacing.xs,
  },
  gpsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  gpsSub: {
    fontSize: 10,
    color: colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.xs,
  },
  loadingBox: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  pinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  itemDesc: {
    fontSize: 11,
    color: colors.muted,
    marginTop: 2,
  },
});
