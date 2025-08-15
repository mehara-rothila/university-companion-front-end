// src/app/challenges/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'wellness' | 'environmental' | 'social' | 'creative' | 'technical';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  participants: number;
  maxParticipants?: number;
  isTeamChallenge: boolean;
  teamSize?: number;
  rewards: Reward[];
  requirements: string[];
  createdBy: string;
  organization?: string;
  tags: string[];
  progress?: number;
  isJoined?: boolean;
  aiRecommended?: boolean;
  matchScore?: number;
}

interface Reward {
  id: string;
  type: 'points' | 'badge' | 'voucher' | 'scholarship' | 'recognition' | 'priority';
  title: string;
  description: string;
  value: number;
  condition: string; // e.g., "1st place", "top 10%", "completion"
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  challengeId: string;
  captain: string;
  skills: string[];
  lookingForMembers: boolean;
  requiredSkills?: string[];
  maxMembers: number;
  createdDate: Date;
}

interface TeamMember {
  id: string;
  name: string;
  major: string;
  year: number;
  skills: string[];
  role: 'captain' | 'member';
  joinDate: Date;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'challenge' | 'participation' | 'leadership' | 'impact' | 'streak';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedDate?: Date;
  progress?: number;
  maxProgress?: number;
}

interface LeaderboardEntry {
  id: string;
  userName: string;
  profilePicture?: string;
  totalPoints: number;
  challengesCompleted: number;
  rank: number;
  badges: number;
  streak: number;
  category?: string;
}

interface AIRecommendation {
  id: string;
  type: 'challenge' | 'team' | 'skill' | 'strategy';
  title: string;
  description: string;
  confidence: number;
  action: string;
  relatedItem: string;
}

