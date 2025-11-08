'use client';

/**
 * Resume Upload Modal Component
 * Prompts user to upload resume before applying to jobs
 * Integrates with S3 for secure file storage
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Info,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/FileUpload';

interface ResumeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (resumeId: string, resumeUrl: string) => void;
  jobTitle?: string;
}

export function ResumeUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
  jobTitle
}: ResumeUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [resumeName, setResumeName] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadError(null);
    // Default resume name from file name
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setResumeName(nameWithoutExt);
  }, []);

  const handleFileRemove = useCallback(() => {
    setSelectedFile(null);
    setResumeName('');
    setUploadError(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setUploadError('Please select a resume file');
      return;
    }

    if (!resumeName.trim()) {
      setUploadError('Please enter a name for your resume');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', resumeName);
      formData.append('isDefault', 'true'); // Set as default resume

      console.log('📤 [RESUME UPLOAD] Starting upload', {
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        resumeName
      });

      // Upload to API endpoint
      const response = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
        // Add auth headers from cookie (handled automatically)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      console.log('✅ [RESUME UPLOAD] Upload successful', {
        resumeId: data.resume?.id,
        pdfUrl: data.resume?.pdfUrl
      });

      // Update progress to 100%
      setUploadProgress(100);

      // Call success callback with resume ID and URL
      if (data.resume && data.resume.id) {
        setTimeout(() => {
          onUploadSuccess(data.resume.id, data.resume.pdfUrl);
          onClose();
        }, 500);
      } else {
        throw new Error('Invalid response from server');
      }

    } catch (error) {
      console.error('❌ [RESUME UPLOAD] Upload failed', error);

      let errorMessage = 'Failed to upload resume. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('authenticated')) {
          errorMessage = 'Please log in to upload your resume.';
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = 'File is too large. Maximum size is 5MB.';
        } else if (error.message.includes('415') || error.message.includes('type')) {
          errorMessage = 'Invalid file type. Please upload PDF, DOC, or DOCX.';
        } else {
          errorMessage = error.message;
        }
      }

      setUploadError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, resumeName, onUploadSuccess, onClose]);

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setResumeName('');
      setUploadError(null);
      setUploadProgress(0);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative">
                <button
                  onClick={handleClose}
                  disabled={isUploading}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Upload Your Resume
                </h2>
                <p className="text-white/90 text-center text-sm">
                  {jobTitle
                    ? `To apply for ${jobTitle}, please upload your resume first`
                    : 'Upload your resume to start applying to jobs instantly'}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-900">
                      <p className="font-medium mb-1">Why do we need your resume?</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Automatically fill job applications</li>
                        <li>Match you with relevant positions</li>
                        <li>Save time by applying with one swipe</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Resume Name Input */}
                <div className="space-y-2">
                  <label htmlFor="resume-name" className="block text-sm font-medium text-gray-700">
                    Resume Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="resume-name"
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    placeholder="e.g., Software Engineer Resume 2024"
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">
                    Give your resume a descriptive name for easy identification
                  </p>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Resume File <span className="text-red-500">*</span>
                  </label>
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    onFileRemove={handleFileRemove}
                    currentFile={selectedFile}
                    error={uploadError}
                    maxSize={5 * 1024 * 1024} // 5MB
                    accept={{
                      'application/pdf': ['.pdf'],
                      'application/msword': ['.doc'],
                      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                    }}
                    placeholder="Drag & drop your resume here, or click to select"
                  />
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                {/* Error Message */}
                <AnimatePresence>
                  {uploadError && !isUploading && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{uploadError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isUploading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || !resumeName.trim() || isUploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload & Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Privacy Notice */}
                <p className="text-xs text-gray-500 text-center">
                  🔒 Your resume is securely stored and encrypted. We never share your information without your consent.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
