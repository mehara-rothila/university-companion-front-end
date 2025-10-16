'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AnimatedBackground from '../../components/AnimatedBackground'
import { useDarkMode } from '../context/DarkModeContext'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { isDarkMode } = useDarkMode()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const success = await login(formData.usernameOrEmail, formData.password)

      if (success) {
        router.push('/dashboard');
      } else {
        setError('Invalid username/email or password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="glass-premium-card rounded-3xl p-6 sm:p-8 w-full max-w-md animate-glass-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Sign in to your Smart Campus account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username or Email
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your username or email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium animated-link">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 animated-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}