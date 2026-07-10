import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '../screens/HomeScreen';
import FindRideScreen from '../screens/FindRideScreen';
import MatchResultScreen from '../screens/MatchResultScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RideDetailsScreen from '../screens/RideDetailsScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import BrowseGroupsScreen from '../screens/BrowseGroupsScreen';
import RideTrackingScreen from '../screens/RideTrackingScreen';
import AuthScreen from '../screens/AuthScreen';
import { getStoredUser } from '../services/user';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState('Auth');
  const [ready, setReady] = useState(false);
  const [navigationState, setNavigationState] = useState(null);

  useEffect(() => {
    async function loadUser() {
      const storedUser = await getStoredUser();
      setInitialRoute(storedUser ? 'Home' : 'Auth');
      setReady(true);
    }
    loadUser();
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <NavigationContainer
      onStateChange={(state) => {
        setNavigationState(state);
      }}
    >
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="FindRide" component={FindRideScreen} />
        <Stack.Screen name="MatchResult" component={MatchResultScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="BrowseGroups" component={BrowseGroupsScreen} />
        <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
