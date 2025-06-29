/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// import { NewAppScreen } from '@react-native/new-app-screen';
import React, { useState } from 'react';
import {
  Alert,
  Button,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCurrentLocation } from './src/utils/getLocationPermission';
import { checkIfWithin30Meters } from './src/utils/checkIfWithin30m';
import { LocationPermissionProvider, useLocationPermission } from './src/context/LocationPermissionContext';
import PermissionModal from './src/components/PermissionModal';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [coordinates, setCoordinates] = useState({
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState({ latitude: false, longitude: false });
  const [getLocationValue, setGetLocationValue] = useState('');
  const [result, setResult] = useState<{
    presentableLocation: boolean;
    actualLocation: { latitude: number; longitude: number };
    howFar: number;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const handleLatitudeChange = (value: string) => {
    // Allow up to 2 digits before decimal, optional negative sign
    const regex = /^-?([0-9]{0,2})(\.\d{0,8})?$/;

    setCoordinates(prev => ({ ...prev, latitude: value }));

    if (regex.test(value)) {
      const num = parseFloat(value);
      if (num >= -90 && num <= 90) {
        setErrors(prev => ({ ...prev, latitude: false }));
      } else {
        setErrors(prev => ({ ...prev, latitude: true }));
      }
    } else {
      setErrors(prev => ({ ...prev, latitude: true }));
    }
  };

  const handleLongitudeChange = (value: string) => {
    // Allow up to 3 digits before decimal, optional negative sign
    const regex = /^-?((1[0-7]?\d)|([1-9]?\d))(\.\d{0,8})?$/;

    setCoordinates(prev => ({ ...prev, longitude: value }));

    if (regex.test(value)) {
      const num = parseFloat(value);
      if (num >= -180 && num <= 180) {
        setErrors(prev => ({ ...prev, longitude: false }));
      } else {
        setErrors(prev => ({ ...prev, longitude: true }));
      }
    } else {
      setErrors(prev => ({ ...prev, longitude: true }));
    }
  };
  const handleGetLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      console.log(loc);
      setGetLocationValue(JSON.stringify(loc));
    } catch (err) {
      if (err instanceof Error) {
        Alert.alert('Error', err.message);
      } else {
        Alert.alert('Error', String(err));
      }
    }
  };
  const handleSubmit = async () => {
    try {
      const lat = parseFloat(coordinates.latitude);
      const long = parseFloat(coordinates.longitude);

      // Check for NaN before continuing
      if (isNaN(lat) || isNaN(long)) {
        setErrorMsg('Please enter valid numeric coordinates');
        setResult(null);
        return;
      }

      if (!errors.latitude && !errors.longitude) {
        const locationResult = await checkIfWithin30Meters(lat, long);
        setResult(locationResult);
        setErrorMsg('');
      }
    } catch (err) {
      setResult(null);
      if (err instanceof Error) {
        setErrorMsg(err.message || 'Failed to get location');
      } else {
        setErrorMsg('Failed to get location');
      }
    }
  };

  return (
    <LocationPermissionProvider>
     <PermissionModal />
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.centeredContainer}>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.latitude && styles.errorBorder]}
              keyboardType="decimal-pad"
              placeholder="Latitude (-90 to 90)"
              value={coordinates.latitude}
              onChangeText={handleLatitudeChange}
            />
            <Text style={styles.errorText}>
              {errors.latitude ? 'Invalid Latitude' : ' '}
            </Text>
          </View>
          <View style={styles.inputGroup}>
            <TextInput
              style={[styles.input, errors.longitude && styles.errorBorder]}
              keyboardType="decimal-pad"
              placeholder="Longitude (-180 to 180)"
              value={coordinates.longitude}
              onChangeText={handleLongitudeChange}
            />
            <Text style={styles.errorText}>
              {errors.longitude ? 'Invalid Longitude' : ' '}
            </Text>
          </View>

          <Button
            disabled={errors.latitude || errors.longitude}
            title="Submit"
            onPress={handleSubmit}
          />
          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {result && (
            <View style={styles.resultBox}>
              <Text>
                📍 Your Location: {result.actualLocation.latitude},{' '}
                {result.actualLocation.longitude}
              </Text>
              <Text>📏 How far: {result.howFar} meters</Text>
              <Text>
                ✅ Presentable Location:{' '}
                {result.presentableLocation ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
          <Button
            //  disabled={errors.latitude || errors.longitude}
            title="Get Location"
            onPress={handleGetLocation}
          />
          {getLocationValue && <Text>📍 Location: {getLocationValue}</Text>}
        </View>
      </SafeAreaView>
    </LocationPermissionProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  inputGroup: {
    width: '80%',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    height: 20,
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  resultBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
});

export default App;
