import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { onSocket } from '../services/socket';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1400&q=80' };

export default function MatchResultScreen({ navigation, route }) {
  const { origin, destination, time, match, request } = route.params || {};
  const [currentMatch, setCurrentMatch] = useState(match);
  const [status, setStatus] = useState(match ? 'Match ready' : 'Searching for a rider nearby...');
  const [activeRequest, setActiveRequest] = useState(request);

  useEffect(() => {
     console.log('Match about found:')
    const cleanup = onSocket('matchFound', ({ matchId, request, counterParty }) => {
      console.log('Match found:', matchId, request, counterParty);
      setCurrentMatch({ id: matchId });
      setActiveRequest(request); 
      setStatus('Live match found!');
    });

    return cleanup;
  }, []);

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage}>
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Text style={styles.title}>Ride match</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Origin</Text>
          <Text style={styles.cardText}>{origin || activeRequest?.origin || request?.origin || 'Downtown'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Destination</Text>
          <Text style={styles.cardText}>{destination || activeRequest?.destination || request?.destination || 'Airport'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Time</Text>
          <Text style={styles.cardText}>{time || activeRequest?.time || request?.time || '7:30 PM'}</Text>
        </View>
        <Text style={styles.matchBadge}>{currentMatch ? `Match ID ${currentMatch.id}` : 'Waiting for the best match...'}</Text>
        <Text style={styles.status}>{status}</Text>
        <TouchableOpacity
          style={[styles.primaryButton, !currentMatch && styles.disabledButton]}
          onPress={() => navigation.navigate('Payment', { amount: 24, matchId: currentMatch?.id })}
          disabled={!currentMatch}
        >
          <Text style={styles.buttonText}>{currentMatch ? 'Continue to payment' : 'Waiting...'}</Text>
        </TouchableOpacity>
      </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { opacity: 0.7 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,20,44,0.6)' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { color: '#21d3c7', fontSize: 32, fontWeight: '900', marginBottom: 20 },
  card: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 22, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(33,211,199,0.18)' },
  cardLabel: { color: '#a8d6e8', fontSize: 14, marginBottom: 6 },
  cardText: { color: 'white', fontSize: 18, fontWeight: '700' },
  matchBadge: { color: '#d4f5ff', fontSize: 16, fontWeight: '700', marginVertical: 16, textAlign: 'center' },
  status: { color: '#cfe8f5', fontSize: 15, marginBottom: 22, textAlign: 'center' },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 20, alignItems: 'center' },
  disabledButton: { opacity: 0.6 },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 }
});
