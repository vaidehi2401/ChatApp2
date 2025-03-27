
import { createContext } from 'react';
import { io } from 'socket.io-client';

export const socket = io('http://localhost:3004', { // Your backend URL
  autoConnect: false, // We'll connect manually when needed
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export const SocketContext = createContext();