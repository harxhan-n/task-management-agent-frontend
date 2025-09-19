import { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://task-management-agent-backend-production.up.railway.app';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'omit',
      ...options,
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`API request failed: ${response.status} ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`API response received:`, data);
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('CORS')) {
        console.error('CORS error detected. Check backend CORS configuration.');
      }
      throw error;
    }
  }

  // Task methods
  async getTasks(skip = 0, limit = 100): Promise<Task[]> {
    return this.request<Task[]>(`/api/tasks/?skip=${skip}&limit=${limit}`);
  }

  async getTasksFiltered(filter: TaskFilter): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filter.status) params.append('status', filter.status);
    if (filter.priority) params.append('priority', filter.priority);
    if (filter.due_before) params.append('due_before', filter.due_before);
    if (filter.due_after) params.append('due_after', filter.due_after);

    return this.request<Task[]>(`/api/tasks/filter?${params.toString()}`);
  }

  async createTask(task: TaskCreate): Promise<Task> {
    return this.request<Task>('/api/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  async updateTask(id: number, task: TaskUpdate): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  }

  async deleteTask(id: number): Promise<void> {
    await this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async getTask(id: number): Promise<Task> {
    return this.request<Task>(`/api/tasks/${id}`);
  }

  // Chat methods
  async sendChatMessage(message: string): Promise<any> {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // Health check
  async healthCheck(): Promise<any> {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient();