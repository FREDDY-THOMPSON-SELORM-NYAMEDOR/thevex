import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';

export default function LogoutConfirm({ onLogout, loading = false, children, renderTrigger }) {
  const [visible, setVisible] = useState(false);

  function open() {
    if (!loading) setVisible(true);
  }

  return (
    <View>
      {renderTrigger ? (
        renderTrigger({ open, disabled: loading })
      ) : (
        <TouchableOpacity onPress={open} style={styles.button} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : children ? (
            children
          ) : (
            <Text style={styles.text}>Logout</Text>
          )}
        </TouchableOpacity>
      )}

      <Modal transparent visible={visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>Logout</Text>
            <Text style={styles.subtitle}>Are you sure you want to log out?</Text>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => setVisible(false)} style={styles.cancel}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  setVisible(false);
                  await onLogout && onLogout();
                }}
                style={styles.confirm}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.confirmText}>Logout</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: { backgroundColor: '#ff7a1a', padding: 12, borderRadius: 8 },
  text: { color: 'white', fontWeight: 'bold' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancel: { marginRight: 12 },
  cancelText: { color: '#555' },
  confirm: { backgroundColor: '#ff7a1a', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  confirmText: { color: 'white', fontWeight: 'bold' },
});
