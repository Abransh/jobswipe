'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  X,
  FileText,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // in bytes
  currentFile?: File | null;
  error?: string;
  className?: string;
  placeholder?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  },
  maxSize = 5 * 1024 * 1024, // 5MB
  currentFile,
  error,
  className = '',
  placeholder = 'Drag & drop your resume here, or click to select'
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptString = Object.values(accept).flat().join(',');

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const validTypes = Object.keys(accept);
      if (!validTypes.includes(file.type)) {
        console.error('Invalid file type');
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        console.error('File too large');
        return;
      }

      processFile(file);
    }
  }, [accept, maxSize]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  const processFile = useCallback((file: File) => {
    // Simulate upload progress for better UX
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 100);

    setTimeout(() => {
      onFileSelect(file);
    }, 500);
  }, [onFileSelect]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
    return <File className="h-6 w-6 text-blue-500" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <AnimatePresence mode="wait">
        {!currentFile ? (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
              transition-all duration-300 ease-in-out
              ${isDragActive
                ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
              }
            `}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptString}
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <motion.div
              animate={{
                scale: isDragActive ? 1.1 : 1,
                rotate: isDragActive ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className={`
                rounded-full p-4 transition-colors duration-300
                ${isDragActive 
                  ? 'bg-blue-100' 
                  : error 
                  ? 'bg-red-100' 
                  : 'bg-gray-100'
                }
              `}>
                {error ? (
                  <AlertCircle className="h-8 w-8 text-red-500" />
                ) : (
                  <Upload className={`
                    h-8 w-8 transition-colors duration-300
                    ${isDragActive ? 'text-blue-600' : 'text-gray-500'}
                  `} />
                )}
              </div>

              <div className="space-y-2">
                <p className={`
                  text-lg font-medium transition-colors duration-300
                  ${isDragActive 
                    ? 'text-blue-700' 
                    : error 
                    ? 'text-red-700' 
                    : 'text-gray-700'
                  }
                `}>
                  {isDragActive ? 'Drop your resume here!' : placeholder}
                </p>
                
                <p className="text-sm text-gray-500">
                  Supports PDF, DOC, DOCX • Max size {formatFileSize(maxSize)}
                </p>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                className="pointer-events-none"
              >
                Choose File
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="file-display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="border-2 border-green-200 bg-green-50 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {getFileIcon(currentFile)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(currentFile.size)}
                  </p>
                </div>

                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Create download link for preview
                    const url = URL.createObjectURL(currentFile);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = currentFile.name;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                {onFileRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onFileRemove}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Upload Progress Bar (shown during upload simulation) */}
            <AnimatePresence>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4"
                >
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Uploading... {uploadProgress}%
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 text-red-600 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}