// app/components/AnimatedBackground.tsx
'use client'

import { useState, useEffect } from 'react'
import { useDarkMode } from '@/app/context/DarkModeContext'

// Seeded random function for deterministic values
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface AnimatedBackgroundProps {
  variant?: 'dashboard' | 'default';
}

export default function AnimatedBackground({ variant = 'default' }: AnimatedBackgroundProps) {
  const [isClient, setIsClient] = useState(false)
  const { isDarkMode } = useDarkMode()

  // Use variant for potential future background variations
  const backgroundType = variant === 'dashboard' ? 'enhanced' : 'standard'

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Generate deterministic particles using seeded random with better distribution - INCREASED for homepage
  const particles = [...Array(300)].map((_, i) => {
    // Use different seeds to get better spread across the screen
    const leftSeed = i * 1337 + 42;
    const topSeed = i * 1789 + 156;
    
    return {
      id: i,
      left: seededRandom(leftSeed) * 100,
      top: seededRandom(topSeed) * 100,
      animationDelay: seededRandom(i * 1002) * 12,
      animationDuration: 6 + seededRandom(i * 1003) * 10,
      colorIndex: i % 5,
      animationClass: `animate-particle-drift-${(i % 4) + 1}`
    }
  })

  // Adaptive colors based on dark mode
  const colors = isDarkMode ? [
    'rgba(99, 102, 241, 0.4)', // indigo
    'rgba(34, 197, 94, 0.4)',  // green
    'rgba(168, 85, 247, 0.4)', // purple
    'rgba(251, 191, 36, 0.4)', // amber
    'rgba(236, 72, 153, 0.4)'  // pink
  ] : [
    'rgba(59, 130, 246, 0.7)', 
    'rgba(16, 185, 129, 0.7)', 
    'rgba(168, 85, 247, 0.7)', 
    'rgba(245, 158, 11, 0.7)', 
    'rgba(236, 72, 153, 0.7)'
  ]

  // Adaptive symbol colors
  const getSymbolColors = () => {
    if (isDarkMode) {
      return [
        'text-purple-400/60',
        'text-blue-400/60', 
        'text-green-400/60',
        'text-red-400/60',
        'text-indigo-400/60',
        'text-teal-400/60',
        'text-pink-400/60',
        'text-fuchsia-400/60',
        'text-emerald-400/60',
        'text-cyan-400/60',
        'text-rose-400/60',
        'text-amber-400/60',
        'text-sky-400/60',
        'text-lime-400/60',
        'text-orange-400/60',
        'text-violet-400/60'
      ]
    } else {
      return [
        'text-purple-500/75',
        'text-blue-500/70', 
        'text-green-500/75',
        'text-red-500/65',
        'text-indigo-500/70',
        'text-teal-500/75',
        'text-pink-500/65',
        'text-fuchsia-500/70',
        'text-emerald-500/65',
        'text-cyan-500/70',
        'text-rose-500/65',
        'text-amber-500/70',
        'text-sky-500/60',
        'text-lime-500/55',
        'text-orange-500/50',
        'text-violet-500/60'
      ]
    }
  }

  // Adaptive equation colors
  const getEquationColors = () => {
    if (isDarkMode) {
      return [
        'text-blue-300/50',
        'text-emerald-300/50',
        'text-pink-300/50',
        'text-purple-300/50',
        'text-cyan-300/45',
        'text-orange-300/50'
      ]
    } else {
      return [
        'text-blue-600/70',
        'text-emerald-600/70',
        'text-pink-600/70',
        'text-purple-600/70',
        'text-cyan-600/65',
        'text-orange-600/70'
      ]
    }
  }

  // Adaptive glass orb colors - Keep glassy effect in dark mode!
  const getGlassOrbGradients = () => {
    if (isDarkMode) {
      return [
        'bg-gradient-to-br from-blue-100/20 to-cyan-100/15',
        'bg-gradient-to-br from-purple-100/18 to-pink-100/12',
        'bg-gradient-to-br from-emerald-100/18 to-teal-100/12',
        'bg-gradient-to-br from-rose-100/15 to-pink-100/10',
        'bg-gradient-to-br from-indigo-100/16 to-blue-100/11'
      ]
    } else {
      return [
        'bg-gradient-to-br from-blue-200/30 to-cyan-200/20',
        'bg-gradient-to-br from-purple-200/25 to-pink-200/15',
        'bg-gradient-to-br from-emerald-200/25 to-teal-200/15',
        'bg-gradient-to-br from-rose-200/20 to-pink-200/10',
        'bg-gradient-to-br from-indigo-200/22 to-blue-200/12'
      ]
    }
  }

  // Adaptive border colors - Bright borders for glassmorphism in dark mode
  const getBorderColors = () => {
    if (isDarkMode) {
      return [
        'border-blue-200/30',
        'border-purple-200/25',
        'border-emerald-200/25',
        'border-rose-200/20',
        'border-indigo-200/28'
      ]
    } else {
      return [
        'border-blue-300/40',
        'border-purple-300/30',
        'border-emerald-300/25',
        'border-rose-300/25',
        'border-indigo-300/30'
      ]
    }
  }

  const symbolColors = getSymbolColors()
  const equationColors = getEquationColors()
  const glassOrbGradients = getGlassOrbGradients()
  const borderColors = getBorderColors()


  return (
    <>
      {/* --- START: Global Styles & Animations --- */}
      <style jsx global>{`
        /* All the animations from the original component */
        @keyframes mesh-drift-1 { 0%, 100% { transform: rotate(0deg) scale(1) translate(0, 0); } 33% { transform: rotate(120deg) scale(1.1) translate(20px, -20px); } 66% { transform: rotate(240deg) scale(0.9) translate(-20px, 20px); } }
        .animate-mesh-drift-1 { animation: mesh-drift-1 40s ease-in-out infinite; }
        @keyframes mesh-drift-2 { 0%, 100% { transform: rotate(0deg) scale(1) translate(0, 0); } 25% { transform: rotate(90deg) scale(1.2) translate(-30px, 10px); } 50% { transform: rotate(180deg) scale(0.8) translate(10px, -30px); } 75% { transform: rotate(270deg) scale(1.1) translate(20px, 20px); } }
        .animate-mesh-drift-2 { animation: mesh-drift-2 50s ease-in-out infinite; }
        @keyframes mesh-drift-3 { 0%, 100% { transform: rotate(0deg) scale(1) translate(0, 0); } 50% { transform: rotate(180deg) scale(1.3) translate(-10px, 10px); } }
        .animate-mesh-drift-3 { animation: mesh-drift-3 35s ease-in-out infinite; }
        @keyframes mesh-drift-4 { 0%, 100% { transform: rotate(0deg) scale(1) translate(0, 0); } 25% { transform: rotate(90deg) scale(1.1) translate(15px, -15px); } 50% { transform: rotate(180deg) scale(0.9) translate(-15px, -15px); } 75% { transform: rotate(270deg) scale(1.05) translate(-15px, 15px); } }
        .animate-mesh-drift-4 { animation: mesh-drift-4 45s ease-in-out infinite; }
        @keyframes equation-float-1 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; } 25% { transform: translateY(-30px) translateX(20px) rotate(5deg); opacity: 1; } 50% { transform: translateY(-15px) translateX(40px) rotate(-3deg); opacity: 0.7; } 75% { transform: translateY(-25px) translateX(10px) rotate(7deg); opacity: 0.9; } }
        .animate-equation-float-1 { animation: equation-float-1 12s ease-in-out infinite; }
        @keyframes equation-float-2 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; } 33% { transform: translateY(-40px) translateX(-30px) rotate(-8deg); opacity: 1; } 66% { transform: translateY(-20px) translateX(-15px) rotate(5deg); opacity: 0.7; } }
        .animate-equation-float-2 { animation: equation-float-2 15s ease-in-out infinite; }
        @keyframes equation-float-3 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; } 50% { transform: translateY(-35px) translateX(25px) rotate(-10deg); opacity: 1; } }
        .animate-equation-float-3 { animation: equation-float-3 10s ease-in-out infinite; }
        @keyframes equation-float-4 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; } 20% { transform: translateY(-25px) translateX(15px) rotate(4deg); opacity: 1; } 40% { transform: translateY(-45px) translateX(-10px) rotate(-6deg); opacity: 0.7; } 60% { transform: translateY(-30px) translateX(30px) rotate(8deg); opacity: 0.9; } 80% { transform: translateY(-15px) translateX(-20px) rotate(-3deg); opacity: 0.8; } }
        .animate-equation-float-4 { animation: equation-float-4 18s ease-in-out infinite; }
        @keyframes particle-drift-1 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.6; } 25% { transform: translateY(-120px) translateX(80px) rotate(90deg); opacity: 0.9; } 50% { transform: translateY(-80px) translateX(160px) rotate(180deg); opacity: 0.7; } 75% { transform: translateY(-200px) translateX(40px) rotate(270deg); opacity: 1; } }
        .animate-particle-drift-1 { animation: particle-drift-1 15s ease-in-out infinite; }
        @keyframes particle-drift-2 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.5; } 33% { transform: translateY(-100px) translateX(-60px) rotate(120deg); opacity: 0.8; } 66% { transform: translateY(-160px) translateX(120px) rotate(240deg); opacity: 0.6; } }
        .animate-particle-drift-2 { animation: particle-drift-2 18s ease-in-out infinite; }
        @keyframes particle-drift-3 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.7; } 50% { transform: translateY(-250px) translateX(-40px) rotate(180deg); opacity: 0.3; } }
        .animate-particle-drift-3 { animation: particle-drift-3 22s ease-in-out infinite; }
        @keyframes particle-drift-4 { 0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0.8; } 25% { transform: translateY(-80px) translateX(100px) rotate(90deg); opacity: 0.4; } 75% { transform: translateY(-180px) translateX(-80px) rotate(270deg); opacity: 0.9; } }
        .animate-particle-drift-4 { animation: particle-drift-4 20s ease-in-out infinite; }
        @keyframes glass-float-1 { 0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 25% { transform: translate(30px, -50px) rotate(90deg) scale(1.1); } 50% { transform: translate(-20px, -30px) rotate(180deg) scale(0.9); } 75% { transform: translate(-40px, 40px) rotate(270deg) scale(1.05); } }
        .animate-glass-float-1 { animation: glass-float-1 45s ease-in-out infinite; }
        @keyframes glass-float-2 { 0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(-60px, 40px) rotate(120deg) scale(1.2); } 66% { transform: translate(40px, -60px) rotate(240deg) scale(0.8); } }
        .animate-glass-float-2 { animation: glass-float-2 55s ease-in-out infinite; }
        @keyframes glass-float-3 { 0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 20% { transform: translate(40px, -20px) rotate(72deg) scale(1.1); } 40% { transform: translate(-30px, -40px) rotate(144deg) scale(0.9); } 60% { transform: translate(-50px, 30px) rotate(216deg) scale(1.15); } 80% { transform: translate(20px, 50px) rotate(288deg) scale(0.95); } }
        .animate-glass-float-3 { animation: glass-float-3 60s ease-in-out infinite; }
        @keyframes glass-float-4 { 0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 50% { transform: translate(-30px, -30px) rotate(180deg) scale(1.3); } }
        .animate-glass-float-4 { animation: glass-float-4 42s ease-in-out infinite; }
        @keyframes bubble-drift-1 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; } 25% { transform: translate(60px, -80px) scale(1.2); opacity: 0.9; } 50% { transform: translate(-40px, -60px) scale(0.8); opacity: 0.5; } 75% { transform: translate(-80px, 40px) scale(1.1); opacity: 0.8; } }
        .animate-bubble-drift-1 { animation: bubble-drift-1 30s ease-in-out infinite; }
        @keyframes bubble-drift-2 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.6; } 33% { transform: translate(-70px, 60px) scale(1.3); opacity: 1; } 66% { transform: translate(50px, -50px) scale(0.7); opacity: 0.4; } }
        .animate-bubble-drift-2 { animation: bubble-drift-2 38s ease-in-out infinite; }
        @keyframes bubble-drift-3 { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; } 50% { transform: translate(30px, 70px) scale(1.4); opacity: 0.3; } }
        .animate-bubble-drift-3 { animation: bubble-drift-3 25s ease-in-out infinite; }
        @keyframes aurora-glow { 0%, 100% { opacity: 0.6; transform: scale(1) rotate(0deg); } 25% { opacity: 0.8; transform: scale(1.05) rotate(90deg); } 50% { opacity: 0.4; transform: scale(0.95) rotate(180deg); } 75% { opacity: 0.9; transform: scale(1.1) rotate(270deg); } }
        .animate-aurora-glow { animation: aurora-glow 8s ease-in-out infinite; }
        @keyframes glass-fade-in { 0% { opacity: 0; transform: translateY(30px) scale(0.95); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-glass-fade-in { animation: glass-fade-in 1.2s ease-out forwards; }
        @keyframes slide-up-delayed { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-slide-up-delayed { animation: slide-up-delayed 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-slide-up-delayed-2 { animation: slide-up-delayed 0.8s ease-out 0.4s forwards; opacity: 0; }
        .animate-slide-up-delayed-3 { animation: slide-up-delayed 0.8s ease-out 0.6s forwards; opacity: 0; }
        .animate-slide-up-delayed-4 { animation: slide-up-delayed 0.8s ease-out 0.8s forwards; opacity: 0; }
        .animate-slide-up-delayed-5 { animation: slide-up-delayed 0.8s ease-out 1.0s forwards; opacity: 0; }
        .animate-slide-up-delayed-6 { animation: slide-up-delayed 0.8s ease-out 1.2s forwards; opacity: 0; }
        .animate-slide-up-delayed-7 { animation: slide-up-delayed 0.8s ease-out 1.4s forwards; opacity: 0; }
        .animate-slide-up-delayed-8 { animation: slide-up-delayed 0.8s ease-out 1.6s forwards; opacity: 0; }
        .animate-slide-up-delayed-9 { animation: slide-up-delayed 0.8s ease-out 1.8s forwards; opacity: 0; }
        .floating-icon { animation: float 6s ease-in-out infinite; }
        .floating-icon-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .floating-icon-slow { animation: float 10s ease-in-out infinite; }
        @keyframes float { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } 100% { transform: translateY(0) rotate(0deg); } }
        @keyframes float-reverse { 0% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(15px) rotate(-5deg); } 100% { transform: translateY(0) rotate(0deg); } }
        
        /* Enhanced Glassmorphism Card Styles */
        .glass-card { 
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.5)); 
          backdrop-filter: blur(40px) saturate(120%); 
          border: 1px solid rgba(255, 255, 255, 0.9); 
          box-shadow: 
            0 12px 40px rgba(31, 38, 135, 0.2), 
            0 0 0 1px rgba(255, 255, 255, 0.6) inset, 
            0 4px 16px rgba(255, 255, 255, 0.8) inset;
        }
        .glass-stat-card { 
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.4)); 
          backdrop-filter: blur(32px) saturate(110%); 
          border: 1px solid rgba(255, 255, 255, 0.85); 
          box-shadow: 
            0 8px 32px rgba(31, 38, 135, 0.15), 
            0 0 0 1px rgba(255, 255, 255, 0.5) inset,
            0 2px 12px rgba(255, 255, 255, 0.9) inset; 
        }
        .glass-activity-card { 
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.3)); 
          backdrop-filter: blur(28px) saturate(105%); 
          border: 1px solid rgba(255, 255, 255, 0.75); 
          box-shadow: 
            0 6px 24px rgba(31, 38, 135, 0.12), 
            0 0 0 1px rgba(255, 255, 255, 0.4) inset,
            0 1px 8px rgba(255, 255, 255, 0.7) inset; 
        }
        .glass-sidebar-card { 
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.45)); 
          backdrop-filter: blur(36px) saturate(115%); 
          border: 1px solid rgba(255, 255, 255, 0.9); 
          box-shadow: 
            0 10px 36px rgba(31, 38, 135, 0.18), 
            0 0 0 1px rgba(255, 255, 255, 0.55) inset,
            0 3px 14px rgba(255, 255, 255, 0.85) inset; 
        }
        .glass-premium-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.55)); 
          backdrop-filter: blur(44px) saturate(125%); 
          border: 1px solid rgba(255, 255, 255, 0.95); 
          box-shadow: 
            0 16px 48px rgba(31, 38, 135, 0.25), 
            0 0 0 1px rgba(255, 255, 255, 0.7) inset,
            0 6px 20px rgba(255, 255, 255, 0.95) inset,
            0 0 60px rgba(59, 130, 246, 0.1); 
        }
        .text-clean-shadow { filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2)); }
        .glass-input {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.2));
          backdrop-filter: blur(10px) saturate(100%);
          border: 1px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(31, 38, 135, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
          color: #374151; /* text-gray-700 */
        }
        .glass-input::placeholder {
          color: #6b7280; /* text-gray-500 */
        }
        .glass-input:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(31, 38, 135, 0.1);
        }
      `}</style>
      {/* --- END: Global Styles & Animations --- */}

      {/* --- START: Multi-Layered Animated Background --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        {/* Layer 1: Floating Symbols - Original + a few additions */}
        <div className={`absolute top-[7%] left-[13%] ${symbolColors[0]} text-9xl floating-icon`}>∑</div>
        <div className={`absolute top-[33%] right-[17%] ${symbolColors[1]} text-8xl floating-icon-reverse`}>π</div>
        <div className={`absolute top-[61%] left-[27%] ${symbolColors[2]} text-8xl floating-icon-slow`}>∞</div>
        <div className={`absolute top-[19%] right-[38%] ${symbolColors[3]} text-7xl floating-icon`}>⚛</div>
        <div className={`absolute bottom-[31%] left-[8%] ${symbolColors[4]} text-8xl floating-icon-reverse`}>∫</div>
        <div className={`absolute bottom-[12%] right-[42%] ${symbolColors[5]} text-9xl floating-icon`}>≈</div>
        <div className={`absolute bottom-[47%] right-[9%] ${symbolColors[6]} text-8xl floating-icon-slow`}>±</div>
        <div className={`absolute top-[23%] left-[54%] ${symbolColors[7]} text-8xl floating-icon`}>Δ</div>
        <div className={`absolute top-[44%] left-[38%] ${symbolColors[8]} text-7xl floating-icon-slow`}>λ</div>
        <div className={`absolute top-[81%] left-[67%] ${symbolColors[9]} text-9xl floating-icon-reverse`}>θ</div>
        <div className={`absolute top-[29%] left-[83%] ${symbolColors[10]} text-8xl floating-icon`}>α</div>
        <div className={`absolute bottom-[63%] left-[6%] ${symbolColors[11]} text-9xl floating-icon-slow`}>β</div>
        <div className={`absolute bottom-[19%] left-[71%] ${symbolColors[12]} text-8xl floating-icon-reverse`}>μ</div>
        <div className={`absolute bottom-[28%] left-[32%] ${symbolColors[13]} text-7xl floating-icon`}>ω</div>
        <div className={`absolute top-[52%] left-[18%] ${symbolColors[14]} text-8xl floating-icon-slow`}>γ</div>
        <div className={`absolute top-[37%] right-[29%] ${symbolColors[15]} text-9xl floating-icon`}>σ</div>
        <div className={`absolute bottom-[42%] right-[37%] ${symbolColors[0]} text-8xl floating-icon-reverse`}>δ</div>
        <div className={`absolute top-[73%] right-[13%] ${symbolColors[1]} text-8xl floating-icon-slow`}>ρ</div>
        
        {/* NEW: MANY MORE mathematical symbols to fill the homepage space */}
        <div className={`absolute top-[12%] left-[72%] ${symbolColors[2]} text-7xl floating-icon-reverse`}>∇</div>
        <div className={`absolute bottom-[8%] left-[15%] ${symbolColors[3]} text-8xl floating-icon-slow`}>∀</div>
        <div className={`absolute top-[47%] right-[4%] ${symbolColors[4]} text-7xl floating-icon`}>∂</div>
        <div className={`absolute top-[65%] left-[3%] ${symbolColors[5]} text-8xl floating-icon-reverse`}>Φ</div>
        
        {/* More symbols for density */}
        <div className={`absolute top-[8%] left-[35%] ${symbolColors[6]} text-6xl floating-icon`}>Ψ</div>
        <div className={`absolute top-[88%] right-[25%] ${symbolColors[7]} text-7xl floating-icon-reverse`}>Ω</div>
        <div className={`absolute top-[15%] right-[58%] ${symbolColors[8]} text-6xl floating-icon-slow`}>ε</div>
        <div className={`absolute bottom-[85%] left-[58%] ${symbolColors[9]} text-8xl floating-icon`}>ζ</div>
        <div className={`absolute top-[78%] right-[48%] ${symbolColors[10]} text-7xl floating-icon-reverse`}>η</div>
        <div className={`absolute bottom-[25%] right-[78%] ${symbolColors[11]} text-6xl floating-icon-slow`}>κ</div>
        <div className={`absolute top-[35%] left-[88%] ${symbolColors[12]} text-8xl floating-icon`}>ι</div>
        <div className={`absolute bottom-[55%] left-[45%] ${symbolColors[13]} text-7xl floating-icon-reverse`}>ν</div>
        <div className={`absolute top-[68%] right-[68%] ${symbolColors[14]} text-6xl floating-icon-slow`}>ξ</div>
        <div className={`absolute bottom-[15%] right-[58%] ${symbolColors[15]} text-8xl floating-icon`}>χ</div>
        <div className={`absolute top-[28%] left-[8%] ${symbolColors[0]} text-7xl floating-icon-reverse`}>ψ</div>
        <div className={`absolute bottom-[68%] right-[8%] ${symbolColors[1]} text-6xl floating-icon-slow`}>τ</div>
        <div className={`absolute top-[58%] right-[28%] ${symbolColors[2]} text-8xl floating-icon`}>φ</div>
        <div className={`absolute bottom-[45%] left-[68%] ${symbolColors[3]} text-7xl floating-icon-reverse`}>υ</div>
        <div className={`absolute top-[92%] left-[78%] ${symbolColors[4]} text-6xl floating-icon-slow`}>∃</div>
        <div className={`absolute top-[5%] right-[85%] ${symbolColors[5]} text-8xl floating-icon`}>∈</div>
        <div className={`absolute bottom-[92%] right-[45%] ${symbolColors[6]} text-7xl floating-icon-reverse`}>∉</div>
        <div className={`absolute top-[42%] left-[95%] ${symbolColors[7]} text-6xl floating-icon-slow`}>⊂</div>
        <div className={`absolute bottom-[38%] left-[85%] ${symbolColors[8]} text-8xl floating-icon`}>⊃</div>
        <div className={`absolute top-[85%] right-[78%] ${symbolColors[9]} text-7xl floating-icon-reverse`}>⊆</div>
        <div className={`absolute bottom-[78%] left-[25%] ${symbolColors[10]} text-6xl floating-icon-slow`}>⊇</div>
        <div className={`absolute top-[25%] right-[95%] ${symbolColors[11]} text-8xl floating-icon`}>∪</div>
        <div className={`absolute bottom-[58%] right-[88%] ${symbolColors[12]} text-7xl floating-icon-reverse`}>∩</div>
        <div className={`absolute top-[75%] left-[88%] ${symbolColors[13]} text-6xl floating-icon-slow`}>∧</div>
        <div className={`absolute bottom-[28%] left-[78%] ${symbolColors[14]} text-8xl floating-icon`}>∨</div>
        <div className={`absolute top-[48%] left-[75%] ${symbolColors[15]} text-7xl floating-icon-reverse`}>¬</div>
        <div className={`absolute bottom-[48%] right-[75%] ${symbolColors[0]} text-6xl floating-icon-slow`}>⇒</div>
        <div className={`absolute top-[18%] left-[48%] ${symbolColors[1]} text-8xl floating-icon`}>⇔</div>
        <div className={`absolute bottom-[18%] right-[48%] ${symbolColors[2]} text-7xl floating-icon-reverse`}>∴</div>
        <div className={`absolute top-[82%] left-[68%] ${symbolColors[3]} text-6xl floating-icon-slow`}>∵</div>
        <div className={`absolute bottom-[82%] right-[68%] ${symbolColors[4]} text-8xl floating-icon`}>⟨</div>
        <div className={`absolute top-[38%] left-[28%] ${symbolColors[5]} text-7xl floating-icon-reverse`}>⟩</div>
        
        {/* Layer 2: Drifting Gradient Meshes - REMOVED (was annoying) */}

        {/* Layer 3: Floating Equations - Original + a couple additions */}
        <div className={`absolute top-1/4 left-1/6 text-4xl font-bold ${equationColors[0]} animate-equation-float-1`}>∫ e⁻ˣ² dx = √π/2</div>
        <div className={`absolute top-1/3 right-1/5 text-3xl font-bold ${equationColors[1]} animate-equation-float-2`}>∑ 1/n² = π²/6</div>
        <div className={`absolute bottom-1/4 left-1/5 text-3xl font-bold ${equationColors[2]} animate-equation-float-3`}>E = mc²</div>
        <div className={`absolute top-1/2 right-1/6 text-3xl font-bold ${equationColors[3]} animate-equation-float-4`}>a² + b² = c²</div>
        
        {/* MORE equations to fill the space */}
        <div className={`absolute top-[85%] left-[45%] text-2xl font-bold ${equationColors[4]} floating-icon-slow`}>F = ma</div>
        <div className={`absolute bottom-[75%] right-[65%] text-2xl font-bold ${equationColors[5]} floating-icon-reverse`}>V = IR</div>
        <div className={`absolute top-[13%] left-[88%] text-3xl font-bold ${equationColors[0]} animate-equation-float-1`}>∇²φ = ρ/ε₀</div>
        <div className={`absolute bottom-[13%] right-[88%] text-2xl font-bold ${equationColors[1]} animate-equation-float-2`}>∂u/∂t = α∇²u</div>
        <div className={`absolute top-[67%] left-[13%] text-3xl font-bold ${equationColors[2]} animate-equation-float-3`}>|ψ⟩ = α|0⟩ + β|1⟩</div>
        <div className={`absolute bottom-[33%] right-[13%] text-2xl font-bold ${equationColors[3]} animate-equation-float-4`}>P(A|B) = P(B|A)P(A)/P(B)</div>
        <div className={`absolute top-[55%] left-[85%] text-2xl font-bold ${equationColors[4]} floating-icon-slow`}>λ = h/p</div>
        <div className={`absolute bottom-[55%] right-[85%] text-3xl font-bold ${equationColors[5]} floating-icon-reverse`}>∮ F⃗·dl⃗ = 0</div>
        <div className={`absolute top-[43%] left-[65%] text-2xl font-bold ${equationColors[0]} animate-equation-float-1`}>S = k ln Ω</div>
        <div className={`absolute bottom-[43%] right-[65%] text-3xl font-bold ${equationColors[1]} animate-equation-float-2`}>H = -∑ pᵢ log pᵢ</div>
        <div className={`absolute top-[77%] left-[35%] text-2xl font-bold ${equationColors[2]} animate-equation-float-3`}>x = (-b ± √D)/2a</div>
        <div className={`absolute bottom-[77%] right-[35%] text-2xl font-bold ${equationColors[3]} floating-icon-slow`}>∇ × B⃗ = μ₀J⃗</div>
        
        {/* Layer 4: Drifting Knowledge Particles - Keep original */}
        {isClient && particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute w-2 h-2 rounded-full ${particle.animationClass} shadow-md`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
              background: `radial-gradient(circle, ${colors[particle.colorIndex]}, rgba(255,255,255,${isDarkMode ? '0.05' : '0.2'}))`
            }}
          />
        ))}

        {/* Layer 5: Floating Glass Orbs & Bubbles - MORE FOR HOMEPAGE DENSITY! */}
        <div className={`absolute top-16 left-16 w-80 h-80 ${glassOrbGradients[0]} rounded-full backdrop-blur-sm border ${borderColors[0]} animate-glass-float-1 shadow-lg`} />
        <div className={`absolute top-32 right-24 w-96 h-96 ${glassOrbGradients[1]} rounded-full backdrop-blur-sm border ${borderColors[1]} animate-glass-float-2 shadow-lg`} />
        <div className={`absolute bottom-24 left-32 w-72 h-72 ${glassOrbGradients[2]} rounded-full backdrop-blur-sm border ${borderColors[2]} animate-glass-float-3 shadow-lg`} />
        <div className={`absolute top-1/4 left-1/5 w-56 h-56 ${glassOrbGradients[3]} rounded-full backdrop-blur-sm border ${borderColors[3]} animate-bubble-drift-1 shadow-md`} />
        <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 ${glassOrbGradients[4]} rounded-full backdrop-blur-sm border ${borderColors[4]} animate-bubble-drift-2 shadow-md`} />
        
        {/* MORE glass orbs for homepage density */}
        <div className={`absolute top-[65%] right-[45%] w-48 h-48 ${glassOrbGradients[0]} rounded-full backdrop-blur-sm border ${borderColors[0]} animate-glass-float-4 shadow-md`} />
        <div className={`absolute bottom-[65%] left-[45%] w-52 h-52 ${glassOrbGradients[1]} rounded-full backdrop-blur-sm border ${borderColors[1]} animate-bubble-drift-3 shadow-md`} />
        <div className={`absolute top-[15%] left-[75%] w-40 h-40 ${glassOrbGradients[2]} rounded-full backdrop-blur-sm border ${borderColors[2]} animate-glass-float-1 shadow-md`} />
        <div className={`absolute bottom-[85%] right-[75%] w-44 h-44 ${glassOrbGradients[3]} rounded-full backdrop-blur-sm border ${borderColors[3]} animate-bubble-drift-1 shadow-md`} />
        <div className={`absolute top-[85%] left-[25%] w-36 h-36 ${glassOrbGradients[4]} rounded-full backdrop-blur-sm border ${borderColors[4]} animate-glass-float-2 shadow-md`} />
        <div className={`absolute bottom-[15%] right-[25%] w-60 h-60 ${glassOrbGradients[0]} rounded-full backdrop-blur-sm border ${borderColors[0]} animate-bubble-drift-2 shadow-md`} />
        <div className={`absolute top-[45%] right-[85%] w-32 h-32 ${glassOrbGradients[1]} rounded-full backdrop-blur-sm border ${borderColors[1]} animate-glass-float-3 shadow-md`} />
        <div className={`absolute bottom-[45%] left-[85%] w-38 h-38 ${glassOrbGradients[2]} rounded-full backdrop-blur-sm border ${borderColors[2]} animate-bubble-drift-3 shadow-md`} />
        
        {/* MANY MORE SVG icons for rich background */}
        <div className="absolute top-[18%] left-[23%] opacity-40 floating-icon-slow">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-28 w-28 ${symbolColors[6]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="absolute bottom-[35%] right-[15%] opacity-35 floating-icon-reverse">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-24 w-24 ${symbolColors[8]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        
        {/* Brain & Intelligence Icons */}
        <div className="absolute top-[25%] right-[65%] opacity-30 floating-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-20 w-20 ${symbolColors[10]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Academic Icons */}
        <div className="absolute bottom-[25%] left-[65%] opacity-35 floating-icon-reverse">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-22 w-22 ${symbolColors[12]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        
        {/* Technology Icons */}
        <div className="absolute top-[75%] right-[35%] opacity-30 floating-icon-slow">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-18 w-18 ${symbolColors[14]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        {/* Navigation Icons */}
        <div className="absolute bottom-[75%] left-[35%] opacity-35 floating-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-26 w-26 ${symbolColors[0]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        
        {/* Chat/AI Icons */}
        <div className="absolute top-[62%] left-[92%] opacity-30 floating-icon-reverse">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${symbolColors[2]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        
        {/* Search Icons */}
        <div className="absolute bottom-[62%] right-[92%] opacity-35 floating-icon-slow">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-20 w-20 ${symbolColors[4]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Heart/Wellness Icons */}
        <div className="absolute top-[87%] right-[87%] opacity-30 floating-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-14 w-14 ${symbolColors[6]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        
        {/* User/Community Icons */}
        <div className="absolute bottom-[87%] left-[87%] opacity-35 floating-icon-reverse">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-18 w-18 ${symbolColors[8]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </div>
        
        {/* Star/Achievement Icons */}
        <div className="absolute top-[33%] left-[63%] opacity-30 floating-icon-slow">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-16 w-16 ${symbolColors[11]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        
        {/* Shield/Security Icons */}
        <div className="absolute bottom-[33%] right-[63%] opacity-35 floating-icon">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-22 w-22 ${symbolColors[13]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
      </div>
      {/* --- END: Multi-Layered Animated Background --- */}
    </>
  )
}