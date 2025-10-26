// src/app/academic/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface CalendarEvent {
  id: string;
  title: string;
  type: 'class' | 'assignment' | 'exam' | 'study' | 'meeting' | 'break';
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  course?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'completed' | 'missed' | 'in-progress';
  isAIGenerated?: boolean;
  conflictsWith?: string[];
}

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: Date;
  type: 'essay' | 'project' | 'quiz' | 'exam' | 'lab' | 'presentation';
  status: 'not-started' | 'in-progress' | 'completed' | 'submitted' | 'graded';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  completedHours: number;
  aiSuggestions?: string[];
  grade?: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  instructor: string;
  credits: number;
  schedule: CourseSchedule[];
  currentGrade?: number;
  assignments: Assignment[];
  nextClass?: Date;
}

interface CourseSchedule {
  day: string;
  startTime: string;
  endTime: string;
  location: string;
  type: 'lecture' | 'lab' | 'seminar' | 'tutorial';
}

interface AIRecommendation {
  id: string;
  type: 'study' | 'break' | 'review' | 'schedule' | 'location';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
  confidence: number;
}

type ActiveTab = 'calendar' | 'assignments' | 'courses' | 'analytics';

export default function AcademicPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);

  // Mock data
  const [courses, setCourses] = useState<Course[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Initialize mock data
  useEffect(() => {
    setTimeout(() => {
      // Mock courses
      const mockCourses: Course[] = [
        {
          id: '1',
          name: 'Software Engineering',
          code: 'IT 3030',
          instructor: 'Dr. Gihan Dias',
          credits: 3,
          currentGrade: 89,
          assignments: [],
          schedule: [
            { day: 'Monday', startTime: '10:00', endTime: '11:00', location: 'IT Faculty - Lecture Hall A', type: 'lecture' },
            { day: 'Wednesday', startTime: '10:00', endTime: '11:00', location: 'IT Faculty - Lecture Hall A', type: 'lecture' },
            { day: 'Friday', startTime: '14:00', endTime: '16:00', location: 'IT Faculty - Lab 1', type: 'lab' }
          ]
        },
        {
          id: '2',
          name: 'Database Management Systems',
          code: 'IT 3020',
          instructor: 'Dr. Chathura Rajapakse',
          credits: 3,
          currentGrade: 85,
          assignments: [],
          schedule: [
            { day: 'Tuesday', startTime: '14:00', endTime: '15:00', location: 'IT Faculty - Lecture Hall B', type: 'lecture' },
            { day: 'Thursday', startTime: '14:00', endTime: '15:00', location: 'IT Faculty - Lecture Hall B', type: 'lecture' },
            { day: 'Friday', startTime: '10:00', endTime: '12:00', location: 'IT Faculty - Database Lab', type: 'lab' }
          ]
        },
        {
          id: '3',
          name: 'Computer Networks',
          code: 'IT 3040',
          instructor: 'Prof. Sampath Deegalla',
          credits: 3,
          currentGrade: 92,
          assignments: [],
          schedule: [
            { day: 'Monday', startTime: '08:00', endTime: '09:00', location: 'IT Faculty - Lecture Hall C', type: 'lecture' },
            { day: 'Wednesday', startTime: '08:00', endTime: '09:00', location: 'IT Faculty - Lecture Hall C', type: 'lecture' },
            { day: 'Thursday', startTime: '10:00', endTime: '12:00', location: 'IT Faculty - Network Lab', type: 'lab' }
          ]
        },
        {
          id: '4',
          name: 'Human Computer Interaction',
          code: 'IT 3050',
          instructor: 'Dr. Dulani Meedeniya',
          credits: 2,
          currentGrade: 88,
          assignments: [],
          schedule: [
            { day: 'Tuesday', startTime: '10:00', endTime: '11:00', location: 'IT Faculty - Lecture Hall D', type: 'lecture' },
            { day: 'Thursday', startTime: '15:00', endTime: '17:00', location: 'IT Faculty - UX Lab', type: 'lab' }
          ]
        }
      ];

      // Mock assignments
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Software Requirements Analysis',
          course: 'IT 3030',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          type: 'project',
          status: 'in-progress',
          priority: 'high',
          estimatedHours: 8,
          completedHours: 5,
          aiSuggestions: [
            'Focus on use case diagrams during your next session',
            'Schedule review with group members before submission',
            'Visit Dr. Gihan Dias during office hours for clarification'
          ]
        },
        {
          id: '2',
          title: 'Database Design Project',
          course: 'IT 3020',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          type: 'project',
          status: 'in-progress',
          priority: 'medium',
          estimatedHours: 12,
          completedHours: 3,
          aiSuggestions: [
            'Start with ER diagram design this week',
            'Use MySQL Workbench for implementation',
            'Book Database Lab for hands-on testing'
          ]
        },
        {
          id: '3',
          title: 'Network Protocol Analysis',
          course: 'IT 3040',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          type: 'project',
          status: 'not-started',
          priority: 'high',
          estimatedHours: 6,
          completedHours: 0,
          aiSuggestions: [
            'Use Wireshark for packet analysis',
            'Focus on TCP/UDP protocols first',
            'Review lecture notes from Week 8'
          ]
        },
        {
          id: '4',
          title: 'UX Design Prototype',
          course: 'IT 3050',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          type: 'project',
          status: 'not-started',
          priority: 'medium',
          estimatedHours: 10,
          completedHours: 0,
          aiSuggestions: [
            'Start with user personas and journey mapping',
            'Use Figma or Adobe XD for prototyping',
            'Conduct user testing with classmates'
          ]
        }
      ];

      // Generate calendar events from courses and assignments
      const events: CalendarEvent[] = [];
      
      // Add regular class schedules for the next week
      mockCourses.forEach(course => {
        course.schedule.forEach(schedule => {
          const today = new Date();
          for (let i = 0; i < 14; i++) {
            const eventDate = new Date(today);
            eventDate.setDate(today.getDate() + i);
            
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            if (dayNames[eventDate.getDay()] === schedule.day) {
              const [startHour, startMin] = schedule.startTime.split(':').map(Number);
              const [endHour, endMin] = schedule.endTime.split(':').map(Number);
              
              const startTime = new Date(eventDate);
              startTime.setHours(startHour, startMin, 0, 0);
              
              const endTime = new Date(eventDate);
              endTime.setHours(endHour, endMin, 0, 0);
              
              events.push({
                id: `class-${course.id}-${i}-${schedule.day}`,
                title: `${course.code} - ${schedule.type}`,
                type: 'class',
                startTime,
                endTime,
                location: schedule.location,
                course: course.code,
                priority: 'high',
                status: 'scheduled'
              });
            }
          }
        });
      });

      // Add AI-generated study sessions
      const aiStudySessions: CalendarEvent[] = [
        {
          id: 'ai-study-1',
          title: 'CS 101 - Focused Study Session',
          type: 'study',
          startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
          location: 'Library Level 3',
          description: 'AI-optimized study session for data structures',
          priority: 'high',
          status: 'scheduled',
          isAIGenerated: true
        },
        {
          id: 'ai-break-1',
          title: 'Wellness Break',
          type: 'break',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3.5 * 60 * 60 * 1000),
          location: 'University Green',
          description: 'AI suggests a mindful walk to boost productivity',
          priority: 'medium',
          status: 'scheduled',
          isAIGenerated: true
        }
      ];

      events.push(...aiStudySessions);

      setCourses(mockCourses);
      setAssignments(mockAssignments);
      setCalendarEvents(events);
      
      // Generate AI recommendations
      const recommendations: AIRecommendation[] = [
        {
          id: '1',
          type: 'study',
          title: 'Optimize Study Schedule',
          description: 'AI detected that you&apos;re most productive 2-4 PM. Schedule CS project work during this window.',
          priority: 'high',
          action: 'Auto-schedule study blocks',
          confidence: 94
        },
        {
          id: '2',
          type: 'break',
          title: 'Schedule Strategic Breaks',
          description: 'Add 15-minute breaks every 90 minutes to maintain focus and retention.',
          priority: 'medium',
          action: 'Add break reminders',
          confidence: 87
        },
        {
          id: '3',
          type: 'review',
          title: 'Pre-emptive Review Sessions',
          description: 'Schedule review sessions 2 days before each quiz based on your performance patterns.',
          priority: 'medium',
          action: 'Create review schedule',
          confidence: 82
        }
      ];
      
      setAiRecommendations(recommendations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      case 'high':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-900/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      case 'low':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'class':
        return 'bg-blue-500 border-blue-500';
      case 'assignment':
        return 'bg-purple-500 border-purple-500';
      case 'exam':
        return 'bg-red-500 border-red-500';
      case 'study':
        return 'bg-green-500 border-green-500';
      case 'meeting':
        return 'bg-orange-500 border-orange-500';
      case 'break':
        return 'bg-teal-500 border-teal-500';
      default:
        return 'bg-gray-500 border-gray-500';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'submitted':
      case 'graded':
        return 'text-green-500 bg-green-100 dark:bg-green-900/30';
      case 'in-progress':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      case 'not-started':
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
      case 'missed':
        return 'text-red-500 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-500 bg-gray-100 dark:bg-gray-700';
    }
  };

  // Get events for today
  const getTodayEvents = () => {
    const today = new Date();
    return calendarEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === today.toDateString();
    }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  // Get upcoming assignments (next 7 days)
  const getUpcomingAssignments = () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    return assignments
      .filter(assignment => assignment.dueDate <= nextWeek && assignment.status !== 'completed')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  };

  // Calculate overall GPA
  const calculateGPA = () => {
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    const totalPoints = courses.reduce((sum, course) => {
      const gradePoints = course.currentGrade ? (course.currentGrade / 100) * 4 : 0;
      return sum + (gradePoints * course.credits);
    }, 0);
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 flex items-center justify-center`}>
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading your academic data...</p>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4l6 6m0-6l-6 6m6-6H4" />
                  </svg>
                  Academic Hub
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered academic planning and smart scheduling
                </p>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 md:mt-0 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    {calculateGPA()}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>GPA</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    {courses.length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Courses</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                    {getUpcomingAssignments().length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Due Soon</p>
                </div>
                <div className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'}`}>
                  <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    {getTodayEvents().length}
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Today</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          {aiRecommendations.length > 0 && (
            <div className={`mb-8 ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} rounded-2xl p-6 border animate-fade-in`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                AI Academic Recommendations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {aiRecommendations.map((rec) => (
                  <div key={rec.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'} border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{rec.title}</h4>
                      <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
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
          <div className={`mb-8 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'calendar', label: 'Smart Calendar', icon: '📅' },
                { id: 'assignments', label: 'Assignments', icon: '📝' },
                { id: 'courses', label: 'Courses', icon: '📚' },
                { id: 'analytics', label: 'Performance', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? `${isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'} border-b-2`
                      : `${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'}`
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Today's Schedule */}
              <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    Today&apos;s Schedule
                  </h3>
                  <button
                    onClick={() => setShowAddEventModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    + Add Event
                  </button>
                </div>
                
                <div className="space-y-4">
                  {getTodayEvents().length > 0 ? (
                    getTodayEvents().map((event) => (
                      <div key={event.id} className={`p-4 rounded-lg border-l-4 ${getEventTypeColor(event.type)} ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {event.title}
                              </h4>
                              {event.isAIGenerated && (
                                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                  AI
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                              {event.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                              {event.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {event.location && (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                📍 {event.location}
                              </p>
                            )}
                            {event.description && (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                                {event.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="ml-4 flex flex-col items-end">
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(event.priority)}`}>
                              {event.priority}
                            </span>
                            {event.location && (
                              <Link
                                href={`/navigation?destination=${encodeURIComponent(event.location)}`}
                                className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 mt-2"
                              >
                                Get Directions
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        No events scheduled for today
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Assignments */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Upcoming Assignments
                </h3>
                
                <div className="space-y-4">
                  {getUpcomingAssignments().slice(0, 5).map((assignment) => (
                    <div key={assignment.id} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-sm`}>
                          {assignment.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority}
                        </span>
                      </div>
                      
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        {assignment.course} • Due {assignment.dueDate.toLocaleDateString()}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              assignment.status === 'completed' ? 'bg-green-500' :
                              assignment.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${(assignment.completedHours / assignment.estimatedHours) * 100}%` }}
                          ></div>
                        </div>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {assignment.completedHours}/{assignment.estimatedHours} hours
                        </p>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(assignment.status)}`}>
                        {assignment.status.replace('-', ' ')}
                      </span>
                    </div>
                  ))}
                  
                  <Link 
                    href="/assignments"
                    className="block text-center text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium mt-4"
                  >
                    View All Assignments →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  All Assignments
                </h3>
                
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {assignment.title}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {assignment.course} • {assignment.type} • Due {assignment.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
                          <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {assignment.completedHours}/{assignment.estimatedHours} hours
                          </span>
                        </div>
                        <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              assignment.status === 'completed' ? 'bg-green-500' :
                              assignment.status === 'in-progress' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${Math.min((assignment.completedHours / assignment.estimatedHours) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* AI Suggestions */}
                      {assignment.aiSuggestions && assignment.aiSuggestions.length > 0 && (
                        <div className={`mt-3 p-3 rounded-lg ${isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
                          <h5 className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-800'} mb-2 flex items-center`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            AI Suggestions
                          </h5>
                          <ul className="space-y-1">
                            {assignment.aiSuggestions.map((suggestion, index) => (
                              <li key={index} className={`text-sm ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`}>
                                • {suggestion}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Actions */}
                      <div className="flex space-x-2 mt-4">
                        <button className="px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                          Schedule Work
                        </button>
                        <Link
                          href={`/study-spaces?subject=${encodeURIComponent(assignment.course)}`}
                          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Find Study Space
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assignment Insights */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Assignment Insights
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                      Priority Distribution
                    </h4>
                    <div className="space-y-2">
                      {['high', 'medium', 'low'].map((priority) => {
                        const count = assignments.filter(a => a.priority === priority && a.status !== 'completed').length;
                        return (
                          <div key={priority} className="flex items-center justify-between">
                            <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {priority}
                            </span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                      Workload This Week
                    </h4>
                    <p className={`text-2xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {assignments.reduce((total, assignment) => {
                        if (assignment.status !== 'completed') {
                          return total + (assignment.estimatedHours - assignment.completedHours);
                        }
                        return total;
                      }, 0)} hours
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Remaining work
                    </p>
                  </div>

                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-2`}>
                      AI Productivity Tip
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                      Based on your patterns, you&apos;re most productive from 2-4 PM. Consider scheduling your CS project work during this time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div 
                  key={course.id}
                  className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-1`}>
                        {course.code}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {course.name}
                      </p>
                    </div>
                    
                    {course.currentGrade && (
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          course.currentGrade >= 90 ? 'text-green-500' :
                          course.currentGrade >= 80 ? 'text-blue-500' :
                          course.currentGrade >= 70 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {course.currentGrade}%
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          Current Grade
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Instructor:</span> {course.instructor}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="font-medium">Credits:</span> {course.credits}
                    </p>
                  </div>
                  
                  {/* Schedule */}
                  <div className="mb-4">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                      Schedule
                    </h4>
                    <div className="space-y-1">
                      {course.schedule.map((schedule, idx) => (
                        <div key={idx} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {schedule.day} {schedule.startTime}-{schedule.endTime}
                          <br />
                          <span className="text-xs">{schedule.location}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="flex space-x-2">
                    <Link
                      href={`/study-spaces?subject=${encodeURIComponent(course.code)}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-center bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                    >
                      Study
                    </Link>
                    <Link
                      href={`/navigation?destination=${encodeURIComponent(course.schedule[0]?.location || '')}`}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-center ${
                        isDarkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Navigate
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Overview */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Academic Performance
                </h3>
                
                <div className="space-y-6">
                  {/* GPA Trend */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Current Semester GPA
                    </h4>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {calculateGPA()}
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Out of 4.0
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm px-2 py-1 rounded-full ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                          📈 +0.15 from last semester
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Performance */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Course Performance
                    </h4>
                    <div className="space-y-3">
                      {courses.map((course) => (
                        <div key={course.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {course.code}
                            </span>
                            <span className={`font-medium ${
                              course.currentGrade && course.currentGrade >= 90 ? 'text-green-500' :
                              course.currentGrade && course.currentGrade >= 80 ? 'text-blue-500' :
                              course.currentGrade && course.currentGrade >= 70 ? 'text-yellow-500' :
                              'text-red-500'
                            }`}>
                              {course.currentGrade}%
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                course.currentGrade && course.currentGrade >= 90 ? 'bg-green-500' :
                                course.currentGrade && course.currentGrade >= 80 ? 'bg-blue-500' :
                                course.currentGrade && course.currentGrade >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${course.currentGrade || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Study Analytics */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in`}>
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6`}>
                  Study Analytics
                </h3>
                
                <div className="space-y-6">
                  {/* Study Time Distribution */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Study Time This Week
                    </h4>
                    <div className="space-y-3">
                      {courses.map((course) => {
                        const studyHours = Math.floor(Math.random() * 8) + 2; // Mock data
                        return (
                          <div key={course.id} className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {course.code}
                            </span>
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                              {studyHours}h
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Productivity Insights */}
                  <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                    <h4 className={`font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} mb-3`}>
                      AI Productivity Insights
                    </h4>
                    <ul className="space-y-2">
                      <li className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        • Peak productivity: 2:00-4:00 PM
                      </li>
                      <li className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        • Most effective study location: Library Level 3
                      </li>
                      <li className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        • Recommended break interval: 90 minutes
                      </li>
                      <li className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                        • Best study technique: Pomodoro for Math, Active recall for CS
                      </li>
                    </ul>
                  </div>

                  {/* Goals Progress */}
                  <div>
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                      Academic Goals Progress
                    </h4>
                    <div className="space-y-3">
                      {[
                        { goal: 'Maintain 3.5+ GPA', progress: 85, current: '3.62' },
                        { goal: 'Complete all assignments on time', progress: 90, current: '90%' },
                        { goal: 'Study 20 hours/week', progress: 75, current: '15h' }
                      ].map((goal, index) => (
                        <div key={index} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {goal.goal}
                            </span>
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {goal.current}
                            </span>
                          </div>
                          <div className={`w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2`}>
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                goal.progress >= 85 ? 'bg-green-500' :
                                goal.progress >= 70 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Event Modal */}
        {showAddEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-6`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  Add Calendar Event
                </h2>
                <button 
                  onClick={() => setShowAddEventModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Event Title
                  </label>
                  <input 
                    type="text" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Event Type
                  </label>
                  <select className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}>
                    <option value="study">Study Session</option>
                    <option value="assignment">Assignment Work</option>
                    <option value="meeting">Meeting</option>
                    <option value="break">Break</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Start Time
                    </label>
                    <input 
                      type="datetime-local" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      End Time
                    </label>
                    <input 
                      type="datetime-local" 
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Location (Optional)
                  </label>
                  <input 
                    type="text" 
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    placeholder="Enter location"
                  />
                </div>
                
                <button
                  onClick={() => {
                    setShowAddEventModal(false);
                    // A custom modal or toast notification would be better than alert() in a real app
                  }}
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
