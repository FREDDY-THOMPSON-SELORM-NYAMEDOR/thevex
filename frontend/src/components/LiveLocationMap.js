import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

let MapView = null;
let Marker = null;
let Polyline = null;

if (Platform.OS !== 'web') {
  ({ default: MapView, Marker, Polyline } = require('react-native-maps'));
}

function toRegion(location) {
  if (!location) return null;
  return {
    latitude: Number(location.latitude),
    longitude: Number(location.longitude),
    latitudeDelta: 0.02,
    longitudeDelta: 0.02
  };
}

function isValidLocation(location) {
  return location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));
}

export default function LiveLocationMap({ liveLocationState, height = 240, title = 'Live locations' }) {
  const user1Location = liveLocationState?.user1Location;
  const user2Location = liveLocationState?.user2Location;
  const carLocation = liveLocationState?.carLocation;
  const focusLocation = carLocation || user1Location || user2Location;
  const region = toRegion(focusLocation);
  const isWeb = Platform.OS === 'web';

  if (isWeb || !region || (!isValidLocation(user1Location) && !isValidLocation(user2Location) && !isValidLocation(carLocation))) {
    return (
      <View style={[styles.fallbackCard, { minHeight: height }]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.fallbackText}>Waiting for live GPS coordinates from both riders.</Text>
        {liveLocationState?.pickupSummary ? <Text style={styles.summary}>{liveLocationState.pickupSummary}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <MapView style={[styles.map, { height }]} initialRegion={region} region={region}>
        {isValidLocation(user1Location) ? <Marker coordinate={user1Location} title="Rider 1" description={user1Location.name || 'First rider'} pinColor="#21d3c7" /> : null}
        {isValidLocation(user2Location) ? <Marker coordinate={user2Location} title="Rider 2" description={user2Location.name || 'Second rider'} pinColor="#ff7a1a" /> : null}
        {isValidLocation(carLocation) ? <Marker coordinate={carLocation} title="Car" description="Shared car location" pinColor="#ffffff" /> : null}
        {isValidLocation(user1Location) && isValidLocation(user2Location) ? (
          <Polyline coordinates={[user1Location, user2Location]} strokeColor="rgba(255,255,255,0.4)" strokeWidth={3} />
        ) : null}
      </MapView>
      <Text style={styles.summary}>{liveLocationState?.pickupSummary || 'Live tracking active'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(33,211,199,0.18)',
    marginBottom: 16
  },
  title: {
    color: '#d4f3fb',
    fontWeight: '800',
    marginBottom: 10,
    fontSize: 16
  },
  map: {
    width: '100%',
    borderRadius: 18
  },
  fallbackCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(33,211,199,0.18)',
    marginBottom: 16,
    justifyContent: 'center'
  },
  fallbackText: {
    color: '#c9e5f4',
    lineHeight: 20,
    marginBottom: 8
  },
  summary: {
    color: '#9ddae0',
    marginTop: 10,
    lineHeight: 18
  }
});