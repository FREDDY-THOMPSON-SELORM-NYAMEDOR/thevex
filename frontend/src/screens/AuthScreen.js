import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { postJson } from '../services/api';
import { saveUser } from '../services/user';

const heroImage = { uri: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1400&q=80' };

export default function AuthScreen({ navigation }) {
  const [mode, setMode] = useState('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit() {
    try {
      setLoading(true);
      setMessage('');
      const endpoint = mode === 'signup' ? '/auth/signup' : '/auth/login';
      const body = mode === 'signup' ? { name, email } : { email };
      const result = await postJson(endpoint, body);
      console.log(result.user);
      await saveUser(result.user);
      navigation.replace('Home');
    } catch (error) {
      setMessage(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground source={heroImage} style={styles.background} imageStyle={styles.backgroundImage}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>Sign up or log in to test real rider accounts.</Text>

          {mode === 'signup' ? (
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor="#8eb4c6" value={name} onChangeText={setName} />
          ) : null}

          <TextInput style={styles.input} placeholder="Email address" placeholderTextColor="#8eb4c6" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{mode === 'signup' ? 'Sign up' : 'Log in'}</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}>
            <Text style={styles.linkText}>{mode === 'signup' ? 'Already have an account? Log in' : 'Need an account? Sign up'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#061426' },
  backgroundImage: { opacity: 0.82 },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { backgroundColor: 'rgba(6,24,44,0.95)', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: 'rgba(33,211,199,0.18)' },
  title: { fontSize: 30, fontWeight: '900', color: '#21d3c7', marginBottom: 8 },
  subtitle: { color: '#c9e5f4', marginBottom: 22, lineHeight: 21 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 18, padding: 16, marginBottom: 16, color: 'white', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  message: { color: '#ffd099', marginBottom: 12, fontWeight: '700' },
  primaryButton: { backgroundColor: '#ff7a1a', padding: 16, borderRadius: 18, marginTop: 8, alignItems: 'center' },
  buttonText: { color: 'white', fontWeight: '800', fontSize: 16 },
  linkButton: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#6fe7de', fontWeight: '700' }
});
