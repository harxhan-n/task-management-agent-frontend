'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckSquare, Zap, ArrowRight, Bot, Sparkles, Brain } from 'lucide-react';

interface IntroScreenProps {
  onMeetAgent: () => void;
  isConnected: boolean;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onMeetAgent, isConnected }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl text-center"
      >
        {/* Welcome Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to TaskFlow AI! 
            </span>
            <span className="inline-block ml-2">🚀</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Meet <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Flux</span>, your intelligent AI assistant ready to revolutionize how you manage tasks. 
            Create, organize, and track your work naturally through conversation.
          </p>
          {/* <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-4 h-4 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Powered by Advanced AI
            </span>
          </div> */}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 dark:bg-gradient-to-br dark:from-blue-900/40 dark:to-blue-800/40 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">AI-Powered Tasks</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Chat naturally to create and manage tasks</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 dark:bg-gradient-to-br dark:from-purple-900/40 dark:to-purple-800/40 rounded-lg flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Real-time Sync</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Watch your tasks update instantly</p>
          </div>

          <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 dark:bg-gradient-to-br dark:from-pink-900/40 dark:to-pink-800/40 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Smart Features</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Advanced filtering and intelligent organization</p>
          </div>
        </motion.div>

        {/* Try Commands */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 text-left"
        >
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">Try these commands:</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center">
              <span className="text-primary-500 mr-2">•</span>
              "Create a high priority task to buy groceries tomorrow"
            </div>
            <div className="flex items-center">
              <span className="text-primary-500 mr-2">•</span>
              "Add a task to finish the project report by Friday"
            </div>
            <div className="flex items-center">
              <span className="text-primary-500 mr-2">•</span>
              "Remind me to call mom next week"
            </div>
          </div>
        </motion.div> */}

        {/* Meet Agent Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMeetAgent}
            disabled={!isConnected}
            className={`
              inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200
              ${isConnected 
                ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:shadow-purple-500/25' 
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isConnected ? (
              <>
                <Bot className="mr-2 w-5 h-5" />
                Meet Flux, Your Task Agent
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            ) : (
              'Connecting...'
            )}
          </motion.button>
          
          {!isConnected && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              💡 Note: If disconnected, you can still use manual task creation via the "+" button
            </p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default IntroScreen;