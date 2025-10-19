// Quick test component for Athena AI Assistant
'use client';

import { useState } from 'react';
import { athenaService } from '@/services/athenaService';

export default function AthenaTestButton() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<string>('');

  const testAthena = async () => {
    setTesting(true);
    setResult('Testing Athena...');
    
    try {
      const response = await athenaService.processMessage('Hello Athena, can you help me with university services?');
      setResult(`Success! Athena responded: ${response.content.substring(0, 100)}...`);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
      <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
        🤖 Athena AI Test
      </h3>
      <button
        onClick={testAthena}
        disabled={testing}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 mb-2"
      >
        {testing ? 'Testing...' : 'Test Athena Connection'}
      </button>
      {result && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
          {result}
        </p>
      )}
    </div>
  );
}