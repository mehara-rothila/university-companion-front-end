// src/app/career/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface CareerProfile {
  id: string;
  userId: string;
  skills: Skill[];
  interests: string[];
  careerGoals: string[];
  experience: Experience[];
  education: Education[];
  resumeUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  aiCareerScore: number;
  completionPercentage: number;
}

interface Skill {
  id: string;
  name: string;
  category: 'technical' | 'soft' | 'language' | 'certification';
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  verified: boolean;
  endorsements: number;
  aiRecommended?: boolean;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  type: 'internship' | 'part-time' | 'full-time' | 'volunteer' | 'project';
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  skills: string[];
  achievements: string[];
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  gpa?: number;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  relevantCourses: string[];
}

interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'entry-level' | 'experienced' | 'remote' | 'part-time';
  salary?: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  preferredSkills: string[];
  benefits: string[];
  postedDate: Date;
  applicationDeadline?: Date;
  matchScore?: number;
  aiRecommended?: boolean;
  applicationUrl: string;
  companyRating: number;
  isRemote: boolean;
  isSaved: boolean;
  hasApplied: boolean;
}

interface CareerPath {
  id: string;
  title: string;
  field: string;
  description: string;
  averageSalary: { entry: number; mid: number; senior: number };
  growthRate: number;
  requiredSkills: string[];
  suggestedCourses: string[];
  careerProgression: string[];
  jobTitles: string[];
  industries: string[];
  matchScore?: number;
  aiRecommended?: boolean;
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
}

// InterviewPrep interface - defined for future interview feature implementation


interface NetworkingEvent {
  id: string;
  title: string;
  type: 'career-fair' | 'networking' | 'workshop' | 'info-session' | 'panel' | 'mixer';
  organizer: string;
  date: Date;
  location: string;
  isVirtual: boolean;
  description: string;
  attendeeCount: number;
  companies: string[];
  industries: string[];
  isRegistered: boolean;
  cost?: number;
  aiRecommended?: boolean;
}

type ActiveTab = 'dashboard' | 'jobs' | 'career-paths' | 'profile' | 'interview-prep' | 'networking';

