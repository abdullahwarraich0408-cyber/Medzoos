import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../config/api';
import { getAccessToken } from './auth/tokenStorage';

let socket: Socket | null = null;
let activeToken: string | null = null;

export function getSocketUrl(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}

export async function getCustomerSocket(): Promise<Socket | null> {
  const token = await getAccessToken();
  if (!token) return null;

  if (socket && activeToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  activeToken = token;
  socket = io(getSocketUrl(), {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function disconnectCustomerSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    activeToken = null;
  }
}

export type OrderTrackingEvent = {
  orderId: string;
  status: string;
  type?: 'medicine' | 'prescription' | 'lab' | 'doctor';
  updatedAt?: string;
  createdAt?: string;
};
