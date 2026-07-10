import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { joinUser, socket, onSocketConnect } from './src/services/socket';
import { getStoredUser } from './src/services/user';

export default function App() {
  const userIdRef = useRef(null);

  useEffect(() => {
    async function initUser() {
      const user = await getStoredUser();
      userIdRef.current = user?.id || null;
      
      if (user?.id) {
        if (!socket.connected) {
          socket.connect();
        }
        joinUser(user.id);
        console.log('User connected')
      }
    }
    
    initUser();
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
