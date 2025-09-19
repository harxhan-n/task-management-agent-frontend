'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Wifi, WifiOff, Bot, Sparkles } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { ChatPanel } from '@/components/ChatPanel';
import TaskTable from '@/components/TaskTable';
import IntroScreen from '@/components/IntroScreen';
import { useWebSocket } from '@/hooks/useWebSocket';

const Layout: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useAppStore();
  const [showMainApp, setShowMainApp] = useState(false);
  
  const {
    isConnected,
    messages,
    isTyping,
    connectionError,
    sendMessage,
    retryConnection,
  } = useWebSocket();

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleMeetAgent = () => {
    setShowMainApp(true);
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                TaskFlow AI
              </h1>
            </motion.div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                isConnected 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {!showMainApp ? (
          /* Intro Screen */
          <IntroScreen onMeetAgent={handleMeetAgent} isConnected={isConnected} />
        ) : (
          /* Main App Layout */
          <>
            {/* Desktop Layout: Tasks Left, Chat Right */}
            <div className="hidden lg:flex w-full">
              {/* Task Table - Left Side */}
              <div className="w-1/2 flex flex-col">
                <TaskTable />
              </div>

              {/* Chat Panel - Right Side */}
              <div className="w-1/2 flex flex-col">
                <ChatPanel
                  messages={messages}
                  onSendMessage={sendMessage}
                  isConnected={isConnected}
                  isTyping={isTyping}
                  connectionError={connectionError}
                  onRetryConnection={retryConnection}
                />
              </div>
            </div>

            {/* Mobile/Tablet Layout: Stacked with Tabs */}
            <div className="lg:hidden w-full flex flex-col">
              <MobileTabLayout
                messages={messages}
                isConnected={isConnected}
                isTyping={isTyping}
                connectionError={connectionError}
                onSendMessage={sendMessage}
                onRetryConnection={retryConnection}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface MobileTabLayoutProps {
  messages: any[];
  isConnected: boolean;
  isTyping: boolean;
  connectionError?: string | null;
  onSendMessage: (message: string) => void;
  onRetryConnection?: () => void;
}

const MobileTabLayout: React.FC<MobileTabLayoutProps> = ({
  messages,
  isConnected,
  isTyping,
  connectionError,
  onSendMessage,
  onRetryConnection,
}) => {
  const [activeTab, setActiveTab] = React.useState<'chat' | 'tasks'>('tasks');

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
            activeTab === 'tasks'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Tasks
        </button>
        
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 text-sm font-medium text-center border-b-2 transition-colors duration-200 ${
            activeTab === 'chat'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Chat
          {isTyping && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
              •••
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === 'tasks' ? (
            <TaskTable />
          ) : (
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isConnected={isConnected}
              isTyping={isTyping}
              connectionError={connectionError}
              onRetryConnection={onRetryConnection}
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Layout;