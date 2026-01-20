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
      const userFiles = await fileManagementService.getUserFiles(user.id);
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
      const fileStats = await fileManagementService.getUserFileStats(user.id);
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
          await fileManagementService.deleteLostFoundImage(file.id, user.id);
          break;
        case 'book_photo':
          await fileManagementService.deleteBookPhoto(file.id, user.id);
          break;
        case 'book_pdf':
          await fileManagementService.deleteBookPdf(file.id, user.id);
          break;
        case 'chatbot_upload':
          await fileManagementService.deleteChatbotUpload(file.id, user.id);
          break;
      }

      // Reload files and stats
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
    if (fileType === 'pdf') return <FileText className="w-6 h-6" />;
    if (fileType === 'video') return <Video className="w-6 h-6" />;
    return <Image className="w-6 h-6" />;
  };

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <AnimatedBackground />
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            My Uploads
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your uploaded files and free up storage space
          </p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-xl ${
              isDarkMode
                ? 'bg-gray-800/90 border border-gray-700'
                : 'bg-white border border-gray-200'
            } backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {stats.totalFiles}
                  </p>
                </div>
                <FolderOpen className="w-12 h-12 text-blue-600 dark:text-blue-400 opacity-20" />
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              isDarkMode
                ? 'bg-gray-800/90 border border-gray-700'
                : 'bg-white border border-gray-200'
            } backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Images</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {stats.imageCount}
                  </p>
                </div>
                <Image className="w-12 h-12 text-green-600 dark:text-green-400 opacity-20" />
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              isDarkMode
                ? 'bg-gray-800/90 border border-gray-700'
                : 'bg-white border border-gray-200'
            } backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">PDFs</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {stats.pdfCount}
                  </p>
                </div>
                <FileText className="w-12 h-12 text-purple-600 dark:text-purple-400 opacity-20" />
              </div>
            </div>

            <div className={`p-6 rounded-xl ${
              isDarkMode
                ? 'bg-gray-800/90 border border-gray-700'
                : 'bg-white border border-gray-200'
            } backdrop-blur-sm shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    {stats.totalStorageMB.toFixed(2)} MB
                  </p>
                </div>
                <HardDrive className="w-12 h-12 text-orange-600 dark:text-orange-400 opacity-20" />
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Files ({files.length})
          </button>
          <button
            onClick={() => setFilter('images')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'images'
                ? 'bg-green-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Images ({files.filter(f => f.fileType === 'image').length})
          </button>
          <button
            onClick={() => setFilter('pdfs')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'pdfs'
                ? 'bg-purple-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            PDFs ({files.filter(f => f.fileType === 'pdf').length})
          </button>
          <button
            onClick={() => setFilter('videos')}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              filter === 'videos'
                ? 'bg-orange-600 text-white shadow-lg'
                : isDarkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Videos ({files.filter(f => f.fileType === 'video').length})
          </button>
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
          <div className="grid grid-cols-1 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={`${file.source}-${file.id}`}
                className={`p-6 rounded-xl ${
                  isDarkMode
                    ? 'bg-gray-800/90 border border-gray-700'
                    : 'bg-white border border-gray-200'
                } backdrop-blur-sm shadow-lg hover:shadow-xl transition-all`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${
                      file.fileType === 'pdf'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    }`}>
                      {getFileIcon(file.fileType)}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                        {file.sourceTitle}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                          {fileManagementService.getSourceDisplayName(file.source)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {file.category}
                        </span>
                        {file.fileSize && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                            {fileManagementService.formatFileSize(file.fileSize)}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 break-all">
                        {file.fileName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <a
                      href={file.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      title="Download"
                    >
                      <Download className="w-5 h-5" />
                    </a>

                    {deleteConfirm === file.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(file)}
                          disabled={deleting}
                          className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          disabled={deleting}
                          className="px-3 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(file.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
