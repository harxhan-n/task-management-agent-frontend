'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import Layout to avoid SSR issues with WebSocket connections
const Layout = dynamic(() => import('@/components/Layout'), {
  ssr: false,
  loading: () => (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading TaskFlow AI...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing TaskFlow AI...</p>
        </div>
      </div>
    }>
      <Layout />
    </Suspense>
  );
}