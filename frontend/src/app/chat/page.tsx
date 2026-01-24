'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { io, Socket } from 'socket.io-client';
import { Send, Users, Circle } from 'lucide-react';

interface Message {
  type: string;
  payload: {
    from?: string;
    content?: string;
    timestamp?: string;
  };
  userId?: string;
  timestamp: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

export default function ChatPage() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    });

    newSocket.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    newSocket.on('presence', (msg: Message) => {
      if (msg.payload.userId) {
        if (msg.payload.status === 'online') {
          setOnlineUsers((prev) => [...new Set([...prev, msg.payload.userId!])]);
        } else {
          setOnlineUsers((prev) => prev.filter((id) => id !== msg.payload.userId));
        }
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !inputMessage.trim()) return;

    socket.emit('message', { content: inputMessage });
    setInputMessage('');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Real-time Chat
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access the chat feature.
          </p>
          <a
            href="/login"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Login to Chat
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary-600" size={20} />
            <h2 className="font-semibold text-gray-900 dark:text-white">Online Users</h2>
          </div>
          <div className="space-y-2">
            {onlineUsers.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">No users online</p>
            ) : (
              onlineUsers.map((userId) => (
                <div key={userId} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Circle className="fill-green-500 text-green-500" size={10} />
                  <span>{userId === user.id ? 'You' : `User ${userId.slice(0, 8)}...`}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm">
              <Circle className={`${isConnected ? 'fill-green-500 text-green-500' : 'fill-red-500 text-red-500'}`} size={10} />
              <span className="text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="md:col-span-3 bg-white dark:bg-slate-800 rounded-xl shadow-lg flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Global Chat Room
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time messaging with WebSockets
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.userId === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.userId === user.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    {msg.userId !== user.id && (
                      <p className="text-xs font-medium mb-1 opacity-70">
                        User {msg.userId?.slice(0, 8)}...
                      </p>
                    )}
                    <p>{msg.payload.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                disabled={!isConnected}
              />
              <button
                type="submit"
                disabled={!isConnected || !inputMessage.trim()}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
