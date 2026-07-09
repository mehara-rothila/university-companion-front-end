'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import { Plus, Trash2, Building, Users, Volume2, ArrowLeft } from 'lucide-react';

interface StudySpace {
  id: number;
  name: string;
  building: string;
  floor: number;
  room: string;
  capacity: number;
  defaultNoiseLevel: string;
  status: 'EMPTY' | 'MODERATE' | 'CROWDED';
}

export default function AdminStudySpacesPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [studySpaces, setStudySpaces] = useState<StudySpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states for creating a space
  const [showAddSpaceModal, setShowAddSpaceModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceBuilding, setNewSpaceBuilding] = useState('');
  const [newSpaceFloor, setNewSpaceFloor] = useState(0);
  const [newSpaceRoom, setNewSpaceRoom] = useState('');
  const [newSpaceCapacity, setNewSpaceCapacity] = useState(10);
  const [newSpaceNoise, setNewSpaceNoise] = useState('quiet');

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStudySpaces();
    }
  }, [user]);

  const fetchStudySpaces = async () => {
    try {
      setLoading(true);
      setError('');
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendUrl}/api/study-spaces`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStudySpaces(response.data);
    } catch (err) {
      console.error('Failed to fetch study spaces:', err);
      setError('Failed to load study spaces.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpace = async () => {
    if (!newSpaceName || !newSpaceBuilding || !newSpaceRoom) {
      alert('Please fill in all fields.');
      return;
    }
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      await axios.post(`${backendUrl}/api/admin/study-spaces`, {
        name: newSpaceName,
        building: newSpaceBuilding,
        floor: newSpaceFloor,
        room: newSpaceRoom,
        capacity: newSpaceCapacity,
        defaultNoiseLevel: newSpaceNoise,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudySpaces();
      setShowAddSpaceModal(false);
      // Reset form
      setNewSpaceName('');
      setNewSpaceBuilding('');
      setNewSpaceFloor(0);
      setNewSpaceRoom('');
      setNewSpaceCapacity(10);
      setNewSpaceNoise('quiet');
      alert('Study space added successfully!');
    } catch (err) {
      console.error('Failed to add study space:', err);
      alert('Failed to add space. Only administrators can perform this action.');
    }
  };

  const handleDeleteSpace = async (spaceId: number) => {
    if (!confirm('Are you sure you want to delete this study space?')) return;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const token = localStorage.getItem('token');
      await axios.delete(`${backendUrl}/api/admin/study-spaces/${spaceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStudySpaces();
      alert('Study space deleted successfully!');
    } catch (err) {
      console.error('Failed to delete space:', err);
      alert('Failed to delete space.');
    }
  };

  return (
    <AuthGuard requiredRole="ADMIN">
      <Navigation />
      <main
        className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}
      >
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Breadcrumbs */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/admin"
              className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 shadow-sm backdrop-blur-sm transition-all duration-200`}
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              Back to Admin Panel
            </Link>
          </div>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 p-6 rounded-2xl border bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-700/50 shadow-md backdrop-blur-sm">
            <div>
              <h1
                className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}
              >
                Study Zones Management
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Configure campus locations, floor plans, maximum capacities, and monitor live student reports.
              </p>
            </div>
            <button
              onClick={() => setShowAddSpaceModal(true)}
              className="mt-4 md:mt-0 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 justify-center"
            >
              <Plus className="w-4 h-4" />
              Add Study Zone
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-100 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Loading study zones...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studySpaces.length > 0 ? (
                studySpaces.map((space) => (
                  <div
                    key={space.id}
                    className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm relative flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4
                            className={`font-semibold text-lg ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                          >
                            {space.name}
                          </h4>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1 mt-1`}>
                            <Building className="w-3.5 h-3.5" />
                            {space.building} • Floor {space.floor} • Room {space.room}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm ${
                            space.status === 'EMPTY'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : space.status === 'MODERATE'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {space.status}
                        </span>
                      </div>

                      <div className="space-y-2 mt-4 pt-2 border-t border-gray-200/20 text-sm">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            Max Capacity:
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {space.capacity} Students
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Volume2 className="w-3.5 h-3.5" />
                            Noise Level:
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {space.defaultNoiseLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-3 border-t border-gray-200/20">
                      <button
                        onClick={() => handleDeleteSpace(space.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-100/50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Zone
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500 bg-white/90 dark:bg-gray-800/90 border border-gray-200/50 dark:border-gray-700/50 p-8 rounded-2xl shadow-md backdrop-blur-sm">
                  No study zones configured. Click the button above to add the first one.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Space Modal */}
        {showAddSpaceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div
              className={`w-full max-w-md p-6 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-100 text-gray-900'}`}
            >
              <h3 className="text-xl font-bold mb-4">Add Campus Study Zone</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Zone / Space Name
                  </label>
                  <input
                    type="text"
                    value={newSpaceName}
                    onChange={(e) => setNewSpaceName(e.target.value)}
                    placeholder="e.g. Silent Reading Room"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Building
                  </label>
                  <input
                    type="text"
                    value={newSpaceBuilding}
                    onChange={(e) => setNewSpaceBuilding(e.target.value)}
                    placeholder="e.g. Main Library"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Floor
                    </label>
                    <input
                      type="number"
                      value={newSpaceFloor}
                      onChange={(e) => setNewSpaceFloor(parseInt(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Room / Code
                    </label>
                    <input
                      type="text"
                      value={newSpaceRoom}
                      onChange={(e) => setNewSpaceRoom(e.target.value)}
                      placeholder="e.g. L3-001"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      value={newSpaceCapacity}
                      onChange={(e) => setNewSpaceCapacity(parseInt(e.target.value) || 10)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Noise Level
                    </label>
                    <select
                      value={newSpaceNoise}
                      onChange={(e) => setNewSpaceNoise(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="silent">Silent</option>
                      <option value="quiet">Quiet</option>
                      <option value="moderate">Moderate</option>
                      <option value="lively">Lively</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAddSpaceModal(false)}
                  className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSpace}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium rounded-lg shadow-md transition-all duration-200"
                >
                  Create Zone
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
