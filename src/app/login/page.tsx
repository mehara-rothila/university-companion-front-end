'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AnimatedBackground from '../../components/AnimatedBackground'
import Navigation from '../../components/Navigation'
import { useDarkMode } from '../context/DarkModeContext'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'

function LoginForm() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isDarkMode } = useDarkMode()
  const { login, loginWithGoogle, isOnline } = useAuth()
  const { t } = useTranslation()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'session_expired') {
        setError(t('auth.login.sessionExpired') || 'Your session has expired. Please log in again.')
      } else {
        setError(errorParam)
      }
    }
  }, [searchParams, t])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent double submission
    if (isLoading) return;

    // Check if online
    if (!isOnline) {
      setError(t('common.offlineError') || 'You are offline. Please check your internet connection.');
      return;
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await login(formData.usernameOrEmail, formData.password)

      if (result === true) {
        // Redirect to the page they were trying to access, or dashboard
        const from = searchParams.get('from') || '/dashboard';
        router.push(from);
      } else if (typeof result === 'object' && result.error === 'EMAIL_NOT_VERIFIED') {
        // Redirect to email verification page
        router.push(`/verify-email?email=${encodeURIComponent(result.email || formData.usernameOrEmail)}`);
      } else {
        setError(t('auth.login.errorInvalidCredentials'));
      }
    } catch (err) {
      setError(t('auth.login.errorConnection'));
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

  const handleGoogleLogin = async () => {
    // Prevent double submission
    if (isLoading) return;

    // Check if online
    if (!isOnline) {
      setError(t('common.offlineError') || 'You are offline. Please check your internet connection.');
      return;
    }

    try {
      setIsLoading(true)
      setError('')
      await loginWithGoogle()
    } catch (err) {
      setError(t('auth.login.errorGoogleLogin'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <AnimatedBackground />
      <Navigation />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="glass-premium-card rounded-3xl p-6 sm:p-8 w-full max-w-md animate-glass-fade-in">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">{t('auth.login.title')}</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{t('auth.login.subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('auth.login.usernameOrEmail')}
              </label>
              <input
                type="text"
                id="usernameOrEmail"
                name="usernameOrEmail"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder={t('auth.login.usernamePlaceholder')}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('auth.login.password')}
                </label>
                <Link href="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 animated-link">
                  {t('auth.login.forgotPassword')}
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="glass-input w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder={t('auth.login.passwordPlaceholder')}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? t('auth.login.signingIn') : t('auth.login.signIn')}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">{t('auth.login.orContinueWith')}</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-6 w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('auth.login.continueWithGoogle')}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              {t('auth.login.noAccount')}{' '}
              <Link href="/signup" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium animated-link">
                {t('auth.login.signUpLink')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingFallback() {
  const { t } = useTranslation()
  return <div>{t('auth.login.loading')}</div>
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  )
}