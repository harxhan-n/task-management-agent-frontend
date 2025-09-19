'use client';

import React, { useState, useEffect, useMemo, HTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  X,
  Calendar,
  Flag,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types';
import { apiClient } from '@/lib/api';
import { format, isAfter, parseISO } from 'date-fns';
import { useTaskWebSocket } from '@/hooks/useTaskWebSocket';

const priorityColors = {
  low: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800',
  high: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const statusColors = {
  pending: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
};

const TaskTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<{
    status: 'all' | 'pending' | 'in_progress' | 'done';
    priority: 'all' | 'low' | 'medium' | 'high';
  }>({ status: 'all', priority: 'all' });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Use WebSocket for real-time task updates
  const { 
    isConnected, 
    tasks: webSocketTasks, 
    connectionError, 
    isReconnecting,
    reconnect 
  } = useTaskWebSocket();

  const [createForm, setCreateForm] = useState<TaskCreate>({
    title: '',
    description: '',
    priority: 'medium',
    due_date: undefined,
  });

  // Load initial tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        console.log('Loading initial tasks...');
        setIsLoading(true);
        
        // First, test API connectivity
        try {
          const health = await apiClient.healthCheck();
          console.log('Backend health check passed:', health);
        } catch (healthError) {
          console.error('Backend health check failed:', healthError);
          console.error('This indicates a connection or CORS issue');
        }
        
        const tasks = await apiClient.getTasks();
        console.log('Initial tasks loaded from API:', tasks);
        
        // Only set tasks if we haven't received WebSocket data yet
        if (!hasInitialLoad) {
          setLocalTasks(tasks);
          setHasInitialLoad(true);
        }
      } catch (error) {
        console.error('Failed to load tasks:', error);
        console.error('Full error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          name: error instanceof Error ? error.name : 'Unknown'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [hasInitialLoad]);

  // Update local tasks when WebSocket receives updates
  useEffect(() => {
    console.log('WebSocket tasks changed:', webSocketTasks);
    if (webSocketTasks !== undefined && Array.isArray(webSocketTasks)) {
      console.log('Updating local tasks from WebSocket:', webSocketTasks);
      setLocalTasks(webSocketTasks);
      setHasInitialLoad(true); // Mark that we have initial data
      setIsLoading(false);
    }
  }, [webSocketTasks]);

  // Function to refresh tasks after manual operations
  const refreshTasks = async () => {
    try {
      const tasks = await apiClient.getTasks();
      setLocalTasks(tasks);
      console.log('Tasks refreshed after manual operation:', tasks);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
    }
  };

  const filteredTasks = useMemo(() => {
    return localTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      
      const matchesStatus = filter.status === 'all' || task.status === filter.status;
      const matchesPriority = filter.priority === 'all' || task.priority === filter.priority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [localTasks, searchTerm, filter]);

  const handleCreateTask = async () => {
    try {
      const taskData = {
        ...createForm,
        due_date: createForm.due_date ? new Date(createForm.due_date).toISOString() : undefined,
      };
      
      await apiClient.createTask(taskData);
      
      setCreateForm({
        title: '',
        description: '',
        priority: 'medium',
        due_date: undefined,
      });
      setShowCreateForm(false);
      
      // Refresh tasks immediately after creation
      await refreshTasks();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleUpdateTask = async (taskId: number, updates: TaskUpdate) => {
    try {
      await apiClient.updateTask(taskId, updates);
      setEditingTask(null);
      // Refresh tasks immediately after update
      await refreshTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await apiClient.deleteTask(taskId);
        // Refresh tasks immediately after deletion
        await refreshTasks();
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  const handleStatusToggle = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await handleUpdateTask(task.id, { status: newStatus });
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <Flag className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-primary-500" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h2>
          
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <Wifi className="w-4 h-4" />
                <span className="ml-1 text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600 dark:text-red-400">
                <WifiOff className="w-4 h-4" />
                <span className="ml-1 text-sm">
                  {isReconnecting ? 'Reconnecting...' : 'Offline'}
                </span>
                {connectionError && !isReconnecting && (
                  <button
                    onClick={reconnect}
                    className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Retry connection"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={filter.priority}
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                     transition-colors duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Task
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {filteredTasks.map((task) => {
                const isOverdue = task.due_date && task.status !== 'done' 
                  ? isAfter(new Date(), parseISO(task.due_date))
                  : false;

                return (
                  <motion.tr
                    key={task.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                        #{task.id}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleStatusToggle(task)}
                        className="flex items-center space-x-2 hover:scale-105 transition-transform duration-200"
                      >
                        <div className={`flex items-center justify-center ${statusColors[task.status]}`}>
                          {getStatusIcon(task.status)}
                        </div>
                      </button>
                    </td>

                    {/* Task */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                        {getPriorityIcon(task.priority)}
                        <span className="ml-1 capitalize">{task.priority}</span>
                      </span>
                    </td>

                    {/* Due Date */}
                    <td className="px-4 py-3">
                      {task.due_date ? (
                        <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {format(parseISO(task.due_date), 'MMM d, yyyy')}
                          </span>
                          {isOverdue && <AlertCircle className="w-4 h-4" />}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No due date</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1 text-gray-400 hover:text-primary-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                          title="Edit task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors duration-200"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {localTasks.length === 0 ? 'No tasks yet. Create your first task!' : 'No tasks match your search criteria.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create New Task</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={createForm.priority}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={createForm.due_date || ''}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, due_date: e.target.value || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleCreateTask}
                    disabled={!createForm.title.trim()}
                    className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Create Task
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 
                             py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 
                             transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setEditingTask(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Task</h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={editingTask.due_date ? format(parseISO(editingTask.due_date), 'yyyy-MM-dd') : ''}
                      onChange={(e) => setEditingTask(prev => prev ? {
                        ...prev,
                        due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      } : null)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      if (editingTask) {
                        handleUpdateTask(editingTask.id, {
                          title: editingTask.title,
                          description: editingTask.description || undefined,
                          priority: editingTask.priority,
                          due_date: editingTask.due_date || undefined,
                        });
                      }
                    }}
                    className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-600 
                             transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 
                             py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 
                             transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskTable;