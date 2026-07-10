import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const navItems = [
  { name: 'Home', label: 'Home' },
  { name: 'FindRide', label: 'Search' },
  { name: 'RideTracking', label: 'Tracking' },
  { name: 'BrowseGroups', label: 'Groups' }
];

export default function BottomNav({ navigation, activeRoute }) {
  return (
    <View style={styles.navBar}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={[styles.navButton, activeRoute === item.name && styles.navButtonActive]}
          onPress={() => navigation.navigate(item.name)}
        >
          <Text style={[styles.navText, activeRoute === item.name && styles.navTextActive]}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#071b2f',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)'
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    marginHorizontal: 4
  },
  navButtonActive: {
    backgroundColor: '#21d3c7'
  },
  navText: {
    color: '#ccebf5',
    fontWeight: '700'
  },
  navTextActive: {
    color: 'white'
  }
});
