'use client';

/**
 * JobDetailModal - Expandable job detail overlay
 * Shows comprehensive job information when user clicks on job card
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, MapPin, Clock, DollarSign, Building, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { prepareJobDescriptionHTML } from '@/lib/utils/htmlUtils';
import type { JobData } from '../types/job';

export interface JobDetailModalProps {
  job: JobData | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onShare?: (jobId: string) => void;
  matchScore?: number;
  isApplying?: boolean;
  className?: string;
}

export function JobDetailModal({
  job,
  isOpen,
  onClose,
  onApply,
  onSave,
  onShare,
  matchScore = 85,
  isApplying = false,
  className
}: JobDetailModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!job) return null;

  // Format salary display
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return null;
    if (job.salaryMin && job.salaryMax) {
      return `${job.currency || '$'}${job.salaryMin.toLocaleString()} - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`;
    }
    return job.salaryMin ? `${job.currency || '$'}${job.salaryMin.toLocaleString()}+` : `Up to ${job.currency || '$'}${job.salaryMax?.toLocaleString()}`;
  };

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: {
      opacity: 0,
      y: '100%',
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }
    },
    exit: {
      opacity: 0,
      y: '100%',
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl",
              "flex flex-col overflow-hidden",
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-gray-100">
              {/* Close Button */}
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>

              {/* Company Logo */}
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-700">
                    {job.company.name.charAt(0)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
                  <div className="flex items-center text-lg text-gray-700 mb-2">
                    <Building className="w-5 h-5 mr-2" />
                    {job.company.name}
                    {job.company.isVerified && (
                      <div className="ml-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Match Score */}
                  <div className="flex items-center space-x-2">
                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      <Star className="w-4 h-4 inline mr-1" />
                      {matchScore}% match
                    </div>
                    {job.isUrgent && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        🔥 Urgent
                      </div>
                    )}
                    {job.isFeatured && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        ⭐ Featured
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Quick Info Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-xs text-blue-600 font-medium">Type & Level</div>
                    <div className="text-sm font-semibold text-gray-900">{job.type} • {job.level}</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-3 flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-xs text-green-600 font-medium">Location</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {job.location || 'Remote'}
                      {job.remote && <span className="text-green-600"> • Remote OK</span>}
                    </div>
                  </div>
                </div>

                {formatSalary() && (
                  <div className="bg-emerald-50 rounded-xl p-3 flex items-center space-x-3">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <div>
                      <div className="text-xs text-emerald-600 font-medium">Salary</div>
                      <div className="text-sm font-semibold text-gray-900">{formatSalary()}</div>
                    </div>
                  </div>
                )}

                {job.experienceYears && (
                  <div className="bg-purple-50 rounded-xl p-3 flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-xs text-purple-600 font-medium">Experience</div>
                      <div className="text-sm font-semibold text-gray-900">{job.experienceYears}+ years</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Job Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h3>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-gray-900 [&>h2]:mt-4 [&>h2]:mb-2 [&>h3]:text-base [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-3 [&>h3]:mb-2 [&>p]:mb-3 [&>p]:text-gray-700 [&>ul]:mb-3 [&>ul]:ml-4 [&>li]:mb-1 [&>strong]:font-semibold [&>strong]:text-gray-900"
                  dangerouslySetInnerHTML={{ __html: prepareJobDescriptionHTML(job.description) }}
                />
              </div>

              {/* Requirements */}
              {job.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <div className="space-y-2">
                    {job.requirements.split(/[•\n\r]/).filter(req => req.trim().length > 0).map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">{requirement.trim()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills */}
              {job.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                    {job.benefits.split('\n').map((benefit, index) => (
                      <p key={index} className="mb-2">
                        {benefit}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Company Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About {job.company.name}</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  {job.company.description && (
                    <p className="text-gray-700 leading-relaxed">{job.company.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {job.company.industry && (
                      <div>
                        <span className="font-medium text-gray-900">Industry:</span>
                        <span className="ml-1 text-gray-600">{job.company.industry}</span>
                      </div>
                    )}
                    {job.company.size && (
                      <div>
                        <span className="font-medium text-gray-900">Company Size:</span>
                        <span className="ml-1 text-gray-600">{job.company.size}</span>
                      </div>
                    )}
                    {job.company.headquarters && (
                      <div>
                        <span className="font-medium text-gray-900">HQ:</span>
                        <span className="ml-1 text-gray-600">{job.company.headquarters}</span>
                      </div>
                    )}
                    {job.company.foundedYear && (
                      <div>
                        <span className="font-medium text-gray-900">Founded:</span>
                        <span className="ml-1 text-gray-600">{job.company.foundedYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <motion.button
                  onClick={() => onApply?.(job.id)}
                  disabled={isApplying}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg",
                    isApplying && "opacity-50 cursor-not-allowed"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isApplying ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Applying...</span>
                    </div>
                  ) : (
                    'Apply Now'
                  )}
                </motion.button>

                <motion.button
                  onClick={() => {
                    onSave?.(job.id);
                    onApply?.(job.id); // Also apply to the job like swiping right
                  }}
                  className="bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 font-semibold py-3 px-6 rounded-xl border border-gray-200 hover:border-red-200 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>Save & Apply</span>
                  </div>
                </motion.button>

                <motion.button
                  onClick={() => onShare?.(job.id)}
                  className="bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-200 transition-all duration-200 shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}