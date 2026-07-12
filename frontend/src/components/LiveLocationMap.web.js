import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function isValidLocation(location) {
  return location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));
}

export default function LiveLocationMap({ liveLocationState, height = 240, title = 'Live locations' }) {
  const user1Location = liveLocationState?.user1Location;
  const user2Location = liveLocationState?.user2Location;
  const carLocation = liveLocationState?.carLocation;
  const hasAnyLocation = isValidLocation(user1Location) || isValidLocation(user2Location) || isValidLocation(carLocation);

  return (
    <View style={[styles.fallbackCard, { minHeight: height }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.fallbackText}>
        Live map rendering is available in the mobile app. On web, tracking details are shown here once GPS data arrives.
      </Text>
      {liveLocationState?.pickupSummary ? <Text style={styles.summary}>{liveLocationState.pickupSummary}</Text> : null}
      {!hasAnyLocation ? <Text style={styles.summary}>Waiting for live GPS coordinates from both riders.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fallbackCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(33,211,199,0.18)',
    marginBottom: 16,
    justifyContent: 'center'
  },
  title: {
    color: '#d4f3fb',
    fontWeight: '800',
    marginBottom: 10,
    fontSize: 16
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
