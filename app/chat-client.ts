import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  intent?: string;
  sentiment?: string;
  confidence?: number;
  suggestedActions?: string[];
}

export class ChatClient {
  private socket: Socket | null = null;
  private messageCallbacks: ((message: ChatMessage) => void)[] = [];
  private typingCallbacks: ((data: { userId: string; isTyping: boolean }) => void)[] = [];

  constructor(
    private serverUrl: string,
    private userId: string,
    private userType: 'lead' | 'agent',
    private sessionId: string,
    private apiKey: string
  ) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(`${this.serverUrl}/chat`, {
        query: {
          userId: this.userId,
          userType: this.userType,
          sessionId: this.sessionId,
          apiKey: this.apiKey
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connection:success', (data) => {
        console.log('Connected to chat server:', data);
        resolve();
      });

      this.socket.on('message:received', (message: ChatMessage) => {
        console.log('response: ', message)
        this.messageCallbacks.forEach((cb) => cb(message));
      });

      this.socket.on('user:typing', (data) => {
        this.typingCallbacks.forEach((cb) => cb(data));
      });

      this.socket.on('agent:typing', (data) => {
        this.typingCallbacks.forEach((cb) => cb(data));
      });

      this.socket.on('session:ended', () => {
        this.disconnect();
      });
    });
  }

  requestGreeting(agentId: string, leadId?: string): Promise<ChatMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));

      this.socket.once('greeting:response', (message: ChatMessage) => {
        resolve(message);
      });

      this.socket.emit('greeting:request', {
        agentId,
        leadId,
      });
    });
  }

  sendMessage(leadId: string, agentId: string, message: string, conversationId?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));

      this.socket.emit(
        'message:send',
        {
          leadId,
          agentId,
          sessionId: this.sessionId,
          message,
          conversationId,
        },
        (response: any) => {
          if (response?.success) resolve();
          else reject(new Error('Failed to send message'));
        },
      );
    });
  }

  startTyping() {
    this.socket?.emit('typing:start', {
      sessionId: this.sessionId,
      userId: this.userId,
    });
  }

  stopTyping() {
    this.socket?.emit('typing:stop', {
      sessionId: this.sessionId,
      userId: this.userId,
    });
  }

  getConversationHistory(conversationId: string, limit?: number): Promise<ChatMessage[]> {
    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('Socket not connected'));

      this.socket.once('conversation:history:response', (response) => {
        resolve(response.messages);
      });

      this.socket.emit('conversation:history', {
        conversationId,
        limit,
      });
    });
  }

  markAsRead(conversationId: string) {
    this.socket?.emit('conversation:read', {
      conversationId,
      userId: this.userId,
    });
  }

  endSession() {
    this.socket?.emit('session:end', { sessionId: this.sessionId });
  }

  onMessage(callback: (msg: ChatMessage) => void) {
    this.messageCallbacks.push(callback);
  }

  onTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.typingCallbacks.push(callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}
