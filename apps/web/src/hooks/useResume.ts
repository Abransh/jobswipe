'use client';

/**
 * Resume Management Hook
 * Provides resume checking and management functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface Resume {
  id: string;
  name: string;
  title?: string;
  pdfUrl?: string;
  docxUrl?: string;
  htmlUrl?: string;
  fileSize?: number;
  pageCount?: number;
  isDefault: boolean;
  aiEnhanced: boolean;
  completeness?: number;
  readabilityScore?: number;
  keywordMatch?: number;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    applications: number;
  };
}

export interface UseResumeReturn {
  resumes: Resume[];
  defaultResume: Resume | null;
  hasResume: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  uploadResume: (file: File, name: string, isDefault: boolean) => Promise<Resume>;
  deleteResume: (resumeId: string) => Promise<void>;
  setDefaultResume: (resumeId: string) => Promise<void>;
}

export function useResume(): UseResumeReturn {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user's resumes from API
   */
  const fetchResumes = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('📥 [useResume] Fetching user resumes...');

      const response = await fetch('/api/v1/resumes/upload', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view resumes');
          setResumes([]);
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch resumes');
      }

      const data = await response.json();

      console.log('✅ [useResume] Resumes fetched:', {
        count: data.resumes?.length || 0,
        hasDefault: data.resumes?.some((r: Resume) => r.isDefault) || false,
      });

      setResumes(data.resumes || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resumes';
      console.error('❌ [useResume] Error fetching resumes:', errorMessage);
      setError(errorMessage);
      setResumes([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  /**
   * Upload a new resume
   */
  const uploadResume = useCallback(
    async (file: File, name: string, isDefault: boolean): Promise<Resume> => {
      console.log('📤 [useResume] Uploading resume:', { name, isDefault });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('isDefault', String(isDefault));

      const response = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const data = await response.json();

      console.log('✅ [useResume] Resume uploaded:', data.resume?.id);

      // Refetch to update list
      await fetchResumes();

      return data.resume;
    },
    [fetchResumes]
  );

  /**
   * Delete a resume
   */
  const deleteResume = useCallback(
    async (resumeId: string): Promise<void> => {
      console.log('🗑️ [useResume] Deleting resume:', resumeId);

      const response = await fetch(`/api/v1/resumes/${resumeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete resume');
      }

      console.log('✅ [useResume] Resume deleted:', resumeId);

      // Refetch to update list
      await fetchResumes();
    },
    [fetchResumes]
  );

  /**
   * Set a resume as default
   */
  const setDefaultResume = useCallback(
    async (resumeId: string): Promise<void> => {
      console.log('⭐ [useResume] Setting default resume:', resumeId);

      const response = await fetch(`/api/v1/resumes/${resumeId}/default`, {
        method: 'PATCH',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to set default resume');
      }

      console.log('✅ [useResume] Default resume set:', resumeId);

      // Refetch to update list
      await fetchResumes();
    },
    [fetchResumes]
  );

  // Fetch resumes on mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchResumes();
    } else if (!isAuthenticated && !authLoading) {
      setResumes([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading, fetchResumes]);

  // Computed values
  const defaultResume = resumes.find((r) => r.isDefault) || resumes[0] || null;
  const hasResume = resumes.length > 0;

  return {
    resumes,
    defaultResume,
    hasResume,
    isLoading,
    error,
    refetch: fetchResumes,
    uploadResume,
    deleteResume,
    setDefaultResume,
  };
}
