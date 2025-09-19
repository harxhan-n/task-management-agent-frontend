'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Task } from '@/types';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'wss://task-management-agent-backend-production.up.railway.app';

export interface TaskWebSocketMessage {
  type: 'task_update' | 'connection' | 'ping' | 'error';
  data: {
    tasks?: Task[];
    message?: string;
  };
}

export const useTaskWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [tasks, setTasks] = useState<Task[] | undefined>(undefined);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const mountedRef = useRef(true);
  const maxReconnectAttempts = 5;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Component unmounted');
      wsRef.current = null;
    }
    
    isConnectingRef.current = false;
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);

  const connectTaskWebSocket = useCallback(() => {
    if (!mountedRef.current || isConnectingRef.current) {
      return;
    }
    
    if (wsRef.current && 
        (wsRef.current.readyState === WebSocket.CONNECTING || 
         wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    try {
      isConnectingRef.current = true;
      const wsUrl = `${WS_BASE_URL}/api/chat/ws/tasks`;
      console.log('Connecting to task WebSocket:', wsUrl);
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        
        console.log('Task WebSocket connected successfully');
        isConnectingRef.current = false;
        setIsConnected(true);
        setConnectionError(null);
        setIsReconnecting(false);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const message: TaskWebSocketMessage = JSON.parse(event.data);
          console.log('Received task message:', message);
          
          switch (message.type) {
            case 'task_update':
              console.log('Task update received:', message.data.tasks);
              if (message.data.tasks && Array.isArray(message.data.tasks)) {
                setTasks(message.data.tasks);
                console.log('Tasks state updated with:', message.data.tasks);
              } else {
                console.warn('Received task_update with invalid tasks data:', message.data);
              }
              break;
            case 'connection':
              console.log('Task WebSocket connection confirmed:', message.data.message);
              break;
            case 'ping':
              // Respond to ping with pong
              if (ws.readyState === WebSocket.OPEN) {
                ws.send('pong');
              }
              break;
            case 'error':
              console.error('Task WebSocket error:', message.data.message);
              setConnectionError(message.data.message || 'Unknown error');
              break;
            default:
              console.warn('Unknown WebSocket message type:', message.type);
          }
        } catch (error) {
          console.error('Failed to parse task WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log('Task WebSocket closed:', event.code, event.reason);
        isConnectingRef.current = false;
        setIsConnected(false);
        
        // Only attempt reconnection if we haven't exceeded max attempts
        if (reconnectAttemptsRef.current < maxReconnectAttempts && event.code !== 1000) {
          setIsReconnecting(true);
          reconnectAttemptsRef.current++;
          
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 10000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectTaskWebSocket();
            }
          }, delay);
        } else {
          setIsReconnecting(false);
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            setConnectionError('Max reconnection attempts reached');
          }
        }
      };

      ws.onerror = (error) => {
        if (!mountedRef.current) return;
        
        console.error('Task WebSocket error:', error);
        isConnectingRef.current = false;
        setConnectionError('Connection error occurred');
      };

    } catch (error) {
      console.error('Failed to create task WebSocket connection:', error);
      isConnectingRef.current = false;
      setConnectionError('Failed to create connection');
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send('ping');
      return true;
    }
    return false;
  }, []);

  const disconnect = useCallback(() => {
    mountedRef.current = false;
    cleanup();
  }, [cleanup]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    setConnectionError(null);
    connectTaskWebSocket();
  }, [connectTaskWebSocket]);

  useEffect(() => {
    mountedRef.current = true;
    connectTaskWebSocket();

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [connectTaskWebSocket, cleanup]);

  return {
    isConnected,
    tasks,
    connectionError,
    isReconnecting,
    sendPing,
    disconnect,
    reconnect
  };
};