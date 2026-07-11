import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Animated, useWindowDimensions, Alert, ActivityIndicator } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import LogoutConfirm from '../components/LogoutConfirm';
import { onSocket } from '../services/socket';
import { getStoredUser, logoutUser } from '../services/user';
import ScreenLayout from '../components/ScreenLayout';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=1400&q=80' };

export default function HomeScreen({ navigation, route }) {
  const [alerts, setAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function loadUser() {
      const user = await getStoredUser();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, useNativeDriver: true })
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    const cleanups = [
      onSocket('rideMatched', ({ origin, destination }) => {
        setAlerts((prev) => [`New live match: ${origin} → ${destination}`, ...prev].slice(0, 5));
      }),
      onSocket('groupCreated', ({ group }) => {
        setAlerts((prev) => [`New group: ${group.origin} → ${group.location}`, ...prev].slice(0, 5));
      }),
      onSocket('groupRideBooked', ({ ride }) => {
        setAlerts((prev) => [`Ride booked: ${ride.provider} arrives in ${ride.eta}`, ...prev].slice(0, 5));
      })
    ];

    return () => cleanups.forEach((fn) => fn());
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logoutUser();
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Auth' }]
        })
      );
    } finally {
      setLoggingOut(false);
    }
  }

  const heroScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  const { width } = useWindowDimensions();
  const actionRow = width >= 760;

  return (
    <ScreenLayout navigation={navigation} route={route} className="bg-dark">
      <View style={styles.container} className="px-6">
        {currentUser && (
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userEmail}>{currentUser.email}</Text>
            </View>
            <LogoutConfirm
              onLogout={handleLogout}
              loading={loggingOut}
              renderTrigger={({ open, disabled }) => (
                <TouchableOpacity style={styles.logoutButton} onPress={open} disabled={disabled}>
                  {disabled ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.logoutText}>Logout</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

          <ImageBackground source={heroImage} style={styles.hero} imageStyle={styles.heroImage} className="w-full h-64 mb-4">
          <View style={styles.heroOverlay} />
          <Animated.View style={[styles.heroCard, { transform: [{ scale: heroScale }] }]}>
            <Text style={styles.heroTitle}>Ride modern</Text>
            <Text style={styles.heroSubtitle}>Connect with nearby riders, share trips, and pay with confidence.</Text>
          </Animated.View>
        </ImageBackground>

        <View style={[styles.actionList, actionRow && styles.actionRow]} className="flex-row flex-wrap justify-between">
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={() => navigation.navigate('FindRide')}>
            <Text style={styles.buttonText}>Find Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => navigation.navigate('CreateGroup')}>
            <Text style={styles.buttonText}>Create Group</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.ghostButton]} onPress={() => navigation.navigate('BrowseGroups')}>
            <Text style={styles.ghostText}>Browse Groups</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.feedTitle} className="ml-6">Live feed</Text>
        <View style={styles.feedBox} className="flex-1 p-6">
          {alerts.length === 0 ? (
            <Text style={styles.feedItem}>Waiting for fresh matches and group updates...</Text>
          ) : (
            alerts.map((alert, index) => (
              <View key={index} style={styles.feedItemCard}>
                <Text style={styles.feedItem}>{alert}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#061426' },
  userHeader: { backgroundColor: '#0a2f47', paddingHorizontal: 24, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(33,211,199,0.15)' },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: '#21d3c7', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#8eb4c6' },
  logoutButton: { backgroundColor: 'rgba(255, 122, 26, 0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 122, 26, 0.3)' },
  logoutText: { color: '#ff7a1a', fontWeight: '700', fontSize: 13 },
  hero: { width: '100%', height: 250, marginBottom: 16 },
  heroImage: { borderBottomLeftRadius: 32, borderBottomRightRadius: 32, opacity: 0.92 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(6,20,38,0.4)', borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  heroCard: { position: 'absolute', left: 20, bottom: 24, right: 20, padding: 20, borderRadius: 24, backgroundColor: 'rgba(3, 37, 67, 0.82)', borderWidth: 1, borderColor: 'rgba(33,211,199,0.18)' },
  heroTitle: { fontSize: 28, fontWeight: '900', color: 'white', marginBottom: 8 },
  heroSubtitle: { color: '#cfe9f2', lineHeight: 22 },
  actionList: { paddingHorizontal: 24, marginBottom: 18 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  button: { padding: 16, borderRadius: 18, marginBottom: 12, alignItems: 'center', flex: 1, minWidth: 140 },
  primaryButton: { backgroundColor: '#21d3c7' },
  secondaryButton: { backgroundColor: '#ff7a1a' },
  ghostButton: { borderColor: '#21d3c7', borderWidth: 1, backgroundColor: 'transparent', marginLeft: 8 },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  ghostText: { color: '#21d3c7', fontWeight: '800', fontSize: 16 },
  feedTitle: { color: '#d4f3fb', fontSize: 18, fontWeight: '700', marginBottom: 12, marginLeft: 24 },
  feedBox: { flex: 1, backgroundColor: '#071b2f', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24 },
  feedItemCard: { backgroundColor: '#0e3a5a', borderRadius: 16, padding: 14, marginBottom: 12 },
  feedItem: { color: '#e8f9ff', fontSize: 15 }
});
