'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, BookOpen, HelpCircle, LogIn, UserPlus, User, Bot, MapPin, Calendar, Heart, LogOut, Settings, Cloud, FolderOpen, Globe, UserCircle, LayoutDashboard, Bell, AlertTriangle, ChevronDown, ChevronUp, GraduationCap, Library } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { getThumbnailUrl } from '@/utils/imageUtils';

interface MobileMenuContentProps {
    closeMenu: () => void;
    emergencyCount: number;
}

const MobileMenuContent = ({ closeMenu, emergencyCount }: MobileMenuContentProps) => {
    const { user, isAuthenticated, logout } = useAuth();
    const { t } = useTranslation();
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="p-4 space-y-2 border-t border-gray-100 dark:border-gray-700">
            {/* Quick Access - Always Visible */}
            <div className="space-y-1">
                <Link
                    href="/"
                    className="mobile-nav-link flex items-center py-2.5"
                    onClick={closeMenu}
                >
                    <Home className="inline h-5 w-5 mr-3" /> {t('nav.home')}
                </Link>
                {isAuthenticated && (
                    <>
                        <Link
                            href="/dashboard"
                            className="mobile-nav-link flex items-center py-2.5"
                            onClick={closeMenu}
                        >
                            <LayoutDashboard className="inline h-5 w-5 mr-3" /> {t('nav.dashboard')}
                        </Link>
                        <Link
                            href="/profile"
                            className="mobile-nav-link flex items-center py-2.5"
                            onClick={closeMenu}
                        >
                            <UserCircle className="inline h-5 w-5 mr-3" /> {t('nav.profile')}
                        </Link>
                        {/* Emergency Notifications */}
                        <Link
                            href="/notifications"
                            className="mobile-nav-link flex items-center justify-between py-2.5"
                            onClick={closeMenu}
                        >
                            <div className="flex items-center">
                                <Bell className="inline h-5 w-5 mr-3" />
                                <span>Emergency Alerts</span>
                            </div>
                            {emergencyCount > 0 && (
                                <span className="bg-red-600 text-white text-xs font-bold rounded-full min-w-[22px] h-5 flex items-center justify-center px-1.5 animate-pulse">
                                    {emergencyCount}
                                </span>
                            )}
                        </Link>
                    </>
                )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

            {/* Campus Features Section - Collapsible */}
            <div>
                <button
                    onClick={() => toggleSection('features')}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                    <span className="text-sm flex items-center"><GraduationCap className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" /> Campus Features</span>
                    {expandedSection === 'features' ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSection === 'features' && (
                    <div className="pl-3 space-y-1 mt-1">
                        <Link href="/chatbot" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <Bot className="inline h-4 w-4 mr-2.5" /> {t('nav.aiAssistant')}
                        </Link>
                        <Link href="/navigation" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <MapPin className="inline h-4 w-4 mr-2.5" /> {t('nav.universityNavigation')}
                        </Link>
                        <Link href="/study-spaces" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <BookOpen className="inline h-4 w-4 mr-2.5" /> {t('nav.studySpaces')}
                        </Link>
                        <Link href="/academic" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <Calendar className="inline h-4 w-4 mr-2.5" /> {t('nav.academicHub')}
                        </Link>
                        <Link href="/events" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <Calendar className="inline h-4 w-4 mr-2.5" /> Events & Socials
                        </Link>
                    </div>
                )}
            </div>

            {/* Resources Section - Collapsible */}
            <div>
                <button
                    onClick={() => toggleSection('resources')}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 font-medium"
                >
                    <span className="text-sm flex items-center"><Library className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400" /> Resources & More</span>
                    {expandedSection === 'resources' ? (
                        <ChevronUp className="h-4 w-4" />
                    ) : (
                        <ChevronDown className="h-4 w-4" />
                    )}
                </button>
                {expandedSection === 'resources' && (
                    <div className="pl-3 space-y-1 mt-1">
                        <Link href="/wellness" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <Heart className="inline h-4 w-4 mr-2.5" /> {t('nav.healthWellness')}
                        </Link>
                        <Link href="/weather" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <Cloud className="inline h-4 w-4 mr-2.5" /> {t('nav.weather')}
                        </Link>
                        {isAuthenticated && (
                            <Link href="/my-uploads" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                                <FolderOpen className="inline h-4 w-4 mr-2.5" /> {t('nav.myUploads')}
                            </Link>
                        )}
                        {isAuthenticated && (
                            <Link href="/my-donations" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                                <Heart className="inline h-4 w-4 mr-2.5" /> My Donations
                            </Link>
                        )}
                        <Link href="/help" className="mobile-nav-link flex items-center py-2" onClick={closeMenu}>
                            <HelpCircle className="inline h-4 w-4 mr-2.5" /> {t('nav.helpSupport')}
                        </Link>
                    </div>
                )}
            </div>

            {/* Admin Panel - Only for admins */}
            {isAuthenticated && user?.role === 'ADMIN' && (
                <>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                    <Link href="/admin" className="mobile-nav-link flex items-center py-2.5 bg-purple-50 dark:bg-purple-900/30" onClick={closeMenu}>
                        <Settings className="inline h-5 w-5 mr-3" /> {t('nav.adminPanel')}
                    </Link>
                </>
            )}

            {/* Auth Buttons */}
            <div className="pt-3 space-y-3 border-t border-gray-200 dark:border-gray-700 mt-3">
                {isAuthenticated ? (
                    <div className="space-y-3">
                        <div className="text-gray-700 dark:text-gray-300 px-3 py-2 text-center flex items-center justify-center space-x-2">
                            {user?.image && (
                                <img
                                    src={user.image.includes('amazonaws.com')
                                        ? getThumbnailUrl(user.image, 64)
                                        : user.image}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            )}
                            <span>Hi, {user?.firstName || user?.name?.split(' ')[0]}!</span>
                        </div>
                        <button
                            onClick={() => {
                                logout();
                                closeMenu();
                            }}
                            className="mobile-login-button w-full flex items-center justify-center bg-red-600 hover:bg-red-700"
                        >
                            <LogOut className="inline h-5 w-5 mr-2" /> {t('nav.logout')}
                        </button>
                    </div>
                ) : (
                    <>
                        <Link href="/onboarding" className="mobile-nav-link flex items-center" onClick={closeMenu}>
                            <UserPlus className="inline h-5 w-5 mr-2" /> {t('nav.getStarted')}
                        </Link>
                        <Link href="/login" className="mobile-login-button w-full flex items-center justify-center" onClick={closeMenu}>
                            <LogIn className="inline h-5 w-5 mr-2" /> {t('nav.signIn')}
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default MobileMenuContent;
