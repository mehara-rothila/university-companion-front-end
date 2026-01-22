'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import AuthGuard from '@/components/AuthGuard';
import axios from 'axios';
import { Calendar, Users, CheckCircle, Clock, Download, Search, Filter } from 'lucide-react';

interface Event {
  id: number;
  title: string;
  eventDate: string;
  location: string;
}

interface AttendanceStats {
  eventId: number;
  eventTitle: string;
  totalRegistered: number;
  totalAttended: number;
  totalWaitlisted: number;
  attendanceRate: number;
}

interface AttendanceRecord {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userName: string;
  userEmail: string;
  checkedInAt: string;
  checkedInByName: string;
  notes: string;
}

export default function AttendanceTrackingPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchAttendanceData(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events/approved`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchAttendanceData = async (eventId: number) => {
    setLoading(true);
    try {
      const [statsResponse, recordsResponse] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/attendance/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/events/${eventId}/attendance`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setStats(statsResponse.data);
      setAttendanceRecords(recordsResponse.data);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAttendanceCSV = () => {
    if (!attendanceRecords.length) return;

    const headers = ['User Name', 'Email', 'Checked In At', 'Checked In By', 'Notes'];
    const rows = attendanceRecords.map(record => [
      record.userName,
      record.userEmail,
      new Date(record.checkedInAt).toLocaleString(),
      record.checkedInByName || 'N/A',
      record.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedEventId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredRecords = attendanceRecords.filter(record =>
    record.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
      <Navigation />
      <main className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'} transition-colors duration-300 relative overflow-hidden`}>
        <AnimatedBackground variant="dashboard" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <CheckCircle className="text-blue-600" size={40} />
              Attendance Tracking
            </h1>
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              Monitor and manage event attendance
            </p>
          </div>

          {/* Event Selector */}
          <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 mb-6 border backdrop-blur-sm`}>
            <label className="block mb-2 font-medium">Select Event</label>
            <select
              value={selectedEventId || ''}
              onChange={(e) => setSelectedEventId(Number(e.target.value))}
              className={`w-full px-4 py-3 rounded-lg border ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">-- Select an Event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {new Date(event.eventDate).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Registered</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalRegistered}</p>
                  </div>
                  <Users size={32} className="text-blue-600 opacity-20" />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attended</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalAttended}</p>
                  </div>
                  <CheckCircle size={32} className="text-green-600 opacity-20" />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Waitlisted</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.totalWaitlisted}</p>
                  </div>
                  <Clock size={32} className="text-yellow-600 opacity-20" />
                </div>
              </div>

              <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Attendance Rate</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.attendanceRate.toFixed(1)}%</p>
                  </div>
                  <Calendar size={32} className="text-purple-600 opacity-20" />
                </div>
              </div>
            </div>
          )}

          {/* Attendance Records */}
          {selectedEventId && (
            <div className={`${isDarkMode ? 'bg-gray-800/90 border-gray-700' : 'bg-white/90 border-gray-100'} rounded-2xl shadow-lg p-6 border backdrop-blur-sm`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Attendance Records</h2>
                <button
                  onClick={exportAttendanceCSV}
                  disabled={!attendanceRecords.length}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2"
                >
                  <Download size={18} />
                  Export CSV
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? 'No matching records found' : 'No attendance records yet'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Email</th>
                        <th className="text-left py-3 px-4">Checked In</th>
                        <th className="text-left py-3 px-4">Checked By</th>
                        <th className="text-left py-3 px-4">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.map((record) => (
                        <tr
                          key={record.id}
                          className={`border-b ${isDarkMode ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                        >
                          <td className="py-3 px-4">{record.userName}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{record.userEmail}</td>
                          <td className="py-3 px-4 text-sm">
                            {new Date(record.checkedInAt).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">{record.checkedInByName || 'System'}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{record.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
