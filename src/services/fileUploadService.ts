// File Upload Service for Athena AI Assistant
import { ChatAttachment } from '@/types/athena';

export interface UploadResponse {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  message: string;
}

export interface FileProcessingResult {
  extractedText?: string;
  transcription?: string;
  summary?: string;
  processingTime: number;
  tokensUsed: number;
}

class FileUploadService {
  private readonly API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Upload image to S3
  async uploadImage(file: File, folder?: string): Promise<UploadResponse> {
    this.validateImageFile(file);
    return await this.uploadToS3(file, '/api/upload/image', folder);
  }

  // Upload PDF to S3
  async uploadPdf(file: File): Promise<UploadResponse> {
    this.validatePdfFile(file);
    return await this.uploadToS3(file, '/api/upload/pdf');
  }

  // Upload video for transcription (using existing image endpoint for now)
  async uploadVideo(file: File): Promise<UploadResponse> {
    this.validateVideoFile(file);
    // For now, we'll use a general file upload endpoint
    return await this.uploadToS3(file, '/api/upload/video');
  }

  // General S3 upload method
  private async uploadToS3(file: File, endpoint: string, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // Add folder parameter if provided
    if (folder) {
      formData.append('folder', folder);
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const data = await response.json();

    return {
      fileUrl: data.imageUrl || data.pdfUrl || data.fileUrl,
      fileName: file.name,
      fileSize: file.size,
      message: data.message || 'File uploaded successfully',
    };
  }

  // Process PDF with AI — backend Kimi handles text extraction
  async processPdfWithAI(fileUrl: string): Promise<FileProcessingResult> {
    return {
      extractedText: '',
      processingTime: 0,
      tokensUsed: 0,
    };
  }

  // Process image with AI — backend Kimi handles vision analysis
  async processImageWithAI(fileUrl: string): Promise<FileProcessingResult> {
    return {
      extractedText: '',
      processingTime: 0,
      tokensUsed: 0,
    };
  }

  // File validation methods
  private validateImageFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only image files (JPG, PNG, GIF, WebP) are allowed');
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      throw new Error('Image file size cannot exceed 10MB');
    }
  }

  private validatePdfFile(file: File): void {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB
      throw new Error('PDF file size cannot exceed 50MB');
    }
  }

  private validateVideoFile(file: File): void {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only video files (MP4, WebM, OGG, AVI, MOV) are allowed');
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB
      throw new Error('Video file size cannot exceed 100MB');
    }
  }

  // Get file type category
  getFileType(file: File): 'image' | 'pdf' | 'video' | null {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    if (file.type.startsWith('video/')) return 'video';
    return null;
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileUploadService = new FileUploadService();
