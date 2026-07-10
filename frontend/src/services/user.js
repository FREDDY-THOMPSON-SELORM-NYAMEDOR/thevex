import AsyncStorage from '@react-native-async-storage/async-storage';
import { postJson } from './api';

const USER_KEY = 'vex-current-user';

export async function saveUser(user) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser() {
  const value = await AsyncStorage.getItem(USER_KEY);
  return value ? JSON.parse(value) : null;
}

export async function clearStoredUser() {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function logoutUser() {
  try {
    await postJson('/auth/logout', {});
    await clearStoredUser();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    await clearStoredUser();
    return true;
  }
}

export async function getAppUser() {
  return getStoredUser();
}

export const APP_USER = {
  id: Math.floor(1000 + Math.random() * 9000),
  name: `Guest ${Math.floor(1000 + Math.random() * 9000)}`,
  email: `guest${Math.floor(100000 + Math.random() * 900000)}@vex.app`
};
