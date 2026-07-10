import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import BottomNav from './BottomNav';

export default function ScreenLayout({ navigation, route, children }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, isWide && styles.contentWide]}>
        {children}
      </ScrollView>
      <BottomNav navigation={navigation} activeRoute={route.name} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#061426' },
  content: { flexGrow: 1, paddingBottom: 16 },
  contentWide: { paddingHorizontal: 32, alignSelf: 'center', width: '100%', maxWidth: 1024 }
});
