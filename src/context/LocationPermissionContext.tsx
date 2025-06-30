// import React, {
//   createContext,
//   useContext,
//   useEffect,
//   useRef,
//   useState,
// } from 'react';
// import { Platform, PermissionsAndroid, AppState, Alert } from 'react-native';
// import { PERMISSIONS, check, request } from 'react-native-permissions';
// import Geolocation from 'react-native-geolocation-service';

// type Location = { latitude: number; longitude: number };

// type LocationPermissionContextType = {
//   location: Location | null;
//   showPermissionModal: boolean;
//   setShowPermissionModal: (value: boolean) => void;
// };

// const LocationPermissionContext = createContext<LocationPermissionContextType>({
//   location: null,
//   showPermissionModal: false,
//   setShowPermissionModal: () => {},
// });

// export const LocationPermissionProvider = ({
//   children,
// }: {
//   children: React.ReactNode;
// }) => {
//   const [location, setLocation] = useState<Location | null>(null);
//   const [showPermissionModal, setShowPermissionModal] = useState(false);
//   const appState = useRef(AppState.currentState);
//   const cameFromSettings = useRef(false);

//   // find current location
//   const getCurrentLocation = () => {
//     Geolocation.getCurrentPosition(
//       position => {
//         setLocation({
//           latitude: position.coords.latitude,
//           longitude: position.coords.longitude,
//         });
//       },
//       error => {
//         console.warn('Error getting location:', error);
//       },
//       { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
//     );
//   };
//   // check permission and request if not granted
//   const checkAndRequestPermission = async () => {
//     try {
//       const permission = Platform.select({
//         android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//         ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE || PERMISSIONS.IOS.LOCATION_ALWAYS,
//       });

//       if (!permission) return;

//       const status = await check(permission);

//       if (status === 'granted') {
//         cameFromSettings.current = false;
//         getCurrentLocation();
//         return;
//       }

//       if (Platform.OS === 'android') {
//         // Android specific flow
//         const hasStatus = await PermissionsAndroid.request(
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         );
        
//         if (hasStatus === PermissionsAndroid.RESULTS.GRANTED) {
//           cameFromSettings.current = false;
//           getCurrentLocation();
//           return
//         } else if (
//           hasStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
//           hasStatus === PermissionsAndroid.RESULTS.DENIED
//         ) {
//           cameFromSettings.current = true;
//           setShowPermissionModal(true);
//           return
//         }
//       } else {
//         // iOS specific flow
//         const requestStatus = await request(PERMISSIONS.IOS.LOCATION_ALWAYS || PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
//           if (requestStatus === 'granted') {
//             cameFromSettings.current = false;
//             getCurrentLocation();
//             return
//           } else if(status === 'denied' || status === 'blocked' || status === "unavailable"){
//             cameFromSettings.current = true;
//             setShowPermissionModal(true);
//             return
//           }
//       }
//     } catch (error) {
//       console.error('Permission check error:', error);
//     }
//   };


//   useEffect(() => {
//     // Initial permission check on mount
//     checkAndRequestPermission();

//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Handle app state changes
//   useEffect(() => {
//     const subscription = AppState.addEventListener(
//       'change',
//       async nextAppState => {
//         if (
//           appState.current.match(/background/) &&
//           nextAppState === 'active' &&
//           cameFromSettings.current
//         ) {
//           const permission = Platform.select({
//             android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
//             ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE || PERMISSIONS.IOS.LOCATION_ALWAYS,
//           });
          
//           if (!permission) return;

//           const status = await check(permission);
//           if (status === 'granted') {
//             setShowPermissionModal(false);
//             cameFromSettings.current = false;
//             getCurrentLocation();
//             return
//           } else {
//             setShowPermissionModal(true);
//             return
//           }
//         }
//         appState.current = nextAppState;
//       },
//     );
//     return () => {
//       subscription.remove();
//     };
//   }, []);


//   return (
//     <LocationPermissionContext.Provider
//       value={{
//         location,
//         showPermissionModal,
//         setShowPermissionModal,
//       }}
//     >
//       {children}
//     </LocationPermissionContext.Provider>
//   );
// };

// export const useLocationPermission = () => {
//   const context = useContext(LocationPermissionContext);
//   if (!context) {
//     throw new Error(
//       'useLocationPermission must be used within a LocationPermissionProvider',
//     );
//   }
//   return context;
// };

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  PermissionsAndroid,
  AppState,
} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
} from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';

type Location = { latitude: number; longitude: number };

type LocationPermissionContextType = {
  location: Location | null;
  showPermissionModal: boolean;
  setShowPermissionModal: (value: boolean) => void;
};

const LocationPermissionContext = createContext<LocationPermissionContextType>({
  location: null,
  showPermissionModal: false,
  setShowPermissionModal: () => {},
});

export const LocationPermissionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const appState = useRef(AppState.currentState);
  const cameFromSettings = useRef(false);

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      error => {
        console.warn('Error getting location:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const checkAndRequestPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          setShowPermissionModal(true);
          cameFromSettings.current = true;
          return
        }
      } else {
        const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE || PERMISSIONS.IOS.LOCATION_ALWAYS;
        const status = await check(permission);

        if (status === RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          const reqStatusAlways = await Geolocation.requestAuthorization("always")
          const reqStatusWhenInUse = await Geolocation.requestAuthorization("whenInUse")
          
          if (reqStatusAlways === RESULTS.GRANTED || reqStatusWhenInUse === RESULTS.GRANTED) {
            getCurrentLocation();
          } else {
            setShowPermissionModal(true);
            cameFromSettings.current = true;
          }
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  };

  useEffect(() => {
    checkAndRequestPermission();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/background/) &&
          nextAppState === 'active' &&
          cameFromSettings.current
        ) {
          const permission = Platform.select({
            android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          });
          if (!permission) return;

          const status = await check(permission);
          if (status === RESULTS.GRANTED) {
            getCurrentLocation();
            setShowPermissionModal(false);
            cameFromSettings.current = false;
          } else {
            setShowPermissionModal(true);
          }
        }
        appState.current = nextAppState;
      },
    );
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <LocationPermissionContext.Provider
      value={{
        location,
        showPermissionModal,
        setShowPermissionModal,
      }}
    >
      {children}
    </LocationPermissionContext.Provider>
  );
};

export const useLocationPermission = () => {
  const context = useContext(LocationPermissionContext);
  if (!context) {
    throw new Error(
      'useLocationPermission must be used within a LocationPermissionProvider',
    );
  }
  return context;
};
