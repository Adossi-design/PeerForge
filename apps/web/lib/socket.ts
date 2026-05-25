import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;
let dmSocket: Socket | null = null;
let currentToken: string | null = null;
let currentDmToken: string | null = null;

/**
 * Returns the discussions socket, creating (or recreating, if the token has
 * changed) the underlying connection. The server authenticates the user from
 * this token at handshake time — events no longer accept a userId payload.
 */
export function getSocket(token: string | null): Socket {
  if (socket && currentToken === token) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentToken = token;
  socket = io(`${SOCKET_URL}/discussions`, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: { token: token ?? undefined },
  });
  return socket;
}

export function getDmSocket(token: string | null): Socket {
  if (dmSocket && currentDmToken === token) return dmSocket;
  if (dmSocket) {
    dmSocket.disconnect();
    dmSocket = null;
  }
  currentDmToken = token;
  dmSocket = io(`${SOCKET_URL}/dm`, {
    reconnection: true,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling'],
    withCredentials: true,
    auth: { token: token ?? undefined },
  });
  return dmSocket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}

export function disconnectDmSocket() {
  if (dmSocket) {
    dmSocket.disconnect();
    dmSocket = null;
    currentDmToken = null;
  }
}

// Socket events
export const socketEvents = {
  JOIN_DISCUSSION: 'join_discussion',
  LEAVE_DISCUSSION: 'leave_discussion',
  SEND_MESSAGE: 'send_message',
  MESSAGE_RECEIVED: 'message_received',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_DELETED: 'message_deleted',
  REACT_MESSAGE: 'react_message',
  MESSAGE_REACTED: 'message_reacted',
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  ERROR: 'error',
};
