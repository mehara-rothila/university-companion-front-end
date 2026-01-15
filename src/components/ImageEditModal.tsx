'use client';

import { useState } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';
import ImageUpload from './ImageUpload';

interface ImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  currentImage?: string | null;
  onSave: (imageUrl: string) => Promise<void>;
  entityType: 'event' | 'competition' | 'book';
}

export default function ImageEditModal({
  isOpen,
  onClose,
  title,
  currentImage,
  onSave,
  entityType
}: ImageEditModalProps) {
  const { isDarkMode } = useDarkMode();
  const [imageUrl, setImageUrl] = useState<string>(currentImage || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
    setError(null);
  };

  const handleImageRemove = () => {
    setImageUrl('');
  };

  const handleSave = async () => {
    if (!imageUrl) {
      setError('Please upload an image first');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(imageUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setImageUrl(currentImage || '');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative w-full max-w-md transform rounded-xl shadow-2xl transition-all ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Edit {entityType.charAt(0).toUpperCase() + entityType.slice(1)} Image
            </h3>
            <button
              onClick={handleClose}
              className={`rounded-lg p-1 transition-colors ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {title}
            </p>

            <ImageUpload
              currentImage={imageUrl || undefined}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
            />

            {error && (
              <p className="mt-3 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-3 px-6 py-4 border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              onClick={handleClose}
              disabled={saving}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !imageUrl}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                saving || !imageUrl
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Image'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
