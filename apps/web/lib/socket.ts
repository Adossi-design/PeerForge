import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/discussions`, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('✓ Connected to discussions server');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from discussions server');
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Socket events
export const socketEvents = {
  // Join/Leave
  JOIN_DISCUSSION: 'join_discussion',
  LEAVE_DISCUSSION: 'leave_discussion',

  // Messaging
  SEND_MESSAGE: 'send_message',
  MESSAGE_RECEIVED: 'message_received',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_DELETED: 'message_deleted',

  // Reactions
  REACT_MESSAGE: 'react_message',
  MESSAGE_REACTED: 'message_reacted',

  // Typing
  USER_TYPING: 'user_typing',
  USER_STOP_TYPING: 'user_stop_typing',

  // Presence
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',

  // Errors
  ERROR: 'error',
};

// Helper functions
export function joinDiscussion(discussionId: string, userId: string) {
  const socket = getSocket();
  socket.emit(socketEvents.JOIN_DISCUSSION, { discussionId, userId });
}

export function leaveDiscussion(discussionId: string, userId: string) {
  const socket = getSocket();
  socket.emit(socketEvents.LEAVE_DISCUSSION, { discussionId, userId });
}

export function sendMessage(
  discussionId: string,
  userId: string,
  message: {
    content: string;
    codeLanguage?: string;
    codeContent?: string;
    codeFilename?: string;
  },
) {
  const socket = getSocket();
  socket.emit(socketEvents.SEND_MESSAGE, {
    discussionId,
    userId,
    message,
  });
}

export function deleteMessage(
  discussionId: string,
  messageId: string,
  userId: string,
) {
  const socket = getSocket();
  socket.emit(socketEvents.DELETE_MESSAGE, {
    discussionId,
    messageId,
    userId,
  });
}

export function reactMessage(
  discussionId: string,
  messageId: string,
  emoji: string,
  userId: string,
) {
  const socket = getSocket();
  socket.emit(socketEvents.REACT_MESSAGE, {
    discussionId,
    messageId,
    emoji,
    userId,
  });
}

export function emitUserTyping(
  discussionId: string,
  userId: string,
  username: string,
) {
  const socket = getSocket();
  socket.emit(socketEvents.USER_TYPING, {
    discussionId,
    userId,
    username,
  });
}

export function emitUserStopTyping(discussionId: string, userId: string) {
  const socket = getSocket();
  socket.emit(socketEvents.USER_STOP_TYPING, {
    discussionId,
    userId,
  });
}
