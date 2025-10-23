'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import WeatherCard from '@/components/WeatherCard';
import { Bell } from 'lucide-react';

// --- Interfaces ---



interface ActivityItem {
  id: string;
  type: 'study' | 'quiz' | 'wellness' | 'navigation' | 'social';
  title: string;
  description: string;
  timestamp: string;
  completed?: boolean;
}

interface UniversityUpdate {
  id: string;
  title: string;
  description: string;
  type: 'event' | 'announcement' | 'alert' | 'maintenance';
  timestamp: string;
  urgent?: boolean;
}

export default function Dashboard() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Get display name from authenticated user
  const getDisplayName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    if (user?.name) {
      return user.name.split(' ')[0]; // First name from full name
    }
    if (user?.username) {
      return user.username;
    }
    return 'Student'; // Fallback
  };


  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // Mock data - in real app, this would come from APIs
  const [recentActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'quiz',
      title: 'welcomeUom',
      description: 'exploreFeatures',
      timestamp: '2 hours ago',
      completed: true
    },
    {
      id: '2',
      type: 'study',
      title: 'lostFoundAvailable',
      description: 'lostFoundDesc',
      timestamp: '4 hours ago',
      completed: true
    },
    {
      id: '3',
      type: 'wellness',
      title: 'financialAidActive',
      description: 'financialAidDesc',
      timestamp: 'Yesterday',
      completed: true
    },
    {
      id: '4',
      type: 'navigation',
      title: 'profileReady',
      description: 'profileDesc',
      timestamp: 'Yesterday',
      completed: true
    }
  ]);

  const [universityUpdates] = useState<UniversityUpdate[]>([
    {
      id: '1',
      title: 'platformLaunch',
      description: 'platformLaunchDesc',
      type: 'announcement',
      timestamp: '3 hours ago'
    },
    {
      id: '2',
      title: 'moreFeaturesDesc',
      description: 'moreFeaturesDesc',
      type: 'event',
      timestamp: '6 hours ago'
    },
    {
      id: '3',
      title: 'systemUpdates',
      description: 'systemUpdatesDesc',
      type: 'maintenance',
      timestamp: '8 hours ago'
    }
  ]);

  // Active features list - Now includes AI Assistant, Library, Weather, and Notifications
  const activeFeatures = ['lost-found', 'financial-aid', 'profile', 'challenges', 'chatbot', 'library', 'notifications', 'weather'];

  // Language options with native names
  const languages = [
    { code: 'si', name: 'සිංහල', nativeName: 'Sinhala' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ta', name: 'தமிழ்', nativeName: 'Tamil' }
  ];

  // Translation objects
  const translations = {
    en: {
      greeting: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening'
      },
      emergency: 'Emergency',
      wellnessSupport: 'Wellness Support',
      universityWeather: 'University Weather',
      humidity: 'Humidity',
      wind: 'Wind',
      dailyWellnessCheckin: 'Daily Wellness Check-in',
      comingSoon: 'Coming Soon',
      wellnessTrackingDesc: 'Wellness tracking and mood monitoring will be available soon to help personalize your university experience.',
      quickActions: 'Quick Actions',
      aiAssistant: 'AI Assistant',
      studySpaces: 'Study Spaces',
      universityNavigation: 'University Navigation',
      academicHub: 'Academic Hub',
      available: 'Available',
      universityServices: 'University Services',
      notifications: 'Notifications',
      socialEvents: 'Social & Events',
      dining: 'Dining',
      wellness: 'Wellness',
      lostFound: 'Lost & Found',
      library: 'Library',
      soon: 'Soon',
      additionalServices: 'Additional Services',
      careerServices: 'Career Services',
      financialAid: 'Financial Aid',
      challenges: 'Challenges',
      profile: 'Profile',
      helpSupport: 'Help & Support',
      platformStatus: 'Platform Status & Development',
      nowAvailable: 'Now Available',
      corePlatformDesc: 'Core platform features are now live and ready to use.',
      lostFoundSystem: 'Lost & Found System',
      financialAidPortal: 'Financial Aid Portal',
      profileManagement: 'Profile Management',
      challengesRewards: 'Challenges & Rewards',
      aiAssistantFull: 'AI Assistant',
      libraryServices: 'Library Services',
      phase1: 'Coming Soon - Phase 1',
      smartFeaturesDesc: 'Smart features launching in the next few weeks.',
      phase2: 'Coming Soon - Phase 2',
      enhancedServicesDesc: 'Enhanced university services and community features.',
      diningServices: 'Dining Services',
      wellnessHub: 'Wellness Hub',
      socialEventsShort: 'Social & Events',
      libraryIntegration: 'Library Integration',
      platformUpdates: 'Platform Updates',
      developmentNews: 'Development News',
      welcomeUom: 'Welcome to UoM Smart University',
      exploreFeatures: 'Explore the available features and stay tuned for more',
      lostFoundAvailable: 'Lost & Found Available',
      lostFoundDesc: 'You can now report and search for lost items',
      financialAidActive: 'Financial Aid Portal Active',
      financialAidDesc: 'Apply for scholarships and community support',
      profileReady: 'Profile Management Ready',
      profileDesc: 'Update your personal information and preferences',
      platformLaunch: 'Platform Launch',
      platformLaunchDesc: 'UoM Smart University platform is now live with initial features',
      moreFeaturesDesc: 'AI Assistant, Study Spaces, and University Navigation launching soon',
      systemUpdates: 'System Updates',
      systemUpdatesDesc: 'Regular updates will bring new features and improvements',
      comingSoonModal: {
        title: 'Coming Soon',
        description: 'This feature is currently under development and will be available soon. We are working hard to bring you the best university experience possible.',
        currentlyAvailable: 'Currently Available:',
        gotIt: 'Got it, thanks!'
      }
    },
    si: {
      greeting: {
        morning: 'සුභ උදෑසනක්',
        afternoon: 'සුභ දහවලක්',
        evening: 'සුභ සන්ධ්‍යාවක්'
      },
      emergency: 'හදිසි',
      wellnessSupport: 'සෞඛ්‍ය සහාය',
      universityWeather: 'කැම්පස් කාලගුණය',
      humidity: 'ආර්ද්‍රතාව',
      wind: 'සුළං',
      dailyWellnessCheckin: 'දෛනික සෞඛ්‍ය පරීක්ෂාව',
      comingSoon: 'ඉක්මනින්',
      wellnessTrackingDesc: 'ඔබේ කැම්පස් අත්දැකීම පුද්ගලීකරණය කිරීමට සෞඛ්‍ය ස්ථිතිය සහ මනෝ තත්වය නිරීක්ෂණය ඉක්මනින් ලබා ගත හැක.',
      quickActions: 'ඉක්මන් ක්‍රියා',
      aiAssistant: 'AI සහායක',
      studySpaces: 'අධ්‍යයන ස්ථාන',
      universityNavigation: 'කැම්පස් මඟ පෙන්වීම',
      academicHub: 'ශාස්ත්‍රීය මධ්‍යස්ථානය',
      available: 'ලබා ගත හැක',
      universityServices: 'කැම්පස් සේවා',
      notifications: 'දැනුම්දීම්',
      socialEvents: 'සමාජීය සහ උත්සව',
      dining: 'ආහාර ගැනීම',
      wellness: 'සෞඛ්‍යය',
      lostFound: 'නැති වූ සහ සොයා ගත්',
      library: 'පුස්තකාලය',
      soon: 'ඉක්මනින්',
      additionalServices: 'අමතර සේවාවන්',
      careerServices: 'වෘත්තීය සේවාවන්',
      financialAid: 'මූල්‍ය ආධාර',
      challenges: 'අභියෝග',
      profile: 'පැතිකඩ',
      helpSupport: 'උපකාර සහ සහාය',
      platformStatus: 'වේදිකා තත්වය සහ සංවර්ධනය',
      nowAvailable: 'දැන් ලබා ගත හැක',
      corePlatformDesc: 'මූලික වේදිකා විශේෂාංග දැන් සජීව වී භාවිතයට සූදානම්.',
      lostFoundSystem: 'නැති වූ සහ සොයා ගත් ක්‍රමය',
      financialAidPortal: 'මූල්‍ය ආධාර ද්වාරය',
      profileManagement: 'පැතිකඩ කළමනාකරණය',
      challengesRewards: 'අභියෝග සහ ත්‍යාග',
      aiAssistantFull: 'AI සහායක',
      libraryServices: 'පුස්තකාල සේවා',
      phase1: 'ඉක්මනින් - පළමු අදියර',
      smartFeaturesDesc: 'ස්මාර්ත් විශේෂාංග ඉදිරි සති කිහිපය තුළ ආරම්භ වේ.',
      phase2: 'ඉක්මනින් - දෙවන අදියර',
      enhancedServicesDesc: 'වැඩිදියුණු කළ කැම්පස් සේවා සහ ප්‍රජා විශේෂාංග.',
      diningServices: 'ආහාර සේවා',
      wellnessHub: 'සෞඛ්‍ය මධ්‍යස්ථානය',
      socialEventsShort: 'සමාජීය සහ උත්සව',
      libraryIntegration: 'පුස්තකාල ඒකාබද්ධතාව',
      platformUpdates: 'වේදිකා යාවත්කාල',
      developmentNews: 'සංවර්ධන ප්‍රවෘත්ති',
      welcomeUom: 'UoM ස්මාර්ට් කැම්පස් වෙත ආයුබෝවන්',
      exploreFeatures: 'ලබා ගත හැකි විශේෂාංග ගවේෂණය කර වැඩි දේ සඳහා බලා සිටින්න',
      lostFoundAvailable: 'නැති වූ සහ සොයා ගත් ලබා ගත හැක',
      lostFoundDesc: 'ඔබට දැන් නැති වූ අයිතම වාර්තා කර සොයා ගත හැක',
      financialAidActive: 'මූල්‍ය ආධාර ද්වාරය සක්‍රීය',
      financialAidDesc: 'ශිෂ්‍යත්ව සහ ප්‍රජා සහයෝගිතාව සඳහා අයදුම් කරන්න',
      profileReady: 'පැතිකඩ කළමනාකරණය සූදානම්',
      profileDesc: 'ඔබේ පුද්ගලික තොරතුරු සහ මනාපයන් යාවත්කාලීන කරන්න',
      platformLaunch: 'වේදිකා දියත් කිරීම',
      platformLaunchDesc: 'UoM ස්මාර්ට් කැම්පස් වේදිකාව මූලික විශේෂාංග සමඟ දැන් සජීවයි',
      moreFeaturesDesc: 'AI සහායක, අධ්‍යයන ස්ථාන සහ කැම්පස් මඟ පෙන්වීම ඉක්මනින් ආරම්භ වේ',
      systemUpdates: 'පද්ධති යාවත්කාල',
      systemUpdatesDesc: 'නිතිපතා යාවත්කාල නව විශේෂාංග සහ වැඩිදියුණු කිරීම් ගෙන එනු ඇත',
      comingSoonModal: {
        title: 'ඉක්මනින්',
        description: 'මෙම විශේෂාංගය දැනට සංවර්ධනය වෙමින් පවතින අතර ඉක්මනින් ලබා ගත හැකි වනු ඇත. ඔබට හොඳම කැම්පස් අත්දැකීමක් ලබා දීමට අපි වෙහෙස මහන්සි වෙමින් සිටිමු.',
        currentlyAvailable: 'දැනට ලබා ගත හැක:',
        gotIt: 'හරි, ස්තූතියි!'
      }
    },
    ta: {
      greeting: {
        morning: 'காலை வணக்கம்',
        afternoon: 'மதிய வணக்கம்',
        evening: 'மாலை வணக்கம்'
      },
      emergency: 'அவசரம்',
      wellnessSupport: 'நலவாழ்வு ஆதரவு',
      universityWeather: 'வளாக வானிலை',
      humidity: 'ஈரப்பதம்',
      wind: 'காற்று',
      dailyWellnessCheckin: 'தினசரி நலவாழ்வு சரிபார்ப்பு',
      comingSoon: 'விரைவில்',
      wellnessTrackingDesc: 'உங்கள் வளாக அனுபவத்தை தனிப்பயனாக்க நலவாழ்வு கண்காணிப்பு மற்றும் மனநிலை கண்காணிப்பு விரைவில் கிடைக்கும்.',
      quickActions: 'விரைவு செயல்கள்',
      aiAssistant: 'AI உதவியாளர்',
      studySpaces: 'படிப்பு இடங்கள்',
      universityNavigation: 'வளாக வழிகாட்டல்',
      academicHub: 'கல்வி மையம்',
      available: 'கிடைக்கும்',
      universityServices: 'வளாக சேவைகள்',
      notifications: 'அறிவிப்புகள்',
      socialEvents: 'சமூக மற்றும் நிகழ்வுகள்',
      dining: 'உணவு',
      wellness: 'நலவாழ்வு',
      lostFound: 'இழந்த மற்றும் கண்டெடுக்கப்பட்ட',
      library: 'நூலகம்',
      soon: 'விரைவில்',
      additionalServices: 'கூடுதல் சேவைகள்',
      careerServices: 'தொழில் சேவைகள்',
      financialAid: 'நிதி உதவி',
      challenges: 'சவால்கள்',
      profile: 'சுயவிவரம்',
      helpSupport: 'உதவி மற்றும் ஆதரவு',
      platformStatus: 'தளம் நிலை மற்றும் மேம்பாடு',
      nowAvailable: 'இப்போது கிடைக்கிறது',
      corePlatformDesc: 'முக்கிய தள அம்சங்கள் இப்போது நேரலையாக உள்ளன மற்றும் பயன்படுத்த தயாராக உள்ளன.',
      lostFoundSystem: 'இழந்த மற்றும் கண்டெடுக்கப்பட்ட அமைப்பு',
      financialAidPortal: 'நிதி உதவி போர்ட்டல்',
      profileManagement: 'சுயவிவர மேலாண்மை',
      challengesRewards: 'சவால்கள் மற்றும் வெகுமதிகள்',
      aiAssistantFull: 'AI உதவியாளர்',
      libraryServices: 'நூலக சேவைகள்',
      phase1: 'விரைவில் - முதல் கட்டம்',
      smartFeaturesDesc: 'அடுத்த சில வாரங்களில் ஸ்மார்ட் அம்சங்கள் தொடங்கப்படும்.',
      phase2: 'விரைவில் - இரண்டாம் கட்டம்',
      enhancedServicesDesc: 'மேம்படுத்தப்பட்ட வளாக சேவைகள் மற்றும் சமூக அம்சங்கள்.',
      diningServices: 'உணவு சேவைகள்',
      wellnessHub: 'நலவாழ்வு மையம்',
      socialEventsShort: 'சமூக மற்றும் நிகழ்வுகள்',
      libraryIntegration: 'நூலக ஒருங்கிணைப்பு',
      platformUpdates: 'தள புதுப்பிப்புகள்',
      developmentNews: 'மேம்பாட்டு செய்திகள்',
      welcomeUom: 'UoM ஸ்மார்ட் வளாகத்திற்கு வரவேற்கிறோம்',
      exploreFeatures: 'கிடைக்கக்கூடிய அம்சங்களை ஆராய்ந்து மேலும் அறிய காத்திருங்கள்',
      lostFoundAvailable: 'இழந்த மற்றும் கண்டெடுக்கப்பட்டது கிடைக்கும்',
      lostFoundDesc: 'நீங்கள் இப்போது இழந்த பொருட்களை புகாரளித்து தேடலாம்',
      financialAidActive: 'நிதி உதவி போர்ட்டல் செயல்பாட்டில்',
      financialAidDesc: 'உதவித்தொகை மற்றும் சமூக ஆதரவுக்கு விண்ணப்பிக்கவும்',
      profileReady: 'சுயவிவர மேலாண்மை தயார்',
      profileDesc: 'உங்கள் தனிப்பட்ட தகவல் மற்றும் விருப்பத்தேர்வுகளை புதுப்பிக்கவும்',
      platformLaunch: 'தள வெளியீடு',
      platformLaunchDesc: 'UoM ஸ்மார்ட் வளாக தளம் ஆரம்ப அம்சங்களுடன் இப்போது நேரலையில் உள்ளது',
      moreFeaturesDesc: 'AI உதவியாளர், படிப்பு இடங்கள் மற்றும் வளாக வழிகாட்டல் விரைவில் தொடங்கப்படும்',
      systemUpdates: 'அமைப்பு புதுப்பிப்புகள்',
      systemUpdatesDesc: 'வழக்கமான புதுப்பிப்புகள் புதிய அம்சங்கள் மற்றும் மேம்பாடுகளை கொண்டு வரும்',
      comingSoonModal: {
        title: 'விரைவில்',
        description: 'இந்த அம்சம் தற்போது மேம்பாட்டில் உள்ளது மற்றும் விரைவில் கிடைக்கும். உங்களுக்கு சிறந்த வளாக அனுபவத்தை வழங்க நாங்கள் கடுமையாக உழைத்து வருகிறோம்.',
        currentlyAvailable: 'தற்போது கிடைக்கும்:',
        gotIt: 'சரி, நன்றி!'
      }
    }
  };

  // Get current language info
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[1];
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[currentLanguage as keyof typeof translations];
    for (const k of keys) {
      if (typeof value === 'object' && value !== null && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };

  // Handle coming soon click
  const handleComingSoonClick = (featureName: string) => {
    setComingSoonFeature(featureName);
    setShowComingSoonModal(true);
  };

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    setShowLanguageDropdown(false);
    // In a real app, you would also update the app's locale/translations here
    console.log(`Language changed to: ${langCode}`);
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return t('greeting.morning');
    if (hour < 17) return t('greeting.afternoon');
    return t('greeting.evening');
  };

  // Get mood color and icon




  return (
    <>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        
        <AnimatedBackground variant="dashboard" />

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                  {getGreeting()}, {getDisplayName()}!
                </h1>
                <p className={`text-sm sm:text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              {/* Emergency Quick Access */}
              <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Language Switcher */}
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className={`p-2 rounded-lg transition-colors duration-200 flex items-center space-x-1 ${
                      isDarkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-sm font-medium">{getCurrentLanguage().name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Language Dropdown */}
                  {showLanguageDropdown && (
                    <div className={`absolute top-full right-0 mt-1 w-40 sm:w-44 rounded-lg shadow-lg border z-50 ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => handleLanguageChange(language.code)}
                          className={`w-full px-3 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg ${
                            currentLanguage === language.code
                              ? isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'
                              : isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{language.name}</span>
                            {currentLanguage === language.code && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {language.nativeName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleComingSoonClick('Emergency Services')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.25C13.83 15.932 18 12.813 18 8.25a6.75 6.75 0 1 0-13.5 0c0 4.563 4.17 7.682 6 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
                  </svg>
                  {t('emergency')}
                </button>
                <button 
                  onClick={() => handleComingSoonClick('Wellness Support')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {t('wellnessSupport')}
                </button>
              </div>
            </div>
          </div>

          {/* Top Row - Weather, Wellness Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Weather Card Component */}
            <WeatherCard />

            {/* Wellness Check-in */}
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm md:col-span-2`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {t('dailyWellnessCheckin')}
                <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full">
                  {t('comingSoon')}
                </span>
              </h3>
              
              <div>
                <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                  {t('wellnessTrackingDesc')}
                </p>
                <button 
                  onClick={() => handleComingSoonClick('Wellness Check-in')}
                  className="px-4 py-2 bg-gray-400 text-gray-600 rounded-lg font-medium cursor-not-allowed flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('comingSoon')}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="space-y-8 mb-8">
            {/* Primary Actions */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { 
                    title: 'AI Assistant', 
                    url: '/chatbot', 
                    color: 'from-blue-500/20 to-blue-600/20',
                    borderColor: 'border-blue-400/30',
                    iconColor: 'text-blue-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Weather', 
                    url: '/weather', 
                    color: 'from-sky-500/20 to-sky-600/20',
                    borderColor: 'border-sky-400/30',
                    iconColor: 'text-sky-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                      </svg>
                    )
                  },
                  {
                    title: 'University Navigation', 
                    url: '/navigation', 
                    color: 'from-purple-500/20 to-purple-600/20',
                    borderColor: 'border-purple-400/30',
                    iconColor: 'text-purple-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Academic Hub', 
                    url: '/academic', 
                    color: 'from-orange-500/20 to-orange-600/20',
                    borderColor: 'border-orange-400/30',
                    iconColor: 'text-orange-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443a55.381 55.381 0 015.25 2.882V15" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-3">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-green-400/30 font-medium">
                          ✓
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-6 rounded-2xl shadow-lg opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-3">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} transition-colors duration-300`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        Coming Soon
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* University Services */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                University Services
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  {
                    title: 'Notifications',
                    url: '/notifications',
                    color: 'from-red-500/20 to-red-600/20',
                    borderColor: 'border-red-400/30',
                    iconColor: 'text-red-400',
                    isActive: true,
                    icon: <Bell className="h-6 w-6" strokeWidth={1.5} />
                  },
                  { 
                    title: 'Social & Events', 
                    url: '/social', 
                    color: 'from-pink-500/20 to-pink-600/20',
                    borderColor: 'border-pink-400/30',
                    iconColor: 'text-pink-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    )
                  },
                  {
                    title: 'Wellness', 
                    url: '/wellness', 
                    color: 'from-teal-500/20 to-teal-600/20',
                    borderColor: 'border-teal-400/30',
                    iconColor: 'text-teal-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Lost & Found', 
                    url: '/lost-found', 
                    color: 'from-indigo-500/20 to-indigo-600/20',
                    borderColor: 'border-indigo-400/30',
                    iconColor: 'text-indigo-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                    )
                  },
                  { 
                    title: 'Library', 
                    url: '/library', 
                    color: 'from-emerald-500/20 to-emerald-600/20',
                    borderColor: 'border-emerald-400/30',
                    iconColor: 'text-emerald-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-2">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-green-400/30 font-medium">
                          ✓
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-2">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        Soon
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Services */}
            <div>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
                {t('additionalServices')}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                  { 
                    title: t('careerServices'), 
                    url: '/career', 
                    color: 'from-violet-500/20 to-violet-600/20',
                    borderColor: 'border-violet-400/30',
                    iconColor: 'text-violet-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    )
                  },
                  { 
                    title: t('financialAid'), 
                    url: '/financial-aid', 
                    color: 'from-amber-500/20 to-amber-600/20',
                    borderColor: 'border-amber-400/30',
                    iconColor: 'text-amber-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: t('challenges'), 
                    url: '/challenges', 
                    color: 'from-rose-500/20 to-rose-600/20',
                    borderColor: 'border-rose-400/30',
                    iconColor: 'text-rose-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                      </svg>
                    )
                  },
                  { 
                    title: t('profile'), 
                    url: '/profile', 
                    color: 'from-slate-500/20 to-slate-600/20',
                    borderColor: 'border-slate-400/30',
                    iconColor: 'text-slate-400',
                    isActive: true,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )
                  },
                  { 
                    title: t('helpSupport'), 
                    url: '/help', 
                    color: 'from-cyan-500/20 to-cyan-600/20',
                    borderColor: 'border-cyan-400/30',
                    iconColor: 'text-cyan-400',
                    isActive: false,
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    )
                  }
                ].map((action) => {
                  const isActive = activeFeatures.includes(action.url.replace('/', ''));
                  
                  if (isActive) {
                    return (
                      <Link
                        key={action.title}
                        href={action.url}
                        className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                      >
                        <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex flex-col items-center text-center space-y-2">
                          <div className={`${action.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                            {action.icon}
                          </div>
                          <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} leading-tight`}>
                            {action.title}
                          </span>
                        </div>
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-green-400/30 font-medium">
                          ✓
                        </div>
                      </Link>
                    );
                  }
                  
                  return (
                    <button
                      key={action.title}
                      onClick={() => handleComingSoonClick(action.title)}
                      className={`relative group bg-gradient-to-br ${action.color} backdrop-blur-lg border ${action.borderColor} p-4 rounded-xl shadow-md opacity-75 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5`}
                    >
                      <div className="absolute inset-0 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex flex-col items-center text-center space-y-2">
                        <div className={`${action.iconColor} opacity-60 transition-transform duration-300 group-hover:scale-110`}>
                          {action.icon}
                        </div>
                        <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} leading-tight`}>
                          {action.title}
                        </span>
                      </div>
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-1.5 py-0.5 rounded-full shadow-lg border border-amber-400/30 font-medium">
                        {t('soon')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Platform Status */}
            <div className={`lg:col-span-2 ${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
              <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-6 flex items-center`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('platformStatus')}
              </h3>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                      {t('nowAvailable')}
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-green-400' : 'text-green-700'} mb-2`}>
                    {t('corePlatformDesc')}
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    ✓ {t('lostFoundSystem')} • ✓ {t('financialAidPortal')} • ✓ {t('profileManagement')} • ✓ {t('challengesRewards')} • ✓ {t('aiAssistantFull')} • ✓ {t('libraryServices')}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-amber-300' : 'text-amber-800'}`}>
                      {t('phase1')}
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} mb-2`}>
                    {t('smartFeaturesDesc')}
                  </p>
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    🤖 {t('aiAssistant')} • 📚 {t('studySpaces')} • 🗺️ {t('universityNavigation')}
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                      {t('phase2')}
                    </h4>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`}>
                    {t('enhancedServicesDesc')}
                  </p>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    🍽️ {t('diningServices')} • 💚 {t('wellnessHub')} • 📱 {t('socialEventsShort')} • 📚 {t('libraryIntegration')}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              
              {/* Recent Activities */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('platformUpdates')}
                </h3>
                
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        activity.type === 'quiz' ? 'bg-purple-500' :
                        activity.type === 'study' ? 'bg-green-500' :
                        activity.type === 'wellness' ? 'bg-blue-500' :
                        activity.type === 'navigation' ? 'bg-orange-500' :
                        'bg-gray-500'
                      }`}></div>
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {t(activity.title)}
                        </h4>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          {t(activity.description)}
                        </p>
                        <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* University Updates */}
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4 flex items-center`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                  {t('developmentNews')}
                </h3>
                
                <div className="space-y-3">
                  {universityUpdates.map((update) => (
                    <div key={update.id} className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700/30' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {t(update.title)}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          update.type === 'alert' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          update.type === 'event' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                          update.type === 'maintenance' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {update.type}
                        </span>
                      </div>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                        {t(update.description)}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        {update.timestamp}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Modal */}
        {showComingSoonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {t('comingSoonModal.title')}
                </h2>
                <button 
                  onClick={() => setShowComingSoonModal(false)}
                  className={`${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-800'} transition-colors duration-200`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
                  {comingSoonFeature}
                </h3>
                
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  {t('comingSoonModal.description')}
                </p>

                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'} mb-6`}>
                  <p className={`text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-800'} font-medium mb-2`}>
                    {t('comingSoonModal.currentlyAvailable')}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('lostFoundSystem')}
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('financialAidPortal')}
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('profileManagement')}
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('challengesRewards')}
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('aiAssistantFull')}
                    </div>
                    <div className={`${isDarkMode ? 'text-blue-400' : 'text-blue-700'} flex items-center`}>
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {t('libraryServices')}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowComingSoonModal(false)}
                  className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {t('comingSoonModal.gotIt')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}