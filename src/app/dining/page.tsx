// src/app/dining/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';

// --- Interfaces ---
interface DiningHall {
  id: string;
  name: string;
  location: string;
  building: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  currentCrowd: 'low' | 'medium' | 'high' | 'very-high';
  predictedCrowd: { time: string; level: 'low' | 'medium' | 'high' | 'very-high' }[];
  menuTypes: string[];
  specialties: string[];
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$';
  features: string[];
  image?: string;
  aiRecommended?: boolean;
  walkTime: number; // minutes
}

interface MenuItem {
  id: string;
  name: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snacks' | 'beverages' | 'desserts';
  diningHall: string;
  price: number;
  description: string;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
  };
  dietaryTags: string[];
  rating: number;
  reviewCount: number;
  availability: 'available' | 'limited' | 'out-of-stock';
  preparationTime: number; // minutes
  isHealthy: boolean;
  aiScore?: number;
}

interface MealPlan {
  id: string;
  date: Date;
  breakfast?: MenuItem;
  lunch?: MenuItem;
  dinner?: MenuItem;
  snacks: MenuItem[];
  totalCalories: number;
  totalCost: number;
  nutritionalBalance: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  aiGenerated: boolean;
}

interface DietaryPreference {
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
  halal: boolean;
  kosher: boolean;
  lowSodium: boolean;
  lowCarb: boolean;
  keto: boolean;
}

interface NutritionGoal {
  dailyCalories: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;
  maxSodium: number;
  minFiber: number;
}

