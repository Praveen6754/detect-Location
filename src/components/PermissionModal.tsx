import React from 'react';
import { Modal, View, Text, StyleSheet, Button, Linking } from 'react-native';
import { useLocationPermission } from '../context/LocationPermissionContext';
import { openSettings } from 'react-native-permissions';

export default function PermissionModal() {
  const { showPermissionModal } = useLocationPermission();
    
  return (
    <Modal
      transparent
      
      
      animationType="slide"
      visible={showPermissionModal}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Location Permission Required</Text>
          <Text style={styles.message}>
            This app requires location access to function properly.
          </Text>
          <Button title="Grant Permission" onPress={()=>{
            Linking.openURL('App-prefs:root')
          }} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
});
