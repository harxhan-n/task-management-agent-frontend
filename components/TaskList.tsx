'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Flag
} from 'lucide-react';
import { Task, TaskCreate, TaskUpdate, TaskFilter } from '@/types';
import { apiClient } from '@/lib/api';
import { format, isAfter, isBefore, parseISO } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (tasks: Task[]) => void;
}

interface TaskItemProps {
  task: Task;
  onUpdate: (taskId: number, updates: TaskUpdate) => Promise<void>;
  onDelete: (taskId: number) => Promise<void>;
}

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

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || '',
    priority: task.priority,
    due_date: task.due_date ? format(parseISO(task.due_date), 'yyyy-MM-dd') : '',
  });

  const handleStatusToggle = async () => {
    const newStatus = task.status === 'done' ? 'pending' : 'done';
    await onUpdate(task.id, { status: newStatus });
  };

  const handleEdit = async () => {
    const updates: TaskUpdate = {
      title: editForm.title,
      description: editForm.description || undefined,
      priority: editForm.priority as 'low' | 'medium' | 'high',
      due_date: editForm.due_date ? new Date(editForm.due_date).toISOString() : undefined,
    };
    
    await onUpdate(task.id, updates);
    setIsEditing(false);
  };

  const isOverdue = task.due_date && task.status !== 'done' 
    ? isAfter(new Date(), parseISO(task.due_date))
    : false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow duration-200"
    >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Task title"
          />
          
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
            placeholder="Task description"
            rows={2}
          />
          
          <div className="flex space-x-2">
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            
            <input
              type="date"
              value={editForm.due_date}
              onChange={(e) => setEditForm(prev => ({ ...prev, due_date: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleEdit}
              className="px-3 py-1 bg-primary-500 text-white rounded-md hover:bg-primary-600 text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start space-x-3">
          {/* Status Checkbox */}
          <button
            onClick={handleStatusToggle}
            className="flex-shrink-0 mt-1 hover:scale-110 transition-transform duration-200"
          >
            {task.status === 'done' ? (
              <CheckCircle2 className="text-green-500" size={20} />
            ) : (
              <Circle className="text-gray-400 hover:text-primary-500" size={20} />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className={`font-medium text-gray-900 dark:text-gray-100 ${
                task.status === 'done' ? 'line-through opacity-60' : ''
              }`}>
                {task.title}
              </h3>
              
              <div className="flex items-center space-x-1 ml-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsEditing(true)}
                  className="p-1 text-gray-400 hover:text-primary-500 rounded"
                >
                  <Edit3 size={14} />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <Trash2 size={14} />
                </motion.button>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Tags and Meta */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                {/* Priority Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                  priorityColors[task.priority]
                }`}>
                  <Flag size={10} className="mr-1" />
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>

                {/* Status Badge */}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  statusColors[task.status]
                }`}>
                  {task.status === 'done' ? (
                    <CheckCircle2 size={10} className="mr-1" />
                  ) : task.status === 'in_progress' ? (
                    <Clock size={10} className="mr-1" />
                  ) : (
                    <Circle size={10} className="mr-1" />
                  )}
                  {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                </span>
              </div>

              {/* Due Date */}
              {task.due_date && (
                <div className={`flex items-center text-xs ${
                  isOverdue 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {isOverdue && <AlertCircle size={12} className="mr-1" />}
                  <Calendar size={12} className="mr-1" />
                  {format(parseISO(task.due_date), 'MMM dd, yyyy')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  const [filter, setFilter] = useState<TaskFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState<TaskCreate>({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search filter
      const matchesSearch = !searchTerm || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus = !filter.status || task.status === filter.status;

      // Priority filter
      const matchesPriority = !filter.priority || task.priority === filter.priority;

      // Date filters
      const matchesDateRange = (!filter.due_before || !task.due_date || 
        isBefore(parseISO(task.due_date), parseISO(filter.due_before))) &&
        (!filter.due_after || !task.due_date || 
        isAfter(parseISO(task.due_date), parseISO(filter.due_after)));

      return matchesSearch && matchesStatus && matchesPriority && matchesDateRange;
    });
  }, [tasks, searchTerm, filter]);

  const handleTaskUpdate = async (taskId: number, updates: TaskUpdate) => {
    try {
      const updatedTask = await apiClient.updateTask(taskId, updates);
      const newTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      onTaskUpdate(newTasks);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    try {
      await apiClient.deleteTask(taskId);
      const newTasks = tasks.filter(task => task.id !== taskId);
      onTaskUpdate(newTasks);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;

    try {
      const createdTask = await apiClient.createTask(newTask);
      onTaskUpdate([...tasks, createdTask]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        status: 'pending',
      });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const clearFilters = () => {
    setFilter({});
    setSearchTerm('');
  };

  const hasActiveFilters = Object.keys(filter).length > 0 || searchTerm;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Tasks ({filteredTasks.length})
          </h2>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
              }`}
            >
              <Filter size={18} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-200"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Add Task</span>
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
                     placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              <select
                value={filter.status || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value as any || undefined }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={filter.priority || ''}
                onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value as any || undefined }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>

              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <X size={16} />
                <span>Clear</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Task Creation */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-3">
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Task title"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
              />
              
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task description (optional)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
              />

              <div className="flex items-center justify-between">
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>

                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateTask}
                    disabled={!newTask.title.trim()}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600
                             disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <CheckCircle2 size={48} className="mx-auto" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </p>
              <p className="text-gray-400 dark:text-gray-600 text-sm mt-2">
                {hasActiveFilters 
                  ? 'Try adjusting your search or filters' 
                  : 'Create your first task or ask the assistant to help you!'
                }
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};