import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { postJson } from '../services/api';
import ScreenLayout from '../components/ScreenLayout';
import { getStoredUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1520974735194-8f4d31a0f38a?auto=format&fit=crop&w=1400&q=80' };

export default function CreateGroupScreen({ navigation, route }) {
  const [location, setLocation] = useState('Aqua Safari');
  const [origin, setOrigin] = useState('Madina');
  const [scheduleDate, setScheduleDate] = useState('2026-07-20');
  const [time, setTime] = useState('7:00 PM');
  const [joinDeadline, setJoinDeadline] = useState('2026-07-19T18:00');
  const [budget, setBudget] = useState('30');
  const [maxMembers, setMaxMembers] = useState('4');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function loadUser() {
      setCurrentUser(await getStoredUser());
    }
    loadUser();
  }, []);

  async function handleCreate() {
    try {
      setMessage('Creating group...');
      await postJson('/createGroup', {
        location: location.trim(),
        origin: origin.trim(),
        scheduleDate: scheduleDate.trim(),
        budget: Number(budget),
        maxMembers: Number(maxMembers),
        time: time.trim(),
        joinDeadline: joinDeadline.trim(),
        split_rules: 'Even split',
        userId: currentUser?.id
      });
      navigation.navigate('BrowseGroups');
    } catch (error) {
      setMessage(error.message || 'Could not create group');
    }
  }

  return (
    <ScreenLayout navigation={navigation} route={route} className="bg-dark">
      <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage} className="w-full">
        <View style={styles.container} className="px-6">
          <View style={styles.card}>
            <Text style={styles.title}>Create a live group</Text>
            <Text style={styles.subtitle}>Set your route, budget, and time, then invite fellow riders.</Text>

            <Text style={styles.fieldLabel}>Location</Text>
            <TextInput style={styles.input} placeholder="Location" placeholderTextColor="#9bb1ca" value={location} onChangeText={setLocation} />
            <Text style={styles.fieldLabel}>Origin</Text>
            <TextInput style={styles.input} placeholder="Origin" placeholderTextColor="#9bb1ca" value={origin} onChangeText={setOrigin} />
            <Text style={styles.fieldLabel}>Schedule Date</Text>
            <TextInput style={styles.input} placeholder="Schedule date (YYYY-MM-DD)" placeholderTextColor="#9bb1ca" value={scheduleDate} onChangeText={setScheduleDate} />
            <Text style={styles.fieldLabel}>Time</Text>
            <TextInput style={styles.input} placeholder="Time (e.g. 6:30 PM)" placeholderTextColor="#9bb1ca" value={time} onChangeText={setTime} />
            <Text style={styles.fieldLabel}>Join Deadline</Text>
            <TextInput style={styles.input} placeholder="Join deadline (YYYY-MM-DDTHH:MM)" placeholderTextColor="#9bb1ca" value={joinDeadline} onChangeText={setJoinDeadline} />
            <Text style={styles.fieldLabel}>Budget</Text>
            <TextInput style={styles.input} placeholder="Budget" placeholderTextColor="#9bb1ca" value={budget} onChangeText={setBudget} keyboardType="numeric" />
            <Text style={styles.fieldLabel}>Max Members</Text>
            <TextInput style={styles.input} placeholder="Max members" placeholderTextColor="#9bb1ca" value={maxMembers} onChangeText={setMaxMembers} keyboardType="numeric" />

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <TouchableOpacity style={styles.primaryButton} onPress={handleCreate}>
              <Text style={styles.buttonText}>Create Group</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#061426' },
  backgroundImage: { opacity: 0.8 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: 'rgba(6, 24, 44, 0.96)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(33,211,199,0.14)' },
  title: { fontSize: 32, fontWeight: '900', color: '#21d3c7', marginBottom: 8 },
  subtitle: { color: '#c9e5f4', marginBottom: 24, lineHeight: 22 },
  fieldLabel: { color: '#c9e5f4', fontSize: 13, fontWeight: '700', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 16, marginBottom: 16, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  message: { color: '#d5f1ff', marginBottom: 16, fontWeight: '700' },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 18, marginTop: 8, alignItems: 'center' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '800', fontSize: 16 }
});
