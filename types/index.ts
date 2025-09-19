export interface Task {
  id: number;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'done';
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'done';
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'done';
  due_date?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  message: string;
  type: 'user' | 'agent';
  timestamp: string;
  session_id?: string;
}

export interface WebSocketMessage {
  type: 'connection' | 'chat_response' | 'task_update' | 'error' | 'ping';
  data: {
    message?: string;
    response?: string;
    tasks?: Task[];
    task_updates?: Task[];
    session_id?: string;
    features?: string[];
  };
}

export interface TaskFilter {
  status?: 'pending' | 'in_progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  search?: string;
  due_before?: string;
  due_after?: string;
}

export interface AppState {
  isDarkMode: boolean;
  isConnected: boolean;
  sessionId?: string;
  isTyping: boolean;
}