type ActiveTab = 'dining-halls' | 'menu' | 'meal-plan' | 'nutrition';
type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export default function DiningPage() {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dining-halls');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMealTime, setSelectedMealTime] = useState<MealTime>('lunch');
  const [selectedDiningHall, setSelectedDiningHall] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);

  // User preferences and data
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreference>({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false,
    nutFree: false,
    halal: false,
    kosher: false,
    lowSodium: false,
    lowCarb: false,
    keto: false
  });

  const [nutritionGoals] = useState<NutritionGoal>({
    dailyCalories: 2000,
    proteinPercentage: 25,
    carbsPercentage: 50,
    fatPercentage: 25,
    maxSodium: 2300,
    minFiber: 25
  });

  // Mock data
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);

  // Initialize component
  useEffect(() => {
    setTimeout(() => {
      // Mock dining halls data
      const mockDiningHalls: DiningHall[] = [
        {
          id: '1',
          name: 'Main Canteen',
          location: 'Near Main Library',
          building: 'Student Center',
          isOpen: true,
          openingTime: '07:00',
          closingTime: '18:00',
          currentCrowd: 'medium',
          predictedCrowd: [
            { time: '12:00', level: 'very-high' },
            { time: '13:00', level: 'high' },
            { time: '14:00', level: 'medium' },
            { time: '08:00', level: 'high' },
            { time: '16:00', level: 'low' }
          ],
          menuTypes: ['Sri Lankan Rice & Curry', 'Short Eats', 'Beverages'],
          specialties: ['Rice & Curry', 'Kottu', 'String Hoppers', 'Tea'],
          rating: 4.2,
          reviewCount: 847,
          priceRange: '$',
          features: ['Cash only', 'Local cuisine', 'Student discounts'],
          aiRecommended: true,
          walkTime: 2
        },
        {
          id: '2',
          name: 'IT Faculty Cafeteria',
          location: 'Faculty of IT Building',
          building: 'IT',
          isOpen: true,
          openingTime: '08:00',
          closingTime: '17:00',
          currentCrowd: 'low',
          predictedCrowd: [
            { time: '10:00', level: 'medium' },
            { time: '15:00', level: 'medium' },
            { time: '12:00', level: 'high' }
          ],
          menuTypes: ['Quick Bites', 'Beverages', 'Snacks'],
          specialties: ['Tea', 'Coffee', 'Sandwiches', 'Pastries'],
          rating: 4.0,
          reviewCount: 312,
          priceRange: '$',
          features: ['Quick service', 'Study-friendly environment'],
          walkTime: 5
        },
        {
          id: '3',
          name: 'Engineering Canteen',
          location: 'Faculty of Engineering',
          building: 'ENG',
          isOpen: true,
          openingTime: '07:30',
          closingTime: '17:30',
          currentCrowd: 'medium',
          predictedCrowd: [
            { time: '08:00', level: 'high' },
            { time: '12:30', level: 'very-high' },
            { time: '16:00', level: 'medium' }
          ],
          menuTypes: ['Rice & Curry', 'Hoppers', 'Roti'],
          specialties: ['Hoppers', 'Roti', 'Dhal Curry'],
          rating: 4.1,
          reviewCount: 523,
          priceRange: '$',
          features: ['Traditional breakfast', 'Local specialties'],
          walkTime: 8
        }
      ];

      // Mock menu items
      const mockMenuItems: MenuItem[] = [
        {
          id: '1',
          name: 'Mediterranean Quinoa Bowl',
          category: 'lunch',
          diningHall: 'Wellness Kitchen',
          price: 12.99,
          description: 'Fresh quinoa bowl with grilled vegetables, chickpeas, feta cheese, and tahini dressing',
          ingredients: ['Quinoa', 'Bell peppers', 'Chickpeas', 'Feta cheese', 'Cucumber', 'Tahini'],
          allergens: ['Dairy', 'Sesame'],
          nutritionalInfo: {
            calories: 520,
            protein: 18,
            carbs: 65,
            fat: 16,
            fiber: 12,
            sodium: 680
          },
          dietaryTags: ['Vegetarian', 'High-protein', 'Gluten-free'],
          rating: 4.6,
          reviewCount: 89,
          availability: 'available',
          preparationTime: 8,
          isHealthy: true,
          aiScore: 92
        },
        {
          id: '2',
          name: 'Classic Cheeseburger',
          category: 'lunch',
          diningHall: 'Central Dining Commons',
          price: 8.99,
          description: 'Beef patty with cheddar cheese, lettuce, tomato, and special sauce on a brioche bun',
          ingredients: ['Beef patty', 'Cheddar cheese', 'Brioche bun', 'Lettuce', 'Tomato', 'Special sauce'],
          allergens: ['Gluten', 'Dairy', 'Eggs'],
          nutritionalInfo: {
            calories: 650,
            protein: 28,
            carbs: 45,
            fat: 38,
            fiber: 3,
            sodium: 1200
          },
          dietaryTags: ['High-protein'],
          rating: 4.1,
          reviewCount: 234,
          availability: 'available',
          preparationTime: 12,
          isHealthy: false,
          aiScore: 65
        },
        {
          id: '3',
          name: 'Acai Smoothie Bowl',
          category: 'breakfast',
          diningHall: 'Wellness Kitchen',
          price: 9.99,
          description: 'Acai berry smoothie bowl topped with granola, fresh berries, and coconut flakes',
          ingredients: ['Acai berries', 'Banana', 'Granola', 'Blueberries', 'Strawberries', 'Coconut flakes'],
          allergens: ['Tree nuts'],
          nutritionalInfo: {
            calories: 380,
            protein: 8,
            carbs: 72,
            fat: 12,
            fiber: 15,
            sodium: 45
          },
          dietaryTags: ['Vegan', 'Gluten-free', 'Antioxidant-rich'],
          rating: 4.8,
          reviewCount: 156,
          availability: 'available',
          preparationTime: 5,
          isHealthy: true,
          aiScore: 88
        },
        {
          id: '4',
          name: 'Chicken Caesar Salad',
          category: 'lunch',
          diningHall: 'Central Dining Commons',
          price: 10.99,
          description: 'Grilled chicken breast over romaine lettuce with parmesan, croutons, and caesar dressing',
          ingredients: ['Grilled chicken', 'Romaine lettuce', 'Parmesan cheese', 'Croutons', 'Caesar dressing'],
          allergens: ['Dairy', 'Gluten', 'Fish'],
          nutritionalInfo: {
            calories: 480,
            protein: 35,
            carbs: 18,
            fat: 28,
            fiber: 4,
            sodium: 890
          },
          dietaryTags: ['High-protein', 'Low-carb'],
          rating: 4.3,
          reviewCount: 178,
          availability: 'available',
          preparationTime: 7,
          isHealthy: true,
          aiScore: 78
        },
        {
          id: '5',
          name: 'Artisan Coffee',
          category: 'beverages',
          diningHall: 'North Campus Café',
          price: 4.50,
          description: 'Freshly roasted single-origin coffee beans, available hot or iced',
          ingredients: ['Coffee beans', 'Water'],
          allergens: [],
          nutritionalInfo: {
            calories: 5,
            protein: 0,
            carbs: 1,
            fat: 0,
            fiber: 0,
            sodium: 5
          },
          dietaryTags: ['Vegan', 'Gluten-free', 'Low-calorie'],
          rating: 4.7,
          reviewCount: 445,
          availability: 'available',
          preparationTime: 3,
          isHealthy: true,
          aiScore: 85
        },
        {
          id: '6',
          name: 'Midnight Ramen',
          category: 'dinner',
          diningHall: 'Late Night Eats',
          price: 7.99,
          description: 'Rich tonkotsu ramen with soft-boiled egg, green onions, and bamboo shoots',
          ingredients: ['Ramen noodles', 'Pork broth', 'Soft-boiled egg', 'Green onions', 'Bamboo shoots'],
          allergens: ['Gluten', 'Eggs', 'Soy'],
          nutritionalInfo: {
            calories: 580,
            protein: 22,
            carbs: 65,
            fat: 24,
            fiber: 4,
            sodium: 1850
          },
          dietaryTags: ['Comfort food'],
          rating: 4.0,
          reviewCount: 267,
          availability: 'available',
          preparationTime: 15,
          isHealthy: false,
          aiScore: 58
        }
      ];

      // Generate AI meal plan
      const mockMealPlan: MealPlan = {
        id: '1',
        date: new Date(),
        breakfast: mockMenuItems[2], // Acai Bowl
        lunch: mockMenuItems[0], // Mediterranean Quinoa Bowl
        dinner: mockMenuItems[3], // Chicken Caesar Salad
        snacks: [mockMenuItems[4]], // Artisan Coffee
        totalCalories: 1385,
        totalCost: 37.47,
        nutritionalBalance: {
          protein: 22,
          carbs: 55,
          fat: 18,
          fiber: 35
        },
        aiGenerated: true
      };

      setDiningHalls(mockDiningHalls);
      setMenuItems(mockMenuItems);
      setCurrentMealPlan(mockMealPlan);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Get crowd level color
  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/30 dark:border-green-800';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-800';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-900/30 dark:border-orange-800';
      case 'very-high':
        return 'text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/30 dark:border-red-800';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  // Get price range color
  const getPriceColor = (range: string) => {
    switch (range) {
      case '$':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30';
      case '$$':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30';
      case '$$$':
        return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-700';
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    if (selectedDiningHall !== 'all' && item.diningHall !== selectedDiningHall) return false;
    if (selectedMealTime !== 'snacks' && item.category !== selectedMealTime) return false;
    if (selectedMealTime === 'snacks' && !['snacks', 'beverages', 'desserts'].includes(item.category)) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.dietaryTags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Generate AI meal plan
  const generateAIMealPlan = useCallback(() => {
    // Here you would call your AI service
    console.log('Generating AI meal plan with preferences:', dietaryPreferences, nutritionGoals);
    // For now, just show the modal
    setShowMealPlanModal(true);
  }, [dietaryPreferences, nutritionGoals]);

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
              Loading dining options...
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm0 0V6a2 2 0 00-2-2h2zM12 8V3" />
                  </svg>
                  Dining & Meal Planning
                </h1>
                <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  AI-powered dining recommendations and personalized meal planning
                </p>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 md:mt-0 flex space-x-3">
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  } shadow-md hover:shadow-lg`}
                >
                  Dietary Preferences
                </button>
                <button
                  onClick={generateAIMealPlan}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:from-purple-700 hover:to-purple-800"
                >
                  Generate AI Meal Plan
                </button>
              </div>
            </div>
          </div>

          {/* AI Recommendations */}
          <div className={`mb-8 rounded-2xl p-6 border animate-fade-in ${
            isDarkMode 
              ? 'bg-purple-900/20 border-purple-800' 
              : 'bg-purple-50 border-purple-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${
              isDarkMode ? 'text-purple-300' : 'text-purple-800'
            }`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              AI Dining Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: 'Optimal Dining Time',
                  description: 'Based on crowd patterns, visit Central Dining Commons at 2:30 PM for shorter lines.',
                  action: 'View Crowd Predictions'
                },
                {
                  title: 'Nutrition Alert',
                  description: 'You&apos;re low on protein today. Try the Mediterranean Quinoa Bowl for balanced nutrition.',
                  action: 'See Recommendations'
                },
                {
                  title: 'Budget Optimization',
                  description: 'Switch to North Campus Café today to stay within your weekly dining budget.',
                  action: 'View Budget Tracker'
                }
              ].map((rec, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700' 
                    : 'bg-white/50 border-gray-200'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className={`text-sm mb-3 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {rec.description}
                  </p>
                  <button className={`text-sm font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-purple-400 hover:text-purple-300' 
                      : 'text-purple-600 hover:text-purple-700'
                  }`}>
                    {rec.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`mb-8 rounded-2xl shadow-lg border backdrop-blur-sm animate-fade-in ${
            isDarkMode 
              ? 'bg-gray-800/90 border-gray-700' 
              : 'bg-white/90 border-gray-100'
          }`}>
            <div className="flex overflow-x-auto">
              {[
                { id: 'dining-halls', label: 'Dining Halls', icon: '🏢' },
                { id: 'menu', label: 'Menu Browser', icon: '🍽️' },
                { id: 'meal-plan', label: 'Meal Planning', icon: '📅' },
                { id: 'nutrition', label: 'Nutrition Tracker', icon: '📊' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className={`flex-1 px-6 py-4 font-medium transition-colors duration-200 ${
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
          {activeTab === 'dining-halls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {diningHalls.map((hall, index) => (
                <div 
                  key={hall.id}
                  className={`rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in ${
                    isDarkMode 
                      ? 'bg-gray-800/90 border-gray-700' 
                      : 'bg-white/90 border-gray-100'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {hall.aiRecommended && (
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 text-sm font-medium">
                      ⭐ AI Recommended - Perfect for your preferences
                    </div>
                  )}
                  
                  <div className="p-6">
                    {/* Hall Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-1 ${
                          isDarkMode ? 'text-gray-100' : 'text-gray-900'
                        }`}>
                          {hall.name}
                        </h3>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {hall.location} • {hall.walkTime} min walk
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hall.isOpen
                            ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                            : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
                        }`}>
                          {hall.isOpen ? 'Open' : 'Closed'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getPriceColor(hall.priceRange)}`}>
                          {hall.priceRange}
                        </span>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="mb-4">
                      <p className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        🕒 {hall.openingTime} - {hall.closingTime}
                      </p>
                    </div>

                    {/* Current Crowd */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          Current Crowd Level
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full border font-medium capitalize ${getCrowdColor(hall.currentCrowd)}`}>
                          {hall.currentCrowd}
                        </span>
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="mb-4">
                      <h4 className={`text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        Specialties
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hall.specialties.map((specialty, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-gray-700 text-gray-300' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Rating & Features */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className={`text-sm font-medium mr-1 ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {hall.rating}
                          </span>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            ({hall.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedDiningHall(hall.name);
                          setActiveTab('menu');
                        }}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                      >
                        View Menu
                      </button>
                      
                      <Link
                        href={`/navigation?destination=${encodeURIComponent(hall.location)}`}
                        className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isDarkMode 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </Link>
                    </div>

                    {/* Crowd Predictions */}
                    {hall.predictedCrowd.length > 0 && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        isDarkMode 
                          ? 'bg-gray-700/50' 
                          : 'bg-gray-50'
                      }`}>
                        <h5 className={`text-sm font-medium mb-2 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          📊 AI Crowd Predictions
                        </h5>
                        <div className="flex space-x-2 text-xs">
                          {hall.predictedCrowd.slice(0, 3).map((prediction, idx) => (
                            <span key={idx} className={`px-2 py-1 rounded border ${getCrowdColor(prediction.level)}`}>
                              {prediction.time}: {prediction.level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
              {/* Menu Filters */}
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
                        placeholder="Search menu items..."
                      />
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <select
                      value={selectedMealTime}
                      onChange={(e) => setSelectedMealTime(e.target.value as MealTime)}
                      className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snacks">Snacks & Drinks</option>
                    </select>

                    <select
                      value={selectedDiningHall}
                      onChange={(e) => setSelectedDiningHall(e.target.value)}
                      className={`px-3 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-100' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All Locations</option>
                      {diningHalls.map((hall) => (
                        <option key={hall.id} value={hall.name}>{hall.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className={`rounded-2xl shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden animate-fade-in ${
                      isDarkMode 
                        ? 'bg-gray-800/90 border-gray-700' 
                        : 'bg-white/90 border-gray-100'
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {item.aiScore && item.aiScore > 80 && (
                      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 text-sm font-medium">
                        🌟 AI Recommended - {item.aiScore}% health score
                      </div>
                    )}
                    
                    <div className="p-6">
                      {/* Item Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-1 ${
                            isDarkMode ? 'text-gray-100' : 'text-gray-900'
                          }`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {item.diningHall}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${item.price}
                          </span>
                          {item.isHealthy && (
                            <div className="text-green-500 text-xs mt-1">💚 Healthy</div>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p className={`text-sm mb-4 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {item.description}
                      </p>

                      {/* Nutrition Quick Info */}
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className={`text-center p-2 rounded ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Calories
                          </div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {item.nutritionalInfo.calories}
                          </div>
                        </div>
                        <div className={`text-center p-2 rounded ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Protein
                          </div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {item.nutritionalInfo.protein}g
                          </div>
                        </div>
                        <div className={`text-center p-2 rounded ${
                          isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                        }`}>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            Prep Time
                          </div>
                          <div className={`font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {item.preparationTime}min
                          </div>
                        </div>
                      </div>

                      {/* Dietary Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.dietaryTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                            isDarkMode 
                              ? 'bg-green-900/30 text-green-400' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Rating & Availability */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <span className={`text-sm font-medium ${
                            isDarkMode ? 'text-gray-200' : 'text-gray-800'
                          }`}>
                            {item.rating}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          item.availability === 'available'
                            ? 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30'
                            : item.availability === 'limited'
                            ? 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30'
                            : 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30'
                        }`}>
                          {item.availability === 'available' ? 'Available' : 
                           item.availability === 'limited' ? 'Limited' : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200">
                          Add to Meal Plan
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

              {/* No Results */}
              {filteredMenuItems.length === 0 && (
                <div className={`text-center py-12 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium mb-2">No menu items found</h3>
                  <p>Try adjusting your filters or search criteria</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'meal-plan' && currentMealPlan && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Today&apos;s Meal Plan */}
              <div className={`lg:col-span-2 rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-semibold ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  }`}>
                    Today&apos;s AI Meal Plan
                  </h3>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    isDarkMode 
                      ? 'bg-purple-900/30 text-purple-400' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    AI Generated
                  </span>
                </div>
                
                {/* Meals */}
                <div className="space-y-6">
                  {[
                    { label: 'Breakfast', item: currentMealPlan.breakfast },
                    { label: 'Lunch', item: currentMealPlan.lunch },
                    { label: 'Dinner', item: currentMealPlan.dinner }
                  ].map(({ label, item }) => (
                    <div key={label} className={`p-4 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <h4 className={`font-medium mb-2 ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {label}
                      </h4>
                      {item ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              isDarkMode ? 'text-gray-100' : 'text-gray-900'
                            }`}>
                              {item.name}
                            </p>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {item.diningHall} • {item.nutritionalInfo.calories} cal
                            </p>
                          </div>
                          <span className={`text-lg font-medium ${
                            isDarkMode ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${item.price}
                          </span>
                        </div>
                      ) : (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          No meal planned
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={generateAIMealPlan}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                  >
                    Regenerate Plan
                  </button>
                  <button className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>
                    Save Plan
                  </button>
                </div>
              </div>

              {/* Meal Plan Summary */}
              <div className={`rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Daily Summary
                </h3>
                
                <div className="space-y-4">
                  {/* Total Calories */}
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Calories
                      </span>
                      <span className={`font-medium ${
                        isDarkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {currentMealPlan.totalCalories}
                      </span>
                    </div>
                    <div className={`w-full rounded-full h-2 ${
                      isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
                    }`}>
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(currentMealPlan.totalCalories / nutritionGoals.dailyCalories) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Total Cost */}
                  <div className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Cost
                      </span>
                      <span className={`text-lg font-bold ${
                        isDarkMode ? 'text-green-400' : 'text-green-600'
                      }`}>
                        ${currentMealPlan.totalCost}
                      </span>
                    </div>
                  </div>

                  {/* Nutritional Balance */}
                  <div>
                    <h4 className={`text-sm font-medium mb-3 ${
                      isDarkMode ? 'text-gray-200' : 'text-gray-800'
                    }`}>
                      Nutritional Balance
                    </h4>
                    {Object.entries(currentMealPlan.nutritionalBalance).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between mb-2">
                        <span className={`text-sm capitalize ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {key}
                        </span>
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {value}%
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* AI Insights */}
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-blue-900/20 border-blue-800' 
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <h5 className={`text-sm font-medium mb-2 ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-800'
                    }`}>
                      💡 AI Insights
                    </h5>
                    <ul className={`text-xs space-y-1 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-700'
                    }`}>
                      <li>• Protein intake is optimal for your fitness goals</li>
                      <li>• Consider adding more fiber-rich foods</li>
                      <li>• Great job staying within budget!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Nutrition Overview */}
              <div className={`rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Nutrition Tracker
                </h3>
                
                <div className="space-y-6">
                  {/* Daily Goals Progress */}
                  {[
                    { label: 'Calories', current: 1385, goal: nutritionGoals.dailyCalories, unit: '', color: 'purple' },
                    { label: 'Protein', current: 63, goal: (nutritionGoals.dailyCalories * nutritionGoals.proteinPercentage / 100) / 4, unit: 'g', color: 'blue' },
                    { label: 'Fiber', current: 35, goal: nutritionGoals.minFiber, unit: 'g', color: 'green' },
                    { label: 'Sodium', current: 2255, goal: nutritionGoals.maxSodium, unit: 'mg', color: 'orange' }
                  ].map(({ label, current, goal, unit, color }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {label}
                        </span>
                        <span className={`text-sm ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {current}{unit} / {goal}{unit}
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-3 ${
                        isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 bg-${color}-500`}
                          style={{ width: `${Math.min((current / goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Trends */}
              <div className={`rounded-2xl shadow-lg p-6 border backdrop-blur-sm animate-fade-in ${
                isDarkMode 
                  ? 'bg-gray-800/90 border-gray-700' 
                  : 'bg-white/90 border-gray-100'
              }`}>
                <h3 className={`text-xl font-semibold mb-6 ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Weekly Nutrition Trends
                </h3>
                
                <div className="space-y-4">
                  {[
                    { day: 'Mon', calories: 1950, protein: 65, healthy: true },
                    { day: 'Tue', calories: 2100, protein: 58, healthy: true },
                    { day: 'Wed', calories: 1800, protein: 72, healthy: true },
                    { day: 'Thu', calories: 2300, protein: 45, healthy: false },
                    { day: 'Fri', calories: 1900, protein: 68, healthy: true },
                    { day: 'Sat', calories: 2200, protein: 52, healthy: false },
                    { day: 'Today', calories: 1385, protein: 63, healthy: true }
                  ].map(({ day, calories, protein, healthy }) => (
                    <div key={day} className={`flex items-center justify-between p-3 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium mr-3 ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {day}
                        </span>
                        {healthy ? (
                          <span className="text-green-500 text-sm">✓</span>
                        ) : (
                          <span className="text-orange-500 text-sm">⚠</span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-gray-200' : 'text-gray-800'
                        }`}>
                          {calories} cal
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {protein}g protein
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dietary Preferences Modal */}
        {showPreferencesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  Dietary Preferences
                </h2>
                <button 
                  onClick={() => setShowPreferencesModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {Object.entries(dietaryPreferences).map(([key, value]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setDietaryPreferences(prev => ({ 
                        ...prev, 
                        [key]: e.target.checked 
                      }))}
                      className="mr-3 text-purple-600 focus:ring-purple-500"
                    />
                    <span className={`capitalize ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </label>
                ))}
              </div>

              <button
                onClick={() => setShowPreferencesModal(false)}
                className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
              >
                Save Preferences
              </button>
            </div>
          </div>
        )}

        {/* AI Meal Plan Modal */}
        {showMealPlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-2xl shadow-xl max-w-md w-full p-6 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>
                  AI Meal Plan Generated!
                </h2>
                <button 
                  onClick={() => setShowMealPlanModal(false)}
                  className={`transition-colors duration-200 ${
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className={`p-4 rounded-lg mb-4 ${
                isDarkMode 
                  ? 'bg-green-900/20 border-green-800' 
                  : 'bg-green-50 border-green-200'
              } border`}>
                <p className={`text-sm ${
                  isDarkMode ? 'text-green-400' : 'text-green-700'
                }`}>
                  🎉 Your personalized meal plan has been created based on your dietary preferences and nutrition goals!
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowMealPlanModal(false);
                    setActiveTab('meal-plan');
                  }}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200"
                >
                  View Plan
                </button>
                <button
                  onClick={() => setShowMealPlanModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}