import { io } from 'socket.io-client';
import { API_BASE_URL } from './api';

export const socket = io(API_BASE_URL, { transports: ['websocket'] });

export function joinUser(userId) {
  socket.emit('joinUser', userId);
}

export function onSocket(event, handler) {
  socket.on(event, handler);
  return () => socket.off(event, handler);
}

export function onSocketConnect(handler) {
  socket.on('connect', handler);
  return () => socket.off('connect', handler);
}