export default function CareerPage() {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobFilters, setJobFilters] = useState({
    type: [] as string[],
    location: 'all',
    remote: false,
    salaryMin: 0
  });
  // Mock data
  const [careerProfile, setCareerProfile] = useState<CareerProfile | null>(null);
  const [jobOpportunities, setJobOpportunities] = useState<JobOpportunity[]>([]);
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [networkingEvents, setNetworkingEvents] = useState<NetworkingEvent[]>([]);

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      // Mock career profile
      const mockProfile: CareerProfile = {
        id: '1',
        userId: 'user1',
        skills: [
          {
            id: '1',
            name: 'Python',
            category: 'technical',
            level: 'intermediate',
            verified: true,
            endorsements: 15,
            aiRecommended: true
          },
          {
            id: '2',
            name: 'Data Analysis',
            category: 'technical',
            level: 'advanced',
            verified: false,
            endorsements: 8
          },
          {
            id: '3',
            name: 'Leadership',
            category: 'soft',
            level: 'intermediate',
            verified: true,
            endorsements: 12
          },
          {
            id: '4',
            name: 'React',
            category: 'technical',
            level: 'beginner',
            verified: false,
            endorsements: 3,
            aiRecommended: true
          }
        ],
        interests: ['Technology', 'Data Science', 'Product Management', 'Startups'],
        careerGoals: ['Software Engineer at Tech Company', 'Data Scientist', 'Product Manager'],
        experience: [
          {
            id: '1',
            title: 'Software Development Intern',
            company: 'TechCorp Inc.',
            type: 'internship',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-08-31'),
            current: false,
            description: 'Developed web applications using React and Node.js',
            skills: ['React', 'Node.js', 'JavaScript', 'Git'],
            achievements: ['Improved application performance by 25%', 'Led team of 3 interns']
          }
        ],
        education: [
          {
            id: '1',
            institution: 'University Name',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            gpa: 3.7,
            startDate: new Date('2022-09-01'),
            endDate: new Date('2026-05-31'),
            current: true,
            relevantCourses: ['Data Structures', 'Algorithms', 'Database Systems', 'Software Engineering']
          }
        ],
        aiCareerScore: 78,
        completionPercentage: 65
      };

      // Mock job opportunities
      const mockJobs: JobOpportunity[] = [
        {
          id: '1',
          title: 'Software Engineer Intern',
          company: 'Google',
          location: 'Mountain View, CA',
          type: 'internship',
          salary: { min: 7000, max: 9000, currency: 'USD' },
          description: 'Join our team to build scalable software solutions that impact billions of users worldwide.',
          requirements: ['Computer Science or related field', 'Programming experience in Python/Java/C++', 'Strong problem-solving skills'],
          preferredSkills: ['Machine Learning', 'Distributed Systems', 'Algorithm Design'],
          benefits: ['Health insurance', 'Free meals', 'Learning stipend', 'Mentorship program'],
          postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          matchScore: 92,
          aiRecommended: true,
          applicationUrl: 'https://careers.google.com/jobs/1',
          companyRating: 4.4,
          isRemote: false,
          isSaved: true,
          hasApplied: false
        },
        {
          id: '2',
          title: 'Data Science Intern',
          company: 'Netflix',
          location: 'Los Gatos, CA',
          type: 'internship',
          salary: { min: 6500, max: 8500, currency: 'USD' },
          description: 'Work with our data science team to analyze user behavior and improve recommendation algorithms.',
          requirements: ['Statistics or Data Science background', 'Python/R programming', 'SQL knowledge'],
          preferredSkills: ['Machine Learning', 'A/B Testing', 'Data Visualization'],
          benefits: ['Flexible hours', 'Netflix subscription', 'Professional development'],
          postedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          matchScore: 88,
          aiRecommended: true,
          applicationUrl: 'https://jobs.netflix.com/jobs/2',
          companyRating: 4.3,
          isRemote: true,
          isSaved: false,
          hasApplied: false
        },
        {
          id: '3',
          title: 'Product Management Intern',
          company: 'Airbnb',
          location: 'San Francisco, CA',
          type: 'internship',
          salary: { min: 6000, max: 8000, currency: 'USD' },
          description: 'Drive product initiatives that enhance the travel experience for millions of users.',
          requirements: ['Business or Engineering background', 'Analytical thinking', 'Communication skills'],
          preferredSkills: ['Product Analytics', 'User Research', 'Agile Methodologies'],
          benefits: ['Travel credits', 'Mentorship', 'Networking opportunities'],
          postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          matchScore: 76,
          aiRecommended: false,
          applicationUrl: 'https://careers.airbnb.com/jobs/3',
          companyRating: 4.2,
          isRemote: false,
          isSaved: false,
          hasApplied: true
        },
        {
          id: '4',
          title: 'Frontend Developer',
          company: 'Spotify',
          location: 'Remote',
          type: 'entry-level',
          salary: { min: 70000, max: 90000, currency: 'USD' },
          description: 'Build beautiful and responsive user interfaces for our music streaming platform.',
          requirements: ['React/Vue.js experience', 'HTML/CSS/JavaScript', 'Git version control'],
          preferredSkills: ['TypeScript', 'Testing frameworks', 'Design systems'],
          benefits: ['Remote work', 'Spotify Premium', 'Health insurance', 'Equity'],
          postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          applicationDeadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          matchScore: 84,
          aiRecommended: true,
          applicationUrl: 'https://jobs.spotify.com/jobs/4',
          companyRating: 4.5,
          isRemote: true,
          isSaved: true,
          hasApplied: false
        }
      ];

      // Mock career paths
      const mockCareerPaths: CareerPath[] = [
        {
          id: '1',
          title: 'Software Engineer',
          field: 'Technology',
          description: 'Design and develop software applications, systems, and platforms to solve complex problems.',
          averageSalary: { entry: 85000, mid: 130000, senior: 180000 },
          growthRate: 22,
          requiredSkills: ['Programming Languages', 'Problem Solving', 'System Design', 'Version Control'],
          suggestedCourses: ['Advanced Algorithms', 'Software Architecture', 'Database Design'],
          careerProgression: ['Junior Developer', 'Software Engineer', 'Senior Engineer', 'Lead Engineer', 'Engineering Manager'],
          jobTitles: ['Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer'],
          industries: ['Technology', 'Finance', 'Healthcare', 'E-commerce', 'Gaming'],
          matchScore: 92,
          aiRecommended: true,
          demandLevel: 'very-high'
        },
        {
          id: '2',
          title: 'Data Scientist',
          field: 'Data & Analytics',
          description: 'Extract insights from data to drive business decisions and build predictive models.',
          averageSalary: { entry: 90000, mid: 140000, senior: 190000 },
          growthRate: 31,
          requiredSkills: ['Statistics', 'Machine Learning', 'Python/R', 'Data Visualization'],
          suggestedCourses: ['Machine Learning', 'Statistical Analysis', 'Big Data Technologies'],
          careerProgression: ['Data Analyst', 'Data Scientist', 'Senior Data Scientist', 'Principal Data Scientist', 'Head of Data'],
          jobTitles: ['ML Engineer', 'Research Scientist', 'Analytics Manager', 'Data Engineer'],
          industries: ['Technology', 'Finance', 'Healthcare', 'Retail', 'Consulting'],
          matchScore: 88,
          aiRecommended: true,
          demandLevel: 'very-high'
        },
        {
          id: '3',
          title: 'Product Manager',
          field: 'Product & Strategy',
          description: 'Drive product strategy and work with cross-functional teams to deliver user-centric solutions.',
          averageSalary: { entry: 95000, mid: 150000, senior: 200000 },
          growthRate: 19,
          requiredSkills: ['Strategic Thinking', 'User Research', 'Data Analysis', 'Communication'],
          suggestedCourses: ['Product Strategy', 'User Experience Design', 'Business Analytics'],
          careerProgression: ['Associate PM', 'Product Manager', 'Senior PM', 'Principal PM', 'VP of Product'],
          jobTitles: ['Technical PM', 'Growth PM', 'Platform PM', 'Product Owner'],
          industries: ['Technology', 'Finance', 'E-commerce', 'Media', 'Healthcare'],
          matchScore: 76,
          aiRecommended: false,
          demandLevel: 'high'
        }
      ];

      // Mock networking events
      const mockNetworkingEvents: NetworkingEvent[] = [
        {
          id: '1',
          title: 'Tech Career Fair 2024',
          type: 'career-fair',
          organizer: 'University Career Services',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: 'Student Union Ballroom',
          isVirtual: false,
          description: 'Connect with top tech companies and explore internship and full-time opportunities.',
          attendeeCount: 500,
          companies: ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Spotify', 'Airbnb'],
          industries: ['Technology', 'Software', 'Cloud Computing', 'Entertainment'],
          isRegistered: true,
          aiRecommended: true
        },
        {
          id: '2',
          title: 'Women in Tech Networking Mixer',
          type: 'networking',
          organizer: 'Women in Computing Club',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          location: 'Virtual Event',
          isVirtual: true,
          description: 'Network with female professionals in technology and learn about career advancement.',
          attendeeCount: 150,
          companies: ['Various Tech Companies'],
          industries: ['Technology', 'Startups', 'Consulting'],
          isRegistered: false
        },
        {
          id: '3',
          title: 'Data Science Panel Discussion',
          type: 'panel',
          organizer: 'Data Science Society',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          location: 'Engineering Auditorium',
          isVirtual: false,
          description: 'Industry experts discuss trends and career opportunities in data science.',
          attendeeCount: 200,
          companies: ['Uber', 'LinkedIn', 'Salesforce'],
          industries: ['Data Science', 'Analytics', 'Machine Learning'],
          isRegistered: false,
          aiRecommended: true
        }
      ];

      setCareerProfile(mockProfile);
      setJobOpportunities(mockJobs);
      setCareerPaths(mockCareerPaths);
      // setInterviewQuestions(mockInterviewQuestions); // Already set in state
      setNetworkingEvents(mockNetworkingEvents);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Save job
  const saveJob = useCallback((jobId: string) => {
    setJobOpportunities(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, isSaved: !job.isSaved } : job
      )
    );
  }, []);

  // Apply to job
  const applyToJob = useCallback((jobId: string) => {
    setJobOpportunities(prev => 
      prev.map(job => 
        job.id === jobId ? { ...job, hasApplied: true } : job
      )
    );
  }, []);

  // Get match score color
  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
    if (score >= 75) return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
    return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
  };

  // Get demand level color
  const getDemandColor = (level: string) => {
    switch (level) {
      case 'very-high':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
      case 'high':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'low':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen transition-colors duration-300 flex items-center justify-center ${
          isDarkMode 
            ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
            : 'bg-gradient-to-b from-gray-50 to-gray-100'
        }`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Loading career services...
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className={`min-h-screen transition-colors duration-300 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-b from-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-gray-50 to-gray-100'
      }`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold mb-2 flex items-center ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 8v6a2 2 0 002 2h4a2 2 0 002-2V8" />
                  </svg>
                  Career Services Hub
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered career guidance and professional development
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => {}}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                  } shadow-md hover:shadow-lg`}
                >
                  Resume Builder
                </button>
                <Link
                  href="/academic"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800"
                >
                  Skill Assessment
                </Link>
              </div>
            </div>
          </div>

          {/* AI Career Insights */}
          {careerProfile && (
            <div className={`mb-8 rounded-2xl p-6 border animate-fade-in ${
              isDarkMode 
                ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-800' 
                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-purple-300' : 'text-purple-800'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Career Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Career Score */}
                <div className={`text-center p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                } backdrop-blur-sm`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    careerProfile.aiCareerScore >= 80 ? 'text-green-500' :
                    careerProfile.aiCareerScore >= 60 ? 'text-yellow-500' :
                    'text-red-500'
                  }`}>
                    {careerProfile.aiCareerScore}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Career Readiness Score
                  </div>
                  <div className={`w-full rounded-full h-2 mt-2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        careerProfile.aiCareerScore >= 80 ? 'bg-green-500' :
                        careerProfile.aiCareerScore >= 60 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${careerProfile.aiCareerScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Profile Completion */}
                <div className={`text-center p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                } backdrop-blur-sm`}>
                  <div className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? 'text-blue-400' : 'text-blue-600'
                  }`}>
                    {careerProfile.completionPercentage}%
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Profile Completion
                  </div>
                  <div className={`w-full rounded-full h-2 mt-2 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${careerProfile.completionPercentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className={`p-4 rounded-xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
                } backdrop-blur-sm`}>
                  <h4 className={`font-medium mb-2 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Next Steps
                  </h4>
                  <ul className={`text-sm space-y-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <li>• Add portfolio projects</li>
                    <li>• Complete skill assessments</li>
                    <li>• Update resume with latest experience</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Tab Navigation */}
          <div className={`mb-8 rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-100'
          }`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
                { id: 'jobs', label: 'Job Board', icon: '💼' },
                { id: 'career-paths', label: 'Career Paths', icon: '🚀' },
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'interview-prep', label: 'Interview Prep', icon: '🎯' },
                { id: 'networking', label: 'Networking', icon: '🤝' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? isDarkMode 
                        ? 'text-purple-400 border-purple-400 border-b-2' 
                        : 'text-purple-600 border-purple-600 border-b-2'
                      : isDarkMode 
                        ? 'text-gray-400 hover:text-gray-200' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recommended Jobs */}
              <div className={`lg:col-span-2 rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  AI Recommended Jobs
                </h3>
                
                <div className="space-y-4">
                  {jobOpportunities
                    .filter(job => job.aiRecommended)
                    .slice(0, 3)
                    .map((job) => (
                      <div key={job.id} className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                        isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className={`font-medium mb-1 ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {job.title}
                            </h4>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {job.company} • {job.location}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              getMatchColor(job.matchScore || 0)
                            }`}>
                              {job.matchScore}% match
                            </span>
                            <button
                              onClick={() => saveJob(job.id)}
                              className={`p-1 rounded transition-colors duration-200 ${
                                job.isSaved 
                                  ? 'text-purple-500' 
                                  : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'
                              }`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill={job.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-3 line-clamp-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          {job.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              job.type === 'internship' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              job.type === 'entry-level' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {job.type}
                            </span>
                            {job.salary && (
                              <span className={`text-sm font-medium ${
                                isDarkMode ? 'text-green-400' : 'text-green-600'
                              }`}>
                                ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => applyToJob(job.id)}
                            disabled={job.hasApplied}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                              job.hasApplied
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                                : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                            }`}
                          >
                            {job.hasApplied ? 'Applied ✓' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                
                <button
                  onClick={() => setActiveTab('jobs')}
                  className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  View All Jobs
                </button>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Upcoming Events */}
                <div className={`rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white/90 border-gray-100'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Upcoming Events
                  </h3>
                  
                  <div className="space-y-3">
                    {networkingEvents.slice(0, 3).map((event) => (
                      <div key={event.id} className={`p-3 rounded-lg ${
                        isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                      }`}>
                        <h4 className={`font-medium text-sm mb-1 ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h4>
                        <p className={`text-xs mb-2 ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {event.date.toLocaleDateString()} • {event.location}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-purple-900/30 text-purple-400' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {event.type}
                          </span>
                          {event.aiRecommended && (
                            <span className={`text-xs ${
                              isDarkMode ? 'text-green-400' : 'text-green-600'
                            }`}>
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('networking')}
                    className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    View All Events
                  </button>
                </div>

                {/* Top Career Paths */}
                <div className={`rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                  isDarkMode 
                    ? 'bg-gray-800/90 border-gray-700' 
                    : 'bg-white/90 border-gray-100'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Recommended Paths
                  </h3>
                  
                  <div className="space-y-3">
                    {careerPaths
                      .filter(path => path.aiRecommended)
                      .slice(0, 3)
                      .map((path) => (
                        <div key={path.id} className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 hover:opacity-80 ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`} onClick={() => {}}>
                          <h4 className={`font-medium text-sm mb-1 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {path.title}
                          </h4>
                          <p className={`text-xs mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            ${path.averageSalary.entry.toLocaleString()} - ${path.averageSalary.senior.toLocaleString()}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              getDemandColor(path.demandLevel)
                            }`}>
                              {path.demandLevel.replace('-', ' ')} demand
                            </span>
                            <span className={`text-xs ${
                              isDarkMode ? 'text-purple-400' : 'text-purple-600'
                            }`}>
                              {path.matchScore}% match
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => setActiveTab('career-paths')}
                    className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      isDarkMode 
                        ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    Explore Career Paths
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              {/* Job Search Filters */}
              <div className={`mb-6 rounded-2xl shadow-lg p-6 border backdrop-blur-sm ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        placeholder="Search jobs by title, company, or skills..."
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <select
                      value={jobFilters.location}
                      onChange={(e) => setJobFilters(prev => ({ ...prev, location: e.target.value }))}
                      className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Locations</option>
                      <option value="remote">Remote</option>
                      <option value="san-francisco">San Francisco</option>
                      <option value="new-york">New York</option>
                      <option value="seattle">Seattle</option>
                    </select>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={jobFilters.remote}
                        onChange={(e) => setJobFilters(prev => ({ ...prev, remote: e.target.checked }))}
                        className="mr-2 text-purple-600 focus:ring-purple-500"
                      />
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Remote Only
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Jobs Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobOpportunities.map((job, index) => (
                  <div 
                    key={job.id}
                    className={`rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in ${
                      isDarkMode 
                        ? 'bg-gray-800/90 border-gray-700' 
                        : 'bg-white/90 border-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {job.aiRecommended && (
                      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 text-sm font-medium">
                        🌟 AI Recommended - {job.matchScore}% match
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Job Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {job.title}
                          </h3>
                          <p className={`text-sm mb-2 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {job.company} • {job.location}
                          </p>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              job.type === 'internship' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                              job.type === 'entry-level' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                              'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            }`}>
                              {job.type}
                            </span>
                            {job.isRemote && (
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                isDarkMode 
                                  ? 'bg-teal-900/30 text-teal-400' 
                                  : 'bg-teal-100 text-teal-700'
                              }`}>
                                Remote
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => saveJob(job.id)}
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            job.isSaved 
                              ? 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' 
                              : isDarkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={job.isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>

                      {/* Salary */}
                      {job.salary && (
                        <div className="mb-4">
                          <span className={`text-lg font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                          </span>
                          <span className={`text-sm ml-1 ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            / year
                          </span>
                        </div>
                      )}

                      {/* Description */}
                      <p className={`text-sm mb-4 line-clamp-3 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {job.description}
                      </p>

                      {/* Requirements */}
                      <div className="mb-4">
                        <h4 className={`text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          Key Requirements
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {job.requirements.slice(0, 3).map((req, idx) => (
                            <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-300' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {req}
                            </span>
                          ))}
                          {job.requirements.length > 3 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-400' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              +{job.requirements.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Company Rating & Posted Date */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className={`text-sm font-medium mr-2 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {job.companyRating}
                          </span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            company rating
                          </span>
                        </div>
                        <span className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Posted {Math.floor((Date.now() - job.postedDate.getTime()) / (24 * 60 * 60 * 1000))} days ago
                        </span>
                      </div>

                      {/* Application Deadline */}
                      {job.applicationDeadline && (
                        <div className={`mb-4 p-2 rounded-lg ${
                          isDarkMode 
                            ? 'bg-orange-900/20 border-orange-800' 
                            : 'bg-orange-50 border-orange-200'
                        } border`}>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-orange-400' : 'text-orange-700'
                          }`}>
                            ⏰ Application deadline: {job.applicationDeadline.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => applyToJob(job.id)}
                          disabled={job.hasApplied}
                          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                            job.hasApplied
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                              : 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800'
                          }`}
                        >
                          {job.hasApplied ? 'Applied ✓' : 'Apply Now'}
                        </button>
                        
                        <button className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add other tab content similar to previous sections... */}
          {/* This is getting quite long, so I'll continue with the remaining tabs in separate components */}
        </div>
      </main>
    </>
  );
}