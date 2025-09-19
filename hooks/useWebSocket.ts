'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, ChatMessage } from '@/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://task-management-agent-backend-production.up.railway.app';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const chatWsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 3;

  const connectChatWebSocket = useCallback(() => {
    // Prevent multiple connection attempts
    if (isConnectingRef.current) {
      console.log('Connection attempt already in progress, skipping');
      return;
    }
    
    if (chatWsRef.current && 
        (chatWsRef.current.readyState === WebSocket.CONNECTING || 
         chatWsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connecting or connected, skipping connection attempt');
      return;
    }

    try {
      isConnectingRef.current = true;
      const wsUrl = `${WS_BASE_URL}/api/chat/ws`;
      console.log('Attempting to connect to:', wsUrl);
      const chatWs = new WebSocket(wsUrl);
      chatWsRef.current = chatWs;

      chatWs.onopen = () => {
        console.log('Chat WebSocket connected successfully');
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionError(null);
        reconnectAttemptsRef.current = 0;
      };

      chatWs.onmessage = (event) => {
        try {
          const wsMessage: WebSocketMessage = JSON.parse(event.data);
          console.log('Received WebSocket message:', wsMessage);
          
          switch (wsMessage.type) {
            case 'connection':
              const newSessionId = wsMessage.data.session_id || null;
              setSessionId(newSessionId);
              if (wsMessage.data.message) {
                const agentMessage: ChatMessage = {
                  id: Date.now().toString(),
                  message: wsMessage.data.message,
                  type: 'agent',
                  timestamp: new Date().toISOString(),
                  session_id: newSessionId || undefined,
                };
                setMessages(prev => [...prev, agentMessage]);
              }
              break;

            case 'chat_response':
              setIsTyping(false);
              if (wsMessage.data.response) {
                const agentMessage: ChatMessage = {
                  id: Date.now().toString(),
                  message: wsMessage.data.response,
                  type: 'agent',
                  timestamp: new Date().toISOString(),
                  session_id: sessionId || undefined,
                };
                setMessages(prev => [...prev, agentMessage]);
              }
              break;

            case 'error':
              setIsTyping(false);
              setConnectionError(wsMessage.data.message || 'Unknown error');
              break;

            case 'ping':
              // Respond to ping with pong
              if (chatWs.readyState === WebSocket.OPEN) {
                chatWs.send('pong');
              }
              break;

            default:
              console.log('Unknown message type:', wsMessage.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      chatWs.onerror = (error) => {
        console.error('Chat WebSocket error:', error);
        isConnectingRef.current = false;
        setConnectionError('Failed to connect to server');
        setIsConnected(false);
      };

      chatWs.onclose = (event) => {
        console.log('Chat WebSocket closed:', event.code, event.reason);
        isConnectingRef.current = false;
        setIsConnected(false);
        
        // Clear the ref since connection is closed
        if (chatWsRef.current === chatWs) {
          chatWsRef.current = null;
        }
        
        // Don't attempt to reconnect if it was a deliberate close
        if (event.code === 1000 || event.code === 1001) {
          console.log('WebSocket closed normally, not reconnecting');
          return;
        }
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(2000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          
          console.log(`Scheduling reconnection attempt ${reconnectAttemptsRef.current} in ${delay}ms`);
          setConnectionError(`Reconnecting... (${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Executing reconnection attempt ${reconnectAttemptsRef.current}`);
            connectChatWebSocket();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached, giving up');
          setConnectionError('Connection failed. Using offline mode.');
        }
      };

    } catch (error) {
      console.error('Error creating chat WebSocket:', error);
      isConnectingRef.current = false;
      setConnectionError('Failed to connect');
    }
  }, []); // Remove sessionId from dependency array to prevent reconnection loops

  const sendMessage = useCallback((message: string) => {
    // Always add user message to chat first
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      type: 'user',
      timestamp: new Date().toISOString(),
      session_id: sessionId || undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    if (chatWsRef.current && chatWsRef.current.readyState === WebSocket.OPEN) {
      // Set typing indicator
      setIsTyping(true);
      
      // Send message via WebSocket
      chatWsRef.current.send(JSON.stringify({ message }));
    } else {
      // Offline mode - simulate response
      setIsTyping(true);
      setTimeout(() => {
        const offlineResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: "I'm currently offline. Please check your connection and try again, or use the manual task creation button.",
          type: 'agent',
          timestamp: new Date().toISOString(),
          session_id: sessionId || undefined,
        };
        setMessages(prev => [...prev, offlineResponse]);
        setIsTyping(false);
      }, 1000);
    }
  }, [sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Initialize connections with delay to prevent rapid reconnection
  useEffect(() => {
    let mounted = true;
    
    // Add a small delay before initial connection
    const initTimeout = setTimeout(() => {
      if (mounted && !chatWsRef.current) {
        console.log('Initializing WebSocket connection...');
        connectChatWebSocket();
      }
    }, 1000);

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (chatWsRef.current) {
        console.log('Closing WebSocket connection on unmount');
        chatWsRef.current.close(1000, 'Component unmounting');
        chatWsRef.current = null;
      }
    };
  }, []); // Empty dependency array to prevent re-runs

  const retryConnection = useCallback(() => {
    console.log('Manual retry connection requested');
    
    // Reset states
    isConnectingRef.current = false;
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    
    // Close existing connections
    if (chatWsRef.current) {
      console.log('Closing existing connection before retry');
      chatWsRef.current.close(1000, 'Manual retry');
      chatWsRef.current = null;
    }
    
    // Clear any pending reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Attempt new connection after a short delay
    setTimeout(() => {
      console.log('Executing manual retry connection');
      connectChatWebSocket();
    }, 500);
  }, [connectChatWebSocket]);

  return {
    isConnected,
    sessionId,
    messages,
    isTyping,
    connectionError,
    sendMessage,
    clearMessages,
    retryConnection,
  };
};