export default function CampusChallengesPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock user data
  const [userStats] = useState({
    totalPoints: 2850,
    rank: 23,
    challengesCompleted: 12,
    badgesEarned: 8,
    currentStreak: 5,
    teamsJoined: 3
  });

  // Mock challenges data
  const [challenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Campus Sustainability Challenge',
      description: 'Reduce campus carbon footprint through innovative solutions and behavioral changes.',
      type: 'environmental',
      difficulty: 'intermediate',
      duration: 30,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-03-01'),
      status: 'active',
      participants: 156,
      maxParticipants: 200,
      isTeamChallenge: true,
      teamSize: 4,
      rewards: [
        { id: '1', type: 'scholarship', title: 'Sustainability Scholarship', description: '$1000 scholarship for environmental studies', value: 1000, condition: '1st place' },
        { id: '2', type: 'points', title: 'Eco Points', description: 'Points for leaderboard', value: 500, condition: 'completion' }
      ],
      requirements: ['Environmental interest', 'Team collaboration', 'Data analysis skills'],
      createdBy: 'Environmental Club',
      organization: 'Student Environmental Society',
      tags: ['sustainability', 'environment', 'innovation', 'teamwork'],
      progress: 65,
      isJoined: true,
      aiRecommended: true,
      matchScore: 92
    },
    {
      id: '2',
      title: 'Code for Good Hackathon',
      description: '48-hour hackathon to develop solutions for local nonprofit organizations.',
      type: 'technical',
      difficulty: 'advanced',
      duration: 2,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-17'),
      status: 'upcoming',
      participants: 89,
      maxParticipants: 120,
      isTeamChallenge: true,
      teamSize: 5,
      rewards: [
        { id: '3', type: 'voucher', title: 'Tech Store Credit', description: '$500 tech equipment voucher', value: 500, condition: '1st place' },
        { id: '4', type: 'recognition', title: 'Innovation Award', description: 'Featured in university newsletter', value: 0, condition: 'most innovative' }
      ],
      requirements: ['Programming skills', 'Problem-solving', 'Social impact focus'],
      createdBy: 'Computer Science Department',
      tags: ['programming', 'hackathon', 'nonprofit', 'innovation'],
      aiRecommended: true,
      matchScore: 88
    },
    {
      id: '3',
      title: 'Academic Excellence Sprint',
      description: 'Month-long challenge to improve study habits and academic performance.',
      type: 'academic',
      difficulty: 'beginner',
      duration: 30,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      status: 'active',
      participants: 234,
      isTeamChallenge: false,
      rewards: [
        { id: '5', type: 'badge', title: 'Scholar Badge', description: 'Academic achievement recognition', value: 0, condition: 'GPA improvement' },
        { id: '6', type: 'priority', title: 'Priority Registration', description: 'Early course registration privilege', value: 0, condition: 'top 20%' }
      ],
      requirements: ['Current enrollment', 'Commitment to improvement'],
      createdBy: 'Academic Success Center',
      tags: ['academic', 'study', 'improvement', 'individual'],
      progress: 78,
      isJoined: true
    },
    {
      id: '4',
      title: 'Wellness Warrior Challenge',
      description: 'Improve physical and mental wellness through daily healthy activities.',
      type: 'wellness',
      difficulty: 'beginner',
      duration: 21,
      startDate: new Date('2024-02-10'),
      endDate: new Date('2024-03-03'),
      status: 'upcoming',
      participants: 67,
      isTeamChallenge: false,
      rewards: [
        { id: '7', type: 'voucher', title: 'Gym Membership', description: 'Free semester gym membership', value: 200, condition: 'completion' },
        { id: '8', type: 'badge', title: 'Wellness Champion', description: 'Health and fitness achievement', value: 0, condition: 'consistency' }
      ],
      requirements: ['Health commitment', 'Daily check-ins'],
      createdBy: 'Campus Recreation',
      tags: ['wellness', 'fitness', 'mental health', 'habits'],
      aiRecommended: true,
      matchScore: 76
    },
    {
      id: '5',
      title: 'Creative Campus Art Project',
      description: 'Collaborate to create public art installations around campus.',
      type: 'creative',
      difficulty: 'intermediate',
      duration: 45,
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-04-15'),
      status: 'upcoming',
      participants: 23,
      maxParticipants: 50,
      isTeamChallenge: true,
      teamSize: 6,
      rewards: [
        { id: '9', type: 'recognition', title: 'Art Exhibition', description: 'Featured in campus gallery', value: 0, condition: 'completion' },
        { id: '10', type: 'points', title: 'Creative Points', description: 'Creativity leaderboard points', value: 300, condition: 'participation' }
      ],
      requirements: ['Artistic interest', 'Collaboration skills'],
      createdBy: 'Art Department',
      tags: ['art', 'creativity', 'collaboration', 'campus']
    }
  ]);

  // Mock teams data
  const [teams] = useState<Team[]>([
    {
      id: '1',
      name: 'Green Innovators',
      description: 'Passionate about environmental solutions and sustainable technology.',
      members: [
        { id: '1', name: 'Sarah Chen', major: 'Environmental Science', year: 3, skills: ['Research', 'Data Analysis', 'Sustainability'], role: 'captain', joinDate: new Date('2024-01-20') },
        { id: '2', name: 'Mike Rodriguez', major: 'Engineering', year: 2, skills: ['Design', 'Innovation', 'Problem Solving'], role: 'member', joinDate: new Date('2024-01-22') },
        { id: '3', name: 'Emma Johnson', major: 'Business', year: 4, skills: ['Project Management', 'Communication', 'Strategy'], role: 'member', joinDate: new Date('2024-01-25') }
      ],
      challengeId: '1',
      captain: '1',
      skills: ['Environmental Science', 'Engineering', 'Business Strategy'],
      lookingForMembers: true,
      requiredSkills: ['Marketing', 'Data Visualization'],
      maxMembers: 4,
      createdDate: new Date('2024-01-20')
    },
    {
      id: '2',
      name: 'Code Crusaders',
      description: 'Full-stack developers ready to build impactful solutions for nonprofits.',
      members: [
        { id: '4', name: 'Alex Kim', major: 'Computer Science', year: 3, skills: ['React', 'Node.js', 'Database Design'], role: 'captain', joinDate: new Date('2024-01-18') },
        { id: '5', name: 'Jordan Taylor', major: 'Computer Science', year: 2, skills: ['Python', 'Machine Learning', 'UI/UX'], role: 'member', joinDate: new Date('2024-01-19') }
      ],
      challengeId: '2',
      captain: '4',
      skills: ['Full-Stack Development', 'Machine Learning', 'UI/UX Design'],
      lookingForMembers: true,
      requiredSkills: ['Mobile Development', 'DevOps', 'Project Management'],
      maxMembers: 5,
      createdDate: new Date('2024-01-18')
    }
  ]);

  // Mock achievements data
  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: 'First Challenge',
      description: 'Completed your first campus challenge',
      icon: '🎯',
      type: 'challenge',
      rarity: 'common',
      unlockedDate: new Date('2024-01-10')
    },
    {
      id: '2',
      title: 'Team Player',
      description: 'Successfully completed a team challenge',
      icon: '🤝',
      type: 'participation',
      rarity: 'common',
      unlockedDate: new Date('2024-01-20')
    },
    {
      id: '3',
      title: 'Sustainability Champion',
      description: 'Completed 3 environmental challenges',
      icon: '🌱',
      type: 'impact',
      rarity: 'rare',
      unlockedDate: new Date('2024-01-25')
    },
    {
      id: '4',
      title: 'Code Warrior',
      description: 'Won a programming competition',
      icon: '⚔️',
      type: 'challenge',
      rarity: 'epic',
      unlockedDate: new Date('2024-01-30')
    },
    {
      id: '5',
      title: 'Streak Master',
      description: 'Maintained a 10-day participation streak',
      icon: '🔥',
      type: 'streak',
      rarity: 'rare',
      progress: 5,
      maxProgress: 10
    },
    {
      id: '6',
      title: 'Innovation Legend',
      description: 'Created 5 groundbreaking solutions',
      icon: '💡',
      type: 'leadership',
      rarity: 'legendary',
      progress: 2,
      maxProgress: 5
    }
  ]);

  // Mock leaderboard data
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { id: '1', userName: 'Alex Chen', totalPoints: 4250, challengesCompleted: 18, rank: 1, badges: 12, streak: 8 },
    { id: '2', userName: 'Sarah Kim', totalPoints: 3890, challengesCompleted: 16, rank: 2, badges: 10, streak: 6 },
    { id: '3', userName: 'Mike Johnson', totalPoints: 3650, challengesCompleted: 15, rank: 3, badges: 9, streak: 4 },
    { id: '4', userName: 'Emma Rodriguez', totalPoints: 3420, challengesCompleted: 14, rank: 4, badges: 8, streak: 7 },
    { id: '5', userName: 'Jordan Taylor', totalPoints: 3180, challengesCompleted: 13, rank: 5, badges: 7, streak: 3 },
    { id: '6', userName: 'You', totalPoints: userStats.totalPoints, challengesCompleted: userStats.challengesCompleted, rank: userStats.rank, badges: userStats.badgesEarned, streak: userStats.currentStreak }
  ]);

  // Mock AI recommendations
  const [aiRecommendations] = useState<AIRecommendation[]>([
    {
      id: '1',
      type: 'challenge',
      title: 'Perfect Match Challenge',
      description: 'Code for Good Hackathon matches your programming skills and social impact interests.',
      confidence: 92,
      action: 'Join Challenge',
      relatedItem: '2'
    },
    {
      id: '2',
      type: 'team',
      title: 'Ideal Team Connection',
      description: 'Green Innovators team needs someone with your sustainability knowledge.',
      confidence: 85,
      action: 'Request to Join',
      relatedItem: '1'
    },
    {
      id: '3',
      type: 'skill',
      title: 'Skill Development Opportunity',
      description: 'Participating in Wellness Challenge could improve your stress management skills.',
      confidence: 78,
      action: 'View Challenge',
      relatedItem: '4'
    }
  ]);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  // Get challenge type color
  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'academic': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'wellness': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'environmental': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'social': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'creative': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      case 'technical': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'expert': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
      case 'rare': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'epic': return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
      case 'legendary': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'upcoming': return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'completed': return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
      case 'cancelled': return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Filter challenges
  const filteredChallenges = challenges.filter(challenge => 
    selectedCategory === 'all' || challenge.type === selectedCategory
  );

  const challengeCategories = [
    { id: 'all', name: 'All Challenges', count: challenges.length },
    { id: 'academic', name: 'Academic', count: challenges.filter(c => c.type === 'academic').length },
    { id: 'wellness', name: 'Wellness', count: challenges.filter(c => c.type === 'wellness').length },
    { id: 'environmental', name: 'Environmental', count: challenges.filter(c => c.type === 'environmental').length },
    { id: 'social', name: 'Social', count: challenges.filter(c => c.type === 'social').length },
    { id: 'creative', name: 'Creative', count: challenges.filter(c => c.type === 'creative').length },
    { id: 'technical', name: 'Technical', count: challenges.filter(c => c.type === 'technical').length }
  ];

  const tabs = [
    { id: 'explore', name: 'Explore Challenges', icon: '🔍' },
    { id: 'my-challenges', name: 'My Challenges', icon: '🎯' },
    { id: 'teams', name: 'Teams', icon: '👥' },
    { id: 'leaderboard', name: 'Leaderboard', icon: '🏆' },
    { id: 'achievements', name: 'Achievements', icon: '🏅' }
  ];

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading campus challenges...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="text-center">
              <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center justify-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Campus Challenges & Competitions
              </h1>
              <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} max-w-3xl mx-auto mb-6`}>
                Gamified campus engagement platform with AI-powered team matching, leaderboards, and real rewards for academic and personal growth.
              </p>

              {/* Quick Actions */}
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Challenge
                </button>
                
                <button 
                  onClick={() => setShowTeamModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Find Team
                </button>

                <Link 
                  href="/wellness"
                  className={`px-6 py-3 ${isDarkMode ? 'bg-green-700 hover:bg-green-600 text-green-200' : 'bg-green-100 hover:bg-green-200 text-green-700'} rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Wellness Challenges
                </Link>
              </div>
            </div>
          </div>

          {/* User Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-50 border border-purple-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {userStats.totalPoints.toLocaleString()}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>Total Points</div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                #{userStats.rank}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>Global Rank</div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                {userStats.challengesCompleted}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-green-300' : 'text-green-700'}`}>Completed</div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-1">
                {userStats.badgesEarned}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Badges</div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1 flex items-center justify-center">
                🔥{userStats.currentStreak}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>Day Streak</div>
            </div>
            
            <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-teal-900/20 border border-teal-800' : 'bg-teal-50 border border-teal-200'} text-center animate-fade-in`}>
              <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                {userStats.teamsJoined}
              </div>
              <div className={`text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-700'}`}>Teams</div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Challenge Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rec.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                        {rec.confidence}%
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>{rec.description}</p>
                    <button className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                      {rec.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm mb-6 animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-0 px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>

            {/* Explore Challenges Tab */}
            {activeTab === 'explore' && (
              <div className="p-8">
                
                {/* Category Filter */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {challengeCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          selectedCategory === category.id
                            ? 'bg-purple-600 text-white'
                            : isDarkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category.name} ({category.count})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Challenges Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredChallenges.map((challenge) => (
                    <div key={challenge.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 hover:shadow-md`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChallengeTypeColor(challenge.type)}`}>
                            {challenge.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                          {challenge.aiRecommended && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              🤖 AI Match: {challenge.matchScore}%
                            </span>
                          )}
                        </div>
                        
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </span>
                      </div>

                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                        {challenge.title}
                      </h3>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {challenge.description}
                      </p>

                      {/* Challenge Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Duration:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{challenge.duration} days</p>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Participants:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {challenge.participants}{challenge.maxParticipants && `/${challenge.maxParticipants}`}
                          </p>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Type:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {challenge.isTeamChallenge ? `Team (${challenge.teamSize})` : 'Individual'}
                          </p>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Rewards:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {challenge.rewards.length} reward{challenge.rewards.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar for Joined Challenges */}
                      {challenge.isJoined && challenge.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Progress</span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {challenge.progress}%
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                            <div 
                              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {challenge.tags.slice(0, 3).map(tag => (
                          <span key={tag} className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            #{tag}
                          </span>
                        ))}
                        {challenge.tags.length > 3 && (
                          <span className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                            +{challenge.tags.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {challenge.isJoined ? (
                          <>
                            <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium cursor-not-allowed">
                              Joined ✓
                            </button>
                            <button className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200`}>
                              View Progress
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => {
                                setSelectedChallenge(challenge);
                                setShowJoinModal(true);
                              }}
                              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                            >
                              {challenge.status === 'upcoming' ? 'Register' : 'Join Challenge'}
                            </button>
                            <button className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200`}>
                              Learn More
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Challenges Tab */}
            {activeTab === 'my-challenges' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  My Active Challenges
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {challenges.filter(c => c.isJoined).map((challenge) => (
                    <div key={challenge.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                            {challenge.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChallengeTypeColor(challenge.type)}`}>
                            {challenge.type}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(challenge.status)}`}>
                          {challenge.status}
                        </span>
                      </div>

                      {/* Progress */}
                      {challenge.progress !== undefined && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              Progress
                            </span>
                            <span className={`text-sm font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                              {challenge.progress}%
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3`}>
                            <div 
                              className="h-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                              style={{ width: `${challenge.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Time Remaining */}
                      <div className="mb-4">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Ends: {challenge.endDate.toLocaleDateString()}
                        </span>
                      </div>

                      {/* Rewards Preview */}
                      <div className="mb-4">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Available Rewards:
                        </h4>
                        <div className="space-y-1">
                          {challenge.rewards.slice(0, 2).map(reward => (
                            <div key={reward.id} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              • {reward.title} - {reward.condition}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                          View Details
                        </button>
                        {challenge.isTeamChallenge && (
                          <button className={`px-4 py-2 ${isDarkMode ? 'bg-blue-600 hover:bg-blue-500 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} rounded-lg text-sm font-medium transition-all duration-200`}>
                            Team Chat
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Teams Looking for Members
                  </h2>
                  <button 
                    onClick={() => setShowTeamModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200"
                  >
                    Create Team
                  </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {teams.map((team) => (
                    <div key={team.id} className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                      
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                            {team.name}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {team.description}
                          </p>
                        </div>
                        {team.lookingForMembers && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            Recruiting
                          </span>
                        )}
                      </div>

                      {/* Team Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Members:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {team.members.length}/{team.maxMembers}
                          </p>
                        </div>
                        <div>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>Challenge:</span>
                          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {challenges.find(c => c.id === team.challengeId)?.title.slice(0, 20)}...
                          </p>
                        </div>
                      </div>

                      {/* Team Members */}
                      <div className="mb-4">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Current Members:
                        </h4>
                        <div className="space-y-1">
                          {team.members.map(member => (
                            <div key={member.id} className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center justify-between`}>
                              <span>
                                {member.name} - {member.major} (Year {member.year})
                                {member.role === 'captain' && ' 👑'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Required Skills */}
                      {team.requiredSkills && team.requiredSkills.length > 0 && (
                        <div className="mb-4">
                          <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Looking for:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {team.requiredSkills.map(skill => (
                              <span key={skill} className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200">
                          Request to Join
                        </button>
                        <button className={`px-4 py-2 ${isDarkMode ? 'bg-gray-600 hover:bg-gray-500 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg text-sm font-medium transition-all duration-200`}>
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Global Leaderboard
                </h2>
                
                <div className={`rounded-xl ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} overflow-hidden`}>
                  <div className="space-y-1">
                    {leaderboard.map((entry, index) => (
                      <div 
                        key={entry.id} 
                        className={`p-4 flex items-center justify-between transition-all duration-200 ${
                          entry.userName === 'You' 
                            ? isDarkMode ? 'bg-purple-900/30 border-l-4 border-purple-500' : 'bg-purple-50 border-l-4 border-purple-500'
                            : index < 3 
                              ? isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'
                              : isDarkMode ? 'hover:bg-gray-600/50' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`text-lg font-bold ${
                            index === 0 ? 'text-yellow-500' :
                            index === 1 ? 'text-gray-400' :
                            index === 2 ? 'text-orange-600' :
                            entry.userName === 'You' ? 'text-purple-500' :
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${entry.rank}`}
                          </div>
                          
                          <div>
                            <div className={`font-medium ${
                              entry.userName === 'You' 
                                ? 'text-purple-600 dark:text-purple-400' 
                                : isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {entry.userName}
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {entry.challengesCompleted} challenges • {entry.badges} badges
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {entry.totalPoints.toLocaleString()}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                            🔥 {entry.streak} day streak
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="p-8">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Your Achievements
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {achievements.map((achievement) => (
                    <div 
                      key={achievement.id} 
                      className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-700/50 border border-gray-600' : 'bg-gray-50 border border-gray-200'} transition-all duration-200 ${
                        achievement.unlockedDate ? 'opacity-100' : 'opacity-60'
                      }`}
                    >
                      
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                          {achievement.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4`}>
                        {achievement.description}
                      </p>

                      {/* Progress Bar for Locked Achievements */}
                      {!achievement.unlockedDate && achievement.progress !== undefined && achievement.maxProgress && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                            <div 
                              className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Unlock Date */}
                      {achievement.unlockedDate && (
                        <div className="text-center">
                          <span className={`text-xs ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                            ✓ Unlocked {achievement.unlockedDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Join Challenge Modal */}
        {showJoinModal && selectedChallenge && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Join Challenge
                </h2>
                <button 
                  onClick={() => {
                    setShowJoinModal(false);
                    setSelectedChallenge(null);
                  }}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {selectedChallenge.title}
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Ready to take on this challenge? You&apos;ll be joining {selectedChallenge.participants} other participants!
                </p>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowJoinModal(false);
                      setSelectedChallenge(null);
                      // In real app, would handle joining logic
                    }}
                    className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    🚀 Join Challenge
                  </button>
                  
                  {selectedChallenge.isTeamChallenge && (
                    <button className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200`}>
                      👥 Find Team First
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Challenge Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Create Challenge</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Create New Challenge
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Design your own campus challenge and engage the community! Our AI will help optimize difficulty and rewards.
                </p>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    🎨 Design Challenge
                  </button>
                  
                  <Link 
                    href="/help"
                    className={`block w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200 text-center`}
                  >
                    📖 Creation Guidelines
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Modal */}
        {showTeamModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Team Management</h2>
                <button 
                  onClick={() => setShowTeamModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  Team Options
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Create a new team or let our AI match you with the perfect team based on your skills and interests.
                </p>

                <div className="space-y-3">
                  <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg">
                    🤖 AI Team Matching
                  </button>
                  
                  <button className={`w-full px-6 py-3 ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} rounded-lg font-medium transition-all duration-200`}>
                    👥 Create New Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}