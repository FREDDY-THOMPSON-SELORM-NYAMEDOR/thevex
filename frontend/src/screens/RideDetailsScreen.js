import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import ScreenLayout from '../components/ScreenLayout';

const heroImage = { uri: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?auto=format&fit=crop&w=1400&q=80' };

export default function RideDetailsScreen({ navigation, route }) {
  const ride = route.params?.ride || {};

  return (
    <ScreenLayout navigation={navigation} route={route}>
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage}>
        <View style={styles.overlay} />
        <View style={styles.container}>
        <Text style={styles.title}>Ride confirmed</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Provider</Text>
          <Text style={styles.cardText}>{ride.provider || 'Uber/Bolt mock'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Driver</Text>
          <Text style={styles.cardText}>{ride.driver || 'Ava'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Car</Text>
          <Text style={styles.cardText}>{ride.car || 'Tesla Model 3'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>ETA</Text>
          <Text style={styles.cardText}>{ride.eta || '4 mins'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>License</Text>
          <Text style={styles.cardText}>{ride.license || 'LXB-9824'}</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.buttonText}>Back home</Text>
        </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  backgroundImage: { opacity: 0.68 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3,17,32,0.72)' },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#21d3c7', marginBottom: 18 },
  card: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(33,211,199,0.14)' },
  cardLabel: { color: '#9ddae0', fontSize: 12, marginBottom: 6, textTransform: 'uppercase' },
  cardText: { color: 'white', fontSize: 18, fontWeight: '700' },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 20, marginTop: 16, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 }
});
