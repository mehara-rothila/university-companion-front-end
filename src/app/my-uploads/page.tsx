'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/contexts/TranslationContext';
import Navigation from '@/components/Navigation';
import AnimatedBackground from '@/components/AnimatedBackground';
import { fileManagementService, UserFile, FileStats } from '@/services/fileManagementService';
import { Trash2, Download, Image, FileText, HardDrive, FolderOpen, Video } from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

export default function MyUploadsPage() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [files, setFiles] = useState<UserFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'images' | 'pdfs' | 'videos'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadFiles();
      loadStats();
    }
  }, [user]);

  const loadFiles = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const userFiles = await fileManagementService.getUserFiles();
      setFiles(userFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user?.id) return;
    try {
      const fileStats = await fileManagementService.getUserFileStats();
      setStats(fileStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (file: UserFile) => {
    if (!user?.id) return;

    try {
      setDeleting(true);

      switch (file.source) {
        case 'lost_found':
          await fileManagementService.deleteLostFoundImage(file.id);
          break;
        case 'book_photo':
          await fileManagementService.deleteBookPhoto(file.id);
          break;
        case 'book_pdf':
          await fileManagementService.deleteBookPdf(file.id);
          break;
        case 'chatbot_upload':
          await fileManagementService.deleteChatbotUpload(file.id);
          break;
      }

      await loadFiles();
      await loadStats();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredFiles = files.filter(file => {
    if (filter === 'all') return true;
    if (filter === 'images') return file.fileType === 'image';
    if (filter === 'pdfs') return file.fileType === 'pdf';
    if (filter === 'videos') return file.fileType === 'video';
    return true;
  });

  const getFileIcon = (fileType: string) => {
    if (fileType === 'pdf') return <FileText className="w-5 h-5 sm:w-6 sm:h-6" />;
    if (fileType === 'video') return <Video className="w-5 h-5 sm:w-6 sm:h-6" />;
    return <Image className="w-5 h-5 sm:w-6 sm:h-6" />;
  };

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <AnimatedBackground />
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 pt-24">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              My Uploads
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Manage your uploaded files and free up storage space
            </p>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
              <div className={`p-4 sm:p-6 rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/90 border border-gray-700'
                  : 'bg-white border border-gray-200'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                      {stats.totalFiles}
                    </p>
                  </div>
                  <FolderOpen className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400 opacity-20 hidden sm:block" />
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/90 border border-gray-700'
                  : 'bg-white border border-gray-200'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Images</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                      {stats.imageCount}
                    </p>
                  </div>
                  <Image className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 dark:text-green-400 opacity-20 hidden sm:block" />
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/90 border border-gray-700'
                  : 'bg-white border border-gray-200'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">PDFs</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {stats.pdfCount}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400 opacity-20 hidden sm:block" />
                </div>
              </div>

              <div className={`p-4 sm:p-6 rounded-xl ${
                isDarkMode
                  ? 'bg-gray-800/90 border border-gray-700'
                  : 'bg-white border border-gray-200'
              } backdrop-blur-sm shadow-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                      {stats.totalStorageMB.toFixed(2)} MB
                    </p>
                  </div>
                  <HardDrive className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 dark:text-orange-400 opacity-20 hidden sm:block" />
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs - scrollable on mobile */}
          <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
            {[
              { key: 'all' as const, label: 'All Files', count: files.length, color: 'blue' },
              { key: 'images' as const, label: 'Images', count: files.filter(f => f.fileType === 'image').length, color: 'green' },
              { key: 'pdfs' as const, label: 'PDFs', count: files.filter(f => f.fileType === 'pdf').length, color: 'purple' },
              { key: 'videos' as const, label: 'Videos', count: files.filter(f => f.fileType === 'video').length, color: 'orange' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 sm:px-6 py-2 rounded-lg font-medium transition-all text-sm sm:text-base whitespace-nowrap flex-shrink-0 ${
                  filter === tab.key
                    ? `bg-${tab.color}-600 text-white shadow-lg`
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                style={filter === tab.key ? {
                  backgroundColor: tab.color === 'blue' ? '#2563eb' : tab.color === 'green' ? '#16a34a' : tab.color === 'purple' ? '#9333ea' : '#ea580c'
                } : undefined}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Files List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className={`text-center py-12 rounded-xl ${
              isDarkMode
                ? 'bg-gray-800/90 border border-gray-700'
                : 'bg-white border border-gray-200'
            } backdrop-blur-sm`}>
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">No files found</p>
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                {filter !== 'all' ? 'Try changing the filter' : 'Upload some files to get started'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={`${file.source}-${file.id}`}
                  className={`p-4 sm:p-6 rounded-xl ${
                    isDarkMode
                      ? 'bg-gray-800/90 border border-gray-700'
                      : 'bg-white border border-gray-200'
                  } backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
                >
                  {/* Mobile: stacked layout, Desktop: row layout */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    {/* Icon + Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`p-2.5 sm:p-3 rounded-lg flex-shrink-0 ${
                        file.fileType === 'pdf'
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : file.fileType === 'video'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {getFileIcon(file.fileType)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-lg text-gray-900 dark:text-white mb-1 truncate">
                          {file.sourceTitle}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {fileManagementService.getSourceDisplayName(file.source)}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {file.category}
                          </span>
                          {file.fileSize && (
                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                              {fileManagementService.formatFileSize(file.fileSize)}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5 truncate">
                          {file.fileName}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 sm:ml-4 flex-shrink-0 self-end sm:self-start">
                      {deleteConfirm === file.id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(file)}
                            disabled={deleting}
                            className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-xs sm:text-sm disabled:opacity-50"
                          >
                            {deleting ? 'Deleting...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting}
                            className="px-3 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors text-xs sm:text-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="Download"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                          </a>
                          <button
                            onClick={() => setDeleteConfirm(file.id)}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
