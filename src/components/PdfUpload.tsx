'use client';

import { useState, useRef } from 'react';
import { useDarkMode } from '@/app/context/DarkModeContext';

interface PdfUploadProps {
  onPdfUpload: (pdfUrl: string, fileSize: number) => void;
  currentPdf?: string;
  onPdfRemove?: () => void;
}

export default function PdfUpload({ onPdfUpload, currentPdf, onPdfRemove }: PdfUploadProps) {
  const { isDarkMode } = useDarkMode();
  const [uploading, setUploading] = useState(false);
  const [pdfName, setPdfName] = useState<string | null>(currentPdf ? 'Current PDF' : null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size cannot exceed 50MB');
      return;
    }

    setPdfName(file.name);

    // Upload to S3
    setUploading(true);
    setUploadProgress(0);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const formData = new FormData();
      formData.append('file', file);

      // Simulate progress (since we can't track real progress easily)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${API_URL}/api/upload/pdf`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.ok) {
        const data = await response.json();
        onPdfUpload(data.pdfUrl, data.fileSize);
      } else {
        const errorText = await response.text();
        alert(`Upload failed: ${errorText}`);
        setPdfName(null);
      }
    } catch (error) {
      alert('Upload failed. Please try again.');
      setPdfName(null);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleRemovePdf = () => {
    setPdfName(null);
    if (onPdfRemove) {
      onPdfRemove();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        PDF File *
      </label>

      {pdfName ? (
        <div className={`relative p-4 rounded-lg border-2 ${isDarkMode ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {pdfName}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  PDF Document
                </p>
              </div>
            </div>
            <button
              onClick={handleRemovePdf}
              disabled={uploading}
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-200 disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 ${
            isDarkMode
              ? 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Click to upload PDF
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
            PDF files up to 50MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Uploading...
            </span>
            <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              {uploadProgress}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
