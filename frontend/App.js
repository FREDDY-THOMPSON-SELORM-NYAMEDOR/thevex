import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { joinUser, socket, onSocketConnect } from './src/services/socket';
import { getStoredUser } from './src/services/user';
import { startLiveLocationTracking, stopLiveLocationTracking } from './src/services/liveLocation';
// Web-only styles for responsive layout
import './web/styles/screens.css';

export default function App() {
  const userIdRef = useRef(null);
  const stopTrackingRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    async function initUser() {
      const user = await getStoredUser();
      userIdRef.current = user?.id || null;
      
      if (user?.id) {
        if (!socket.connected) {
          socket.connect();
        }
        joinUser(user.id);
        stopTrackingRef.current = await startLiveLocationTracking(user.id);
        console.log('User connected!')
      } else {
        await stopLiveLocationTracking();
      }
    }
    
    initUser();

    return () => {
      mounted = false;
      stopTrackingRef.current?.();
      stopLiveLocationTracking();
    };
  }, []);

  useEffect(() => {
    // Re-join on socket reconnection
    const cleanup = onSocketConnect(() => {
      if (userIdRef.current) {
        joinUser(userIdRef.current);
      }
    });
    
    return () => cleanup?.();
  }, []);

  return <AppNavigator />;
}
