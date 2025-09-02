'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center space-y-6 p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900">Smart Campus Companion</h1>
        <p className="text-gray-600">Welcome to your AI-powered university assistant</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            Login
          </Link>
          <Link href="/signup" className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
            Sign Up
          </Link>
          <Link href="/dashboard" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}