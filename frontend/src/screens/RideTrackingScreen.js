import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, RefreshControl, Alert } from 'react-native';
import { getJson, postJson } from '../services/api';
import { getStoredUser } from '../services/user';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import LiveLocationMap from '../components/LiveLocationMap';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519914213166-db6e2b9b0b6b?auto=format&fit=crop&w=1400&q=80' };

export default function RideTrackingScreen({ navigation, route }) {
  const [activeRides, setActiveRides] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function init() {
      const user = await getStoredUser();
      setCurrentUser(user);
      if (user) {
        await loadRides(user.id);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const cleanup = onSocket('rideConfirmed', ({ matchId }) => {
      loadRides(currentUser.id);
    });

    const locationCleanup = onSocket('matchLocationUpdate', () => {
      loadRides(currentUser.id);
    });

    const userLocationCleanup = onSocket('userLocationUpdated', () => {
      loadRides(currentUser.id);
    });

    return () => {
      cleanup();
      locationCleanup();
      userLocationCleanup();
    };
  }, [currentUser]);

  async function loadRides(userId) {
    try {
      const data = await getJson(`/activeRides/${userId}`);
      setActiveRides(data.rides || []);
    } catch (error) {
      console.error('Error loading rides:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleConfirmRide(ride) {
    if (!currentUser) {
      Alert.alert('Error', 'User not found');
      return;
    }

    if (
      (ride.user1_id === currentUser.id && ride.user1_confirmed) ||
      (ride.user2_id === currentUser.id && ride.user2_confirmed)
    ) {
      Alert.alert('Already Confirmed', 'You have already confirmed this ride');
      return;
    }

    try {
      await postJson('/confirmMatch', {
        matchId: ride.id,
        userId: currentUser.id
      });
      Alert.alert('Success', 'Ride confirmation recorded!');
      if (currentUser) {
        await loadRides(currentUser.id);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    if (currentUser) {
      await loadRides(currentUser.id);
    }
  }

  if (loading) {
    return (
      <ScreenLayout navigation={navigation} route={route}>
        <View style={styles.container}>
          <Text style={styles.loadingText}>Loading active rides...</Text>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout
      navigation={navigation}
      route={route}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay} />
        <Text style={styles.title}>Active Rides</Text>
        {activeRides[0]?.liveLocationState ? (
          <LiveLocationMap
            liveLocationState={activeRides[0].liveLocationState}
            title="Live ride map"
            height={260}
          />
        ) : (
          <View style={styles.mapFallback}>
            <Text style={styles.mapFallbackTitle}>Live map</Text>
            <Text style={styles.mapFallbackText}>Waiting for GPS data from the matched riders.</Text>
          </View>
        )}

        {activeRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No active confirmed rides</Text>
            <Text style={styles.emptySubtext}>Find and match a ride to see it here</Text>
          </View>
        ) : (
          activeRides.map((ride) => {
              const isUser1 = ride.user1_id === currentUser?.id;
              const otherUserId = isUser1 ? ride.user2_id : ride.user1_id;
              const userConfirmed = ride.status === 'confirmed' || (isUser1 ? ride.user1_confirmed : ride.user2_confirmed);
              const userPaymentStatus = isUser1 ? ride.user1_payment_status : ride.user2_payment_status;
              const otherPaymentStatus = isUser1 ? ride.user2_payment_status : ride.user1_payment_status;

              return (
                <View key={ride.id} style={styles.rideCard}>
                  <View style={styles.rideHeader}>
                    <Text style={styles.rideId}>Ride #{ride.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: ride.status === 'confirmed' ? '#21d3c7' : '#ff7a1a' }]}>
                      <Text style={styles.statusText}>{ride.status.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.rideDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>From</Text>
                      <Text style={styles.value}>{ride.pickup_location || 'Downtown'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>To</Text>
                      <Text style={styles.value}>{ride.dropoff_location || 'Airport'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.label}>Time</Text>
                      <Text style={styles.value}>{ride.ride_time ? new Date(ride.ride_time).toLocaleTimeString() : 'TBD'}</Text>
                    </View>
                  </View>

                  <View style={styles.paymentStatus}>
                    <Text style={styles.paymentLabel}>Payment Status</Text>
                    <View style={styles.paymentRow}>
                      <Text style={styles.paymentText}>Your Payment: <Text style={userPaymentStatus === 'success' ? styles.success : styles.pending}>{userPaymentStatus}</Text></Text>
                      <Text style={styles.paymentText}>Other Party: <Text style={otherPaymentStatus === 'success' ? styles.success : styles.pending}>{otherPaymentStatus}</Text></Text>
                    </View>
                  </View>

                  <View style={styles.confirmationStatus}>
                    <Text style={styles.confirmLabel}>Your Confirmation</Text>
                    <View style={styles.confirmRow}>
                      <View style={[styles.confirmationBadge, userConfirmed && styles.confirmedBadge]}>
                        <Text style={styles.confirmationText}>{userConfirmed ? '✓ Confirmed' : 'Pending'}</Text>
                      </View>
                    </View>
                  </View>

                  {!userConfirmed && ride.status !== 'confirmed' && userPaymentStatus === 'success' && otherPaymentStatus === 'success' && (
                    <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmRide(ride)}>
                      <Text style={styles.confirmButtonText}>Confirm Ride</Text>
                    </TouchableOpacity>
                  )}

                  {userPaymentStatus !== 'success' && (
                    <View style={styles.warningBox}>
                      <Text style={styles.warningText}>⚠ Both parties must complete payment to confirm</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { opacity: 0.7 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,20,44,0.5)' },
  container: { padding: 24 },
  title: { color: '#21d3c7', fontSize: 28, fontWeight: '900', marginBottom: 20 },
  loadingText: { color: '#c9e5f4', fontSize: 16, textAlign: 'center', marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#c9e5f4', fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptySubtext: { color: '#8eb4c6', fontSize: 14 },
  rideCard: { backgroundColor: 'rgba(10, 47, 71, 0.9)', borderRadius: 20, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(33, 211, 199, 0.2)' },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  rideId: { color: '#21d3c7', fontSize: 16, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  statusText: { color: 'white', fontWeight: '700', fontSize: 12 },
  rideDetails: { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: 14, padding: 12, marginBottom: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#8eb4c6', fontSize: 13, fontWeight: '600' },
  value: { color: '#e8f9ff', fontSize: 13, fontWeight: '600' },
  paymentStatus: { marginBottom: 14 },
  paymentLabel: { color: '#c9e5f4', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  paymentRow: { flexDirection: 'row', flexDirection: 'column' },
  paymentText: { color: '#a8d6e8', fontSize: 12, marginBottom: 4 },
  success: { color: '#21d3c7', fontWeight: '700' },
  pending: { color: '#ff7a1a', fontWeight: '700' },
  confirmationStatus: { marginBottom: 14 },
  confirmLabel: { color: '#c9e5f4', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  confirmRow: { flexDirection: 'row' },
  confirmationBadge: { backgroundColor: 'rgba(255, 122, 26, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 122, 26, 0.4)' },
  confirmedBadge: { backgroundColor: 'rgba(33, 211, 199, 0.2)', borderColor: 'rgba(33, 211, 199, 0.4)' },
  confirmationText: { color: '#ff7a1a', fontWeight: '700', fontSize: 12 },
  confirmButton: { backgroundColor: '#21d3c7', paddingVertical: 12, borderRadius: 14, alignItems: 'center', marginTop: 12 },
  confirmButtonText: { color: '#061426', fontWeight: '800', fontSize: 14 },
  warningBox: { backgroundColor: 'rgba(255, 122, 26, 0.15)', borderRadius: 12, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255, 122, 26, 0.3)' },
  warningText: { color: '#ff7a1a', fontSize: 12, fontWeight: '600' },
  mapFallback: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(33,211,199,0.18)',
    marginBottom: 16
  },
  mapFallbackTitle: { color: '#d4f3fb', fontWeight: '800', marginBottom: 6 },
  mapFallbackText: { color: '#c9e5f4', lineHeight: 20 }
});
