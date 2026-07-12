import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';

function isValidLocation(location) {
  return location && Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude));
}

export default function LiveLocationMap({ liveLocationState, height = 240, title = 'Live locations' }) {
  const user1Location = liveLocationState?.user1Location;
  const user2Location = liveLocationState?.user2Location;
  const carLocation = liveLocationState?.carLocation;
  const validLocations = [user1Location, user2Location, carLocation].filter(isValidLocation);
  const centerLocation = carLocation || user1Location || user2Location;
  const hasAnyLocation = validLocations.length > 0;

  const bounds = validLocations.length > 1
    ? validLocations.map((location) => [location.latitude, location.longitude])
    : null;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {hasAnyLocation ? (
        <MapContainer
          style={{ ...styles.map, height }}
          center={bounds ? undefined : [centerLocation.latitude, centerLocation.longitude]}
          zoom={bounds ? undefined : 14}
          bounds={bounds || undefined}
          boundsOptions={{ padding: [36, 36] }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {isValidLocation(user1Location) ? (
            <CircleMarker center={[user1Location.latitude, user1Location.longitude]} radius={10} pathOptions={{ color: '#21d3c7', fillColor: '#21d3c7', fillOpacity: 0.95 }}>
              <Popup>{user1Location.name || 'Rider 1'}</Popup>
            </CircleMarker>
          ) : null}

          {isValidLocation(user2Location) ? (
            <CircleMarker center={[user2Location.latitude, user2Location.longitude]} radius={10} pathOptions={{ color: '#ff7a1a', fillColor: '#ff7a1a', fillOpacity: 0.95 }}>
              <Popup>{user2Location.name || 'Rider 2'}</Popup>
            </CircleMarker>
          ) : null}

          {isValidLocation(carLocation) ? (
            <CircleMarker center={[carLocation.latitude, carLocation.longitude]} radius={9} pathOptions={{ color: '#ffffff', fillColor: '#ffffff', fillOpacity: 0.9 }}>
              <Popup>Shared car location</Popup>
            </CircleMarker>
          ) : null}

          {isValidLocation(user1Location) && isValidLocation(user2Location) ? (
            <Polyline positions={[[user1Location.latitude, user1Location.longitude], [user2Location.latitude, user2Location.longitude]]} pathOptions={{ color: 'rgba(255,255,255,0.5)', weight: 3 }} />
          ) : null}
        </MapContainer>
      ) : (
        <View style={[styles.fallbackCard, { minHeight: height }]}>
          <Text style={styles.fallbackText}>Waiting for live GPS coordinates from both riders.</Text>
        </View>
      )}
      {liveLocationState?.pickupSummary ? <Text style={styles.summary}>{liveLocationState.pickupSummary}</Text> : null}
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
  map: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden'
  },
  fallbackCard: {
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
