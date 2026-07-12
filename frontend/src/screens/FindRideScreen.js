import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1555375771-1f10f2359ecf?auto=format&fit=crop&w=1400&q=80' };

export default function FindRideScreen({ navigation, route }) {
  const [origin, setOrigin] = useState('Madina');
  const [destination, setDestination] = useState('University of Ghana');
  const [time, setTime] = useState('9:30 AM');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [APP_USER, setAPP_USER]  = useState({});

  useEffect(()=>{
    const gu = async()=> {
      const theUser = await getStoredUser();
      setAPP_USER(theUser); 
    };
    gu();
  },[])

  async function handleFindRide() {
    try {
      setLoading(true);
      setError('');
      const data = await postJson('/findRide', {
        origin: origin.trim(),
        destination: destination.trim(),
        time: time.trim(),
        userName: APP_USER.name,
        userEmail: APP_USER.email
      });

      navigation.navigate('MatchResult', {
        origin,
        destination,
        time,
        match: data.match,
        request: data.request
      });
    } catch (err) {
      setError(err.message || 'Could not find a ride');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} className="bg-dark">
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage} className="w-full">
        <View style={styles.container} className="px-6">
          <View style={styles.card}>
            <Text style={styles.title}>Find your next ride</Text>
            <Text style={styles.subtitle}>Enter your route and catch the best shared trip instantly.</Text>

            <Text style={styles.fieldLabel}>Origin</Text>
            <TextInput style={styles.input} placeholder="Origin" placeholderTextColor="#9bb1ca" value={origin} onChangeText={setOrigin} />
            <Text style={styles.fieldLabel}>Destination</Text>
            <TextInput style={styles.input} placeholder="Destination" placeholderTextColor="#9bb1ca" value={destination} onChangeText={setDestination} />
            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput style={styles.input} placeholder="Time (e.g. 7:30 PM)" placeholderTextColor="#9bb1ca" value={time} onChangeText={setTime} />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleFindRide} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Find Match</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#061426' },
  backgroundImage: { opacity: 0.7 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: 'rgba(8, 25, 54, 0.94)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(255,122,26,0.18)' },
  title: { fontSize: 32, fontWeight: '900', color: '#21d3c7', marginBottom: 8 },
  subtitle: { color: '#c9e5f4', marginBottom: 24, lineHeight: 22 },
  fieldLabel: { color: '#c9e5f4', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 16, marginBottom: 16, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  error: { color: '#ff9a5f', marginBottom: 12, fontWeight: '700' },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 18, marginTop: 8 },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 16 }
});
