import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import BottomNav from './BottomNav';

export default function ScreenLayout({ navigation, route, children, refreshControl, showsVerticalScrollIndicator = true, contentContainerStyle, className, ...props }) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const containerStyle = [
    styles.content,
    isWide && styles.contentWide,
    contentContainerStyle
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <ScrollView
          className="app-scroll"
          contentContainerStyle={containerStyle}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          {...props}
        >
          <View style={styles.inner} className={className}>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav navigation={navigation} activeRoute={route.name} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#061426' },
  flex: { flex: 1 },
  inner: { width: '100%' },
  content: { minHeight: '100%', paddingBottom: 140, paddingHorizontal: 24 },
  contentWide: { alignSelf: 'center', width: '100%', maxWidth: 1024, paddingHorizontal: 32 }
});
