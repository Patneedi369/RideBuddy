import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { FindRideScreen } from '../screens/find/FindRideScreen';
import { OfferRideScreen } from '../screens/offer/OfferRideScreen';
import { MyRidesScreen } from '../screens/rides/MyRidesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => {
          let icon = '⌕';
          if (route.name === 'Home') icon = '🏠';
          else if (route.name === 'Find') icon = '⌕';
          else if (route.name === 'Offer') icon = '＋';
          else if (route.name === 'MyRides') icon = '🚘';
          else if (route.name === 'Profile') icon = '👤';

          return (
            <Text style={{ fontSize: 18, color: focused ? colors.ink : colors.tabInactive }}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Find" component={FindRideScreen} options={{ tabBarLabel: 'Find' }} />
      <Tab.Screen name="Offer" component={OfferRideScreen} options={{ tabBarLabel: 'Offer' }} />
      <Tab.Screen name="MyRides" component={MyRidesScreen} options={{ tabBarLabel: 'My Rides' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 8,
    paddingBottom: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  tabLabel: {
    fontFamily: 'System',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
