import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

import { PhoneLoginScreen } from '../screens/auth/PhoneLoginScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';
import { CreateProfileScreen } from '../screens/auth/CreateProfileScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { SearchResultsScreen } from '../screens/find/SearchResultsScreen';
import { RideDetailsScreen } from '../screens/rides/RideDetailsScreen';
import { AddVehicleScreen } from '../screens/offer/AddVehicleScreen';
import { RideChatScreen } from '../screens/chat/RideChatScreen';
import { ReportUserScreen } from '../screens/safety/ReportUserScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { isLoading, isAuthenticated, isProfileComplete } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
          </>
        ) : !isProfileComplete ? (
          <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
            <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
            <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
            <Stack.Screen name="RideChat" component={RideChatScreen} />
            <Stack.Screen name="ReportUser" component={ReportUserScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
