// src/app/page.tsx
// Smart Campus Companion Landing Page - Designathon Project
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, FormEvent } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface Particle {
  x: number; 
  y: number; 
  size: number; 
  speedX: number; 
  speedY: number; 
  color: string;
  update: () => void; 
  draw: () => void;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useDarkMode();

  const [signupFormData, setSignupFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    university: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedAIEthics, setAcceptedAIEthics] = useState(false);

  // --- Input Handler for Signup Form ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSignupFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  // --- Submit Handler for Signup Form ---
  const handleSignupSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    if (!acceptedPrivacy) {
      setError('Please accept the Privacy Policy to continue.'); 
      return;
    }
    if (!acceptedAIEthics) {
      setError('Please accept the AI Ethics Statement to continue.'); 
      return;
    }
    if (!signupFormData.name || !signupFormData.email || !signupFormData.studentId) {
      setError('Please fill in all required fields.'); 
      return;
    }
    if (!/\S+@\S+\.\S+/.test(signupFormData.email)) {
      setError('Please enter a valid email address.'); 
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Registration data:', signupFormData);
      setIsLoading(false);
      // Reset form
      setSignupFormData({ name: '', email: '', studentId: '', university: '' });
      setAcceptedPrivacy(false);
      setAcceptedAIEthics(false);
      alert('Registration successful! Redirecting to onboarding...');
      // In real app: redirect to onboarding
    }, 2000);
  };

  // --- Particle Animation useEffect ---
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particlesArray: Particle[] = [];
    const numberOfParticles = 80;

    class ParticleClass implements Particle {
      x: number; y: number; size: number; speedX: number; speedY: number; color: string;
      
      constructor() { 
        this.x = Math.random() * canvas.width; 
        this.y = Math.random() * canvas.height; 
        this.size = Math.random() * 3 + 0.5; 
        this.speedX = Math.random() * 0.4 - 0.2; 
        this.speedY = Math.random() * 0.4 - 0.2; 
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.1 + 0.05})`; 
      }
      
      update() { 
        this.x += this.speedX; 
        this.y += this.speedY; 
        if (this.size > 0.1) this.size -= 0.003; 
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1; 
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1; 
      }
      
      draw() { 
        if (!ctx) return; 
        ctx.fillStyle = this.color; 
        ctx.beginPath(); 
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); 
        ctx.fill(); 
      }
    }

    function init() { 
      particlesArray.length = 0; 
      for (let i = 0; i < numberOfParticles; i++) { 
        particlesArray.push(new ParticleClass()); 
      } 
    }

    let animationFrameId: number;
    function animate() { 
      if (!ctx) return; 
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      for (let i = 0; i < particlesArray.length; i++) { 
        particlesArray[i].update(); 
        particlesArray[i].draw(); 
      } 
      animationFrameId = requestAnimationFrame(animate); 
    }

    function handleResize() { 
      canvas.width = window.innerWidth; 
      canvas.height = window.innerHeight; 
      init(); 
    }

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => { 
      window.removeEventListener('resize', handleResize); 
      cancelAnimationFrame(animationFrameId); 
    };
  }, []);

  // --- Intersection Observer useEffect ---
  useEffect(() => {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target instanceof HTMLElement) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.animate-on-scroll');
    hiddenElements.forEach((el) => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        scrollObserver.observe(el);
      }
    });

    return () => {
      hiddenElements.forEach((el) => scrollObserver.unobserve(el));
    };
  }, []);

  return (
    <>
      <Navigation />
      <main className="flex min-h-screen flex-col dark:bg-gray-900 transition-colors duration-300">
        {/* ========================== Hero Section ========================== */}
        <section className="relative overflow-hidden py-20 md:py-32 px-6 min-h-[100vh] flex items-center justify-center">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 dark:from-purple-900 dark:via-purple-800 dark:to-indigo-950"></div>
          <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ opacity: 0.6 }}></canvas>

          {/* Enhanced Hero Floating Background Icons */}
          <AnimatedBackground variant="hero" />

          {/* Hero Content */}
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center">
              {/* Animated logo reveal */}
              <div className="flex justify-center mb-12 animate-fadeIn" style={{ animationDuration: '1.5s' }}>
                <div className="relative inline-block">
                  <div className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 filter drop-shadow-xl" style={{ textShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    Smart Campus
                  </div>
                  <div className="text-4xl md:text-6xl font-bold text-white mt-2 filter drop-shadow-xl" style={{ textShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    Companion
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg blur-lg opacity-20 animate-pulse-slow"></div>
                </div>
              </div>

              {/* Tagline */}
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-10 text-white leading-tight animate-fadeIn" style={{ animationDuration: '2s', animationDelay: '0.5s', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                Your AI-Powered Digital Assistant <br className="hidden md:block" />
                <span className="text-purple-300 inline-block mt-2">for Campus Life Excellence</span>
              </h2>

              <p className="text-lg md:text-xl text-purple-100 max-w-4xl mx-auto leading-relaxed mb-10 animate-fadeIn" style={{ animationDuration: '2s', animationDelay: '0.8s' }}>
                Navigate, engage, and thrive in campus life with intelligent study space finding, personalized academic assistance, smart navigation, and AI-powered wellness support.
              </p>

              {/* Feature Highlights Pills */}
              <div className="flex flex-wrap justify-center gap-4 my-12 animate-fadeIn" style={{ animationDuration: '2s', animationDelay: '1.0s' }}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white">
                  <span className="text-sm font-medium">､AI Chatbot Assistant</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white">
                  <span className="text-sm font-medium">桃 Smart Navigation</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white">
                  <span className="text-sm font-medium">答 Study Space Finder</span>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 text-white">
                  <span className="text-sm font-medium">丁 Wellness Support</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 animate-fadeIn" style={{ animationDuration: '2s', animationDelay: '1.3s' }}>
                <Link href="/onboarding" className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-white text-purple-900 rounded-full overflow-hidden shadow-lg hover:shadow-purple-500/20 transition-all duration-300 transform hover:scale-105">
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <span className="relative group-hover:text-white transition-colors duration-300 ease-out flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Get Started
                  </span>
                </Link>

                <Link href="/login" className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-transparent border-2 border-white text-white rounded-full overflow-hidden hover:bg-white/10 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Sign In
                </Link>

                <Link href="/dashboard" className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full overflow-hidden shadow-lg hover:shadow-purple-500/30 hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Dashboard
                  <span className="absolute top-0 right-0 px-2 py-1 text-xs font-bold uppercase rounded-bl-lg bg-purple-800">Beta</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== Quick Features Overview ========================== */}
        <section className="py-24 px-6 bg-white dark:bg-gray-900 scroll-mt-16 relative" id="features">
          {/* Decorative elements */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-purple-900/5 to-transparent dark:from-purple-900/10"></div>
          <div className="absolute left-0 top-1/4 w-64 h-64 bg-purple-300/10 dark:bg-purple-900/10 rounded-full filter blur-3xl"></div>
          <div className="absolute right-0 bottom-1/4 w-80 h-80 bg-indigo-300/10 dark:bg-indigo-900/10 rounded-full filter blur-3xl"></div>

          {/* Features Floating Background Icons */}
          <AnimatedBackground variant="features" />

          {/* Features Content */}
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-purple-600 dark:from-purple-400 dark:to-purple-300 inline-block">Smart Campus Features</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-600 to-purple-400 mx-auto mb-6 rounded-full"></div>
              <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300 text-xl leading-relaxed">
                Experience the future of campus life with AI-powered assistance designed to make your student journey seamless and successful.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Card 1 - AI Chatbot */}
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-game dark:shadow-md dark:hover:shadow-game-dark transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-800 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -mr-10 -mt-10"></div>
                
                <div className="mb-6 relative z-10 h-20 flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600 rounded-lg flex items-center justify-center text-white transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow z-10">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-all duration-300">AI Chatbot Assistant</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-all duration-300 mb-6 flex-grow">Get instant answers to campus questions with natural language processing and contextual understanding.</p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mt-auto transition-all duration-300">
                    <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>24/7 intelligent support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 - Smart Navigation */}
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-game dark:shadow-md dark:hover:shadow-game-dark transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-800 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -mr-10 -mt-10"></div>
                
                <div className="mb-6 relative z-10 h-20 flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600 rounded-lg flex items-center justify-center text-white transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow z-10">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-all duration-300">Smart Campus Navigation</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-all duration-300 mb-6 flex-grow">AI-powered route optimization with real-time crowd density analysis and accessibility options.</p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mt-auto transition-all duration-300">
                    <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Real-time navigation</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 - Study Space Finder */}
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-game dark:shadow-md dark:hover:shadow-game-dark transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-800 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -mr-10 -mt-10"></div>
                
                <div className="mb-6 relative z-10 h-20 flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600 rounded-lg flex items-center justify-center text-white transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow z-10">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-all duration-300">Intelligent Study Spaces</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-all duration-300 mb-6 flex-grow">ML-powered availability prediction and personalized study space recommendations based on your preferences.</p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mt-auto transition-all duration-300">
                    <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Smart space booking</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 - Wellness Support */}
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-game dark:shadow-md dark:hover:shadow-game-dark transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-purple-100 dark:hover:border-purple-800 relative overflow-hidden flex flex-col h-full">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full -mr-10 -mt-10"></div>
                
                <div className="mb-6 relative z-10 h-20 flex items-start">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-500 dark:from-purple-700 dark:to-purple-600 rounded-lg flex items-center justify-center text-white transition-all duration-500 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 transform group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col flex-grow z-10">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100 transition-all duration-300">AI Wellness Support</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-all duration-300 mb-6 flex-grow">Mood pattern recognition, stress detection, and personalized wellness recommendations for mental health support.</p>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg mt-auto transition-all duration-300">
                    <div className="flex items-center text-sm text-purple-700 dark:text-purple-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span>Mental health focus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== Sign-Up Section ========================== */}
        <section className="py-24 px-6 bg-gradient-to-r from-purple-900 to-indigo-800 text-white relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-dots-pattern opacity-10 mix-blend-overlay"></div>
          <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-purple-900/0 via-purple-900/20 to-transparent filter blur-3xl"></div>
          <div className="absolute right-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-t from-indigo-900/20 to-transparent filter blur-3xl"></div>

          {/* CTA Floating Background Icons */}
          <AnimatedBackground variant="cta" />

          {/* Sign-Up Content & Form */}
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="md:pr-6 animate-on-scroll opacity-0">
                <span className="bg-purple-700/50 text-purple-100 text-sm font-medium px-4 py-1.5 rounded-full mb-5 inline-block">Join the Future</span>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to Transform Your Campus Experience?</h2>
                <p className="text-xl text-purple-100 mb-8 leading-relaxed">Join students who are already experiencing the benefits of AI-powered campus assistance. Sign up today and get personalized help from day one!</p>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-purple-700/50 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Ethical AI Design</h3>
                      <p className="text-purple-100">Transparent algorithms with bias detection and your privacy as the priority.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-700/50 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Human-Centered Approach</h3>
                      <p className="text-purple-100">Technology that adapts to you, not the other way around.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-700/50 rounded-full p-2 mr-4 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Data Privacy First</h3>
                      <p className="text-purple-100">Complete control over your data with transparent usage policies.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sign-Up Form */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white/20 animate-on-scroll opacity-0">
                <h3 className="text-2xl font-bold mb-6 text-center">Get Started For Free</h3>
                <form className="space-y-4" onSubmit={handleSignupSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      required 
                      value={signupFormData.name} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      required 
                      value={signupFormData.email} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="studentId" className="block text-sm font-medium mb-1">Student ID</label>
                    <input 
                      type="text" 
                      id="studentId" 
                      name="studentId" 
                      required 
                      value={signupFormData.studentId} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Your student ID"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium mb-1">University/College</label>
                    <input 
                      type="text" 
                      id="university" 
                      name="university" 
                      value={signupFormData.university} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      placeholder="Your institution (optional)"
                    />
                  </div>

                  {/* Privacy Policy Acceptance */}
                  <div className="flex items-start pt-2">
                    <div className="flex items-center h-5">
                      <input 
                        id="privacy" 
                        type="checkbox" 
                        checked={acceptedPrivacy}
                        onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="privacy" className="text-white/90">
                        I accept the <Link href="/privacy" className="text-purple-200 hover:text-purple-100 underline">Privacy Policy</Link>
                      </label>
                    </div>
                  </div>

                  {/* AI Ethics Statement Acceptance */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input 
                        id="aiethics" 
                        type="checkbox" 
                        checked={acceptedAIEthics}
                        onChange={(e) => setAcceptedAIEthics(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="aiethics" className="text-white/90">
                        I acknowledge the <Link href="/ai-ethics" className="text-purple-200 hover:text-purple-100 underline">AI Ethics Statement</Link>
                      </label>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
                      <p className="text-sm text-red-200">{error}</p>
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isLoading} 
                      className={`w-full bg-white text-purple-900 font-medium py-3 px-4 rounded-lg hover:bg-purple-50 transition-colors duration-300 shadow-lg hover:shadow-white/20 flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {isLoading ? (
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* ========================== Footer ========================== */}
        <footer className="bg-gray-900 dark:bg-gray-950 text-white py-24 px-6 relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-dots-pattern opacity-5 mix-blend-overlay"></div>
          <div className="absolute left-0 bottom-0 w-96 h-96 bg-purple-900/30 rounded-full filter blur-3xl opacity-50"></div>
          <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-900/20 rounded-full filter blur-3xl opacity-50"></div>

          {/* Footer Floating Background Icons */}
          <AnimatedBackground variant="footer" />

          {/* Footer Content */}
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
              {/* Column 1 */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-6">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200">
                    Smart Campus<br />
                    <span className="text-white">Companion</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-6">Your AI-powered digital assistant for campus life excellence through ethical AI implementation.</p>
                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="inline-block bg-purple-800/20 text-purple-400 rounded-full px-3 py-1 text-sm font-medium">#SmartCampus</span>
                  <span className="inline-block bg-purple-800/20 text-purple-400 rounded-full px-3 py-1 text-sm font-medium">#AIAssistant</span>
                </div>
                <div className="flex space-x-5">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.56c-.88.39-1.83.65-2.83.77 1.01-.6 1.79-1.56 2.16-2.71-.94.56-1.99.97-3.1 1.18-.89-.95-2.17-1.54-3.59-1.54-2.71 0-4.9 2.2-4.9 4.9 0 .38.04.76.13 1.12-4.08-.21-7.7-2.15-10.13-5.14-.42.72-.66 1.56-.66 2.45 0 1.7.87 3.2 2.19 4.08-.81-.03-1.57-.25-2.24-.62v.06c0 2.38 1.69 4.35 3.94 4.8-.41.11-.85.17-1.3.17-.32 0-.63-.03-.93-.09.63 1.95 2.44 3.37 4.59 3.41-1.68 1.32-3.8 2.1-6.1 2.1-.4 0-.79-.02-1.17-.07 2.18 1.39 4.78 2.2 7.57 2.2 9.08 0 14.05-7.51 14.05-14.05 0-.21 0-.42-.01-.63.97-.7 1.81-1.58 2.47-2.56z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Column 2 */}
              <div>
                <h3 className="text-lg font-medium mb-5 text-white uppercase tracking-wider">Features</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/chatbot" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      AI Chatbot
                    </Link>
                  </li>
                  <li>
                    <Link href="/navigation" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Campus Navigation
                    </Link>
                  </li>
                  <li>
                    <Link href="/study-spaces" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Study Spaces
                    </Link>
                  </li>
                  <li>
                    <Link href="/wellness" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Wellness Support
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3 */}
              <div>
                <h3 className="text-lg font-medium mb-5 text-white uppercase tracking-wider">Resources</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/help" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Help & Support
                    </Link>
                  </li>
                  <li>
                    <Link href="/ai-ethics" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      AI Ethics
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      Privacy Policy
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4 */}
              <div>
                <h3 className="text-lg font-medium mb-5 text-white uppercase tracking-wider">Contact</h3>
                <ul className="space-y-4">
                  <li className="flex items-start text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>support@smartcampus.edu</span>
                  </li>
                  <li className="flex items-start text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>University Campus</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Copyright & Bottom Row */}
            <div className="pt-12 border-t border-gray-800 text-center text-gray-400">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p>ﾂｩ {new Date().getFullYear()} Smart Campus Companion - Designathon Project. All rights reserved.</p>
                <div className="mt-4 md:mt-0">
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 mx-3">Terms</Link>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 mx-3">Privacy</Link>
                  <Link href="/ai-ethics" className="text-sm text-gray-400 hover:text-white transition-colors duration-300 mx-3">AI Ethics</Link>
                </div>
              </div>
              <p className="mt-6 text-sm">
                Designed for Designathon with ethical AI principles and human-centered design for student success.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )