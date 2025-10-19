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
  async uploadImage(file: File): Promise<UploadResponse> {
    this.validateImageFile(file);
    return await this.uploadToS3(file, '/api/upload/image');
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
  private async uploadToS3(file: File, endpoint: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.API_URL}${endpoint}`, {
      method: 'POST',
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
      message: data.message || 'File uploaded successfully'
    };
  }

  // Process PDF with AI (extract text and analyze)
  async processPdfWithAI(fileUrl: string, geminiApiKey: string): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      // For PDF processing, we'll need to implement text extraction
      // This would typically involve:
      // 1. Download PDF from S3
      // 2. Extract text using PDF.js or similar
      // 3. Send to Gemini for analysis
      
      // Placeholder implementation
      const extractedText = await this.extractPdfText(fileUrl);
      const tokensUsed = Math.ceil(extractedText.length / 4); // Rough estimate: 4 chars = 1 token
      
      const processingTime = Date.now() - startTime;
      
      return {
        extractedText,
        processingTime,
        tokensUsed
      };
    } catch (error) {
      throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Process image with AI (analyze and describe)
  async processImageWithAI(fileUrl: string, geminiApiKey: string): Promise<FileProcessingResult> {
    const startTime = Date.now();
    
    try {
      if (!geminiApiKey) {
        throw new Error('Gemini API key is not configured');
      }

      // Use Gemini Vision for image analysis
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiApiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: "Analyze this image and provide a detailed description. Focus on any text, objects, people, or relevant details that might be helpful for a university student."
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: await this.getImageAsBase64(fileUrl)
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Could not analyze image';
      const tokensUsed = Math.ceil(extractedText.length / 4) + 258; // Include image tokens
      
      const processingTime = Date.now() - startTime;
      
      return {
        extractedText,
        processingTime,
        tokensUsed
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Convert image URL to base64 for Gemini Vision
  private async getImageAsBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error('Failed to convert image to base64');
    }
  }

  // Extract text from PDF (placeholder - would need actual PDF.js implementation)
  private async extractPdfText(pdfUrl: string): Promise<string> {
    // This is a placeholder. In a real implementation, you'd:
    // 1. Fetch the PDF from the URL
    // 2. Use PDF.js to extract text
    // 3. Return the extracted text
    
    // For now, return a placeholder
    return `Extracted text from PDF: ${pdfUrl}\n\nThis is a placeholder for PDF text extraction. In a production implementation, this would contain the actual text content extracted from the uploaded PDF document using libraries like PDF.js or similar tools.`;
  }

  // File validation methods
  private validateImageFile(file: File): void {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only image files (JPG, PNG, GIF, WebP) are allowed');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
      throw new Error('Image file size cannot exceed 10MB');
    }
  }

  private validatePdfFile(file: File): void {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      throw new Error('PDF file size cannot exceed 50MB');
    }
  }

  private validateVideoFile(file: File): void {
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!validTypes.includes(file.type)) {
      throw new Error('Only video files (MP4, WebM, OGG, AVI, MOV) are allowed');
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB
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