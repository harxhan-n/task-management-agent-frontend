'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, CheckCircle2, Clock, Filter, Moon, Wifi } from 'lucide-react';

export const DemoMessage: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800"
  >
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="text-white" size={20} />
        </div>
      </div>
      
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Welcome to Task Assistant! 🎉
        </h3>
        
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p>This app demonstrates a complete task management system with AI chat integration. Here&apos;s what you can do:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <span>Chat with AI to create tasks</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-blue-500 flex-shrink-0" />
              <span>Real-time task updates</span>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-purple-500 flex-shrink-0" />
              <span>Advanced filtering & search</span>
            </div>
            <div className="flex items-center space-x-2">
              <Moon size={16} className="text-indigo-500 flex-shrink-0" />
              <span>Dark/light mode toggle</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
            <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">Try these commands:</p>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• &quot;Create a high priority task to buy groceries tomorrow&quot;</li>
              <li>• &quot;Add a task to finish the project report by Friday&quot;</li>
              <li>• &quot;Remind me to call mom next week&quot;</li>
            </ul>
          </div>
          
          <div className="flex items-center space-x-2 mt-3 text-xs">
            <Wifi size={14} className="text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              Note: If disconnected, you can still use manual task creation via the &quot;+&quot; button
            </span>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);