import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:6060'; 

export const socket = io(SOCKET_URL, { 
  autoConnect: false,
  reconnection: false,
  timeout: 5000,
});

// Add error handling
socket.on('connect_error', (error) => {
  console.warn('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});