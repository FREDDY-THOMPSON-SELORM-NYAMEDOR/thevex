import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, ImageBackground } from 'react-native';
import { postJson, getJson } from '../services/api';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80' };

export default function PaymentScreen({ navigation, route }) {
  const amount = route.params?.amount || 24;
  const matchId = route.params?.matchId;
  const paymentType = route.params?.paymentType || 'match';
  const groupId = route.params?.groupId;
  const groupMemberId = route.params?.groupMemberId;
  const share = Math.round(amount / 2);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Ready to pay');
  const [reference, setReference] = useState('');
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      setCurrentUser(await getStoredUser());
    }
    loadUser();

    const clean1 = onSocket('paymentStatus', ({ status }) => {
      setStatusMessage(`Payment update: ${status}`);
    });
    const cleanGroup = onSocket('groupPaymentStatus', ({ status }) => {
      setStatusMessage(`Group payment update: ${status}`);
    });
    const cleanVerified = onSocket('groupMemberVerified', () => {
      setStatusMessage('Group membership verified.');
    });
    const clean2 = onSocket('rideBooked', (ride) => {
      setStatusMessage(`Ride booked: ${ride.driver} arriving ${ride.eta}`);
      navigation.navigate('RideDetails', { ride });
    });
    return () => { clean1(); cleanGroup(); cleanVerified(); clean2(); };
  }, [navigation]);

  async function handlePaystack() {
    try {
      setLoading(true);
      setStatusMessage('Initializing payment...');
      const payload = paymentType === 'group'
        ? { groupId, groupMemberId, userId: currentUser?.id, amount }
        : { matchId, userId: currentUser?.id, amount };
      const data = await postJson('/processPayment', payload);

      setReference(data.reference);
      setPaymentUrl(data.authorizationUrl);
      setStatusMessage('Opening Paystack checkout...');
      await Linking.openURL(data.authorizationUrl);
    } catch (err) {
      setStatusMessage(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    if (!reference) {
      setStatusMessage('Please start payment first.');
      return;
    }
    try {
      setLoading(true);
      setStatusMessage('Verifying payment...');
      const result = await getJson(`/verifyPayment/${encodeURIComponent(reference)}`);
      const status = result.payment.status;
      setStatusMessage(status === 'success' ? 'Payment success!' : 'Payment failed.');

      if (status === 'success' && paymentType !== 'group') {
        const rideResult = await postJson('/bookRide', { matchId });
        navigation.navigate('RideDetails', { ride: rideResult.ride });
      }

      if (status === 'success' && paymentType === 'group') {
        navigation.goBack();
      }
    } catch (err) {
      setStatusMessage(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay} />
        <View style={styles.container}>
          <Text style={styles.title}>Pay with Paystack</Text>
          <View style={styles.infoCard}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.price}>GHS{amount}</Text>
            <Text style={styles.label}>{paymentType === 'group' ? 'Group share' : 'Your share'}</Text>
            <Text style={styles.price}>GHS{paymentType === 'group' ? amount : share}</Text>
          </View>

          <Text style={styles.note}>Use test card 4084 4084 0840 8408 with any future expiry and CVV.</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handlePaystack} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Start Paystack payment</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleVerify} disabled={loading || !reference}>
            <Text style={styles.buttonText}>{reference ? 'Verify payment' : 'Pay before verify'}</Text>
          </TouchableOpacity>
          {paymentUrl ? <Text style={styles.note}>Payment URL opened in your browser.</Text> : null}
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { opacity: 0.72 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(5,15,30,0.72)' },
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  title: { color: '#21d3c7', fontSize: 32, fontWeight: '900', marginBottom: 20 },
  infoCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 22, padding: 20, marginBottom: 18, borderWidth: 1, borderColor: 'rgba(33,211,199,0.16)' },
  label: { color: '#9ddae0', fontSize: 14, textTransform: 'uppercase', marginBottom: 6 },
  price: { color: 'white', fontSize: 24, fontWeight: '800', marginBottom: 12 },
  note: { color: '#bcdbe9', marginBottom: 14, lineHeight: 20 },
  statusBox: { backgroundColor: 'rgba(255,255,255,0.08)', padding: 16, borderRadius: 18, marginBottom: 16 },
  statusLabel: { color: '#9ddae0', marginBottom: 8, fontWeight: '700' },
  statusText: { color: 'white', fontSize: 16 },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 18, marginBottom: 12, alignItems: 'center' },
  secondaryButton: { backgroundColor: '#21d3c7', padding: 16, borderRadius: 18, alignItems: 'center' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 16 }
});
