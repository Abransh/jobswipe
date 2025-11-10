'use client';

/**
 * JobCardContent Component
 * Main job information display with optimal information hierarchy
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  ComputerDesktopIcon,
  HomeIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

import type { JobData, FormattedSalary } from '../types/job';

interface JobCardContentProps {
  job: JobData;
  formattedSalary: FormattedSalary;
  className?: string;
  descriptionId?: string;
}

export function JobCardContent({
  job,
  formattedSalary,
  className,
  descriptionId
}: JobCardContentProps) {
  // Format job posting time
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Truncate description for card display
  const truncateDescription = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  // Generate skill tags (limit to most relevant)
  const getTopSkills = (skills: string[], maxSkills: number = 6): string[] => {
    return skills.slice(0, maxSkills);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Job Title - Primary focus point */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
          {job.title}
        </h2>
        
        {/* Job metadata */}
        <div className="flex items-center space-x-3 text-sm text-gray-500 mt-2">
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>
              {job.postedAt ? formatTimeAgo(new Date(job.postedAt)) : 'Recently posted'}
            </span>
          </div>
          
          {job.type && (
            <>
              <span>•</span>
              <span className="capitalize">
                {job.type.toLowerCase().replace('_', ' ')}
              </span>
            </>
          )}
          
          {job.level && (
            <>
              <span>•</span>
              <span className="capitalize">
                {job.level.toLowerCase()}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Salary - Prominent but not dominant */}
      <motion.div
        className="flex items-center space-x-2 text-green-700 bg-green-50 rounded-lg p-3"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <CurrencyDollarIcon className="w-5 h-5 flex-shrink-0" />
        <span className="font-semibold text-sm">
          {formattedSalary.display}
        </span>
        {job.equity && (
          <>
            <span className="text-green-600">•</span>
            <span className="text-sm text-green-600">Equity</span>
          </>
        )}
      </motion.div>

      {/* Location and Work Type */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-1 text-gray-600">
          <MapPinIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">
            {job.location || `${job.city || 'Location'}${job.state ? `, ${job.state}` : ''}`}
          </span>
        </div>

        {/* Remote work indicator */}
        {job.remote && (
          <div className="flex items-center space-x-1 text-indigo-600 bg-indigo-50 rounded-md px-2 py-1">
            {job.remoteType === 'REMOTE' ? (
              <ComputerDesktopIcon className="w-4 h-4" />
            ) : (
              <HomeIcon className="w-4 h-4" />
            )}
            <span className="text-xs font-medium">
              {job.remoteType === 'REMOTE' ? 'Remote' : 'Hybrid'}
            </span>
          </div>
        )}
      </div>

      {/* Job Description Preview */}
      <div id={descriptionId}>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {truncateDescription(job.description)}
        </p>
      </div>

      {/* Skills Tags */}
      {job.skills && job.skills.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">Skills:</span>
          <div className="flex flex-wrap gap-1">
            {getTopSkills(job.skills).map((skill, index) => (
              <motion.span
                key={skill}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {skill}
              </motion.span>
            ))}
            
            {job.skills.length > 3 && (
              <span className="text-xs text-gray-500 self-center">
                +{job.skills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Benefits Preview (if available) */}
      {job.benefits && (
        <div className="border-t border-gray-100 pt-3 mt-3">
          <div className="flex items-start space-x-2">
            <span className="text-xs text-gray-500 font-medium flex-shrink-0 mt-1">
              Benefits:
            </span>
            <p className="text-xs text-gray-600 line-clamp-2">
              {truncateDescription(job.benefits, 80)}
            </p>
          </div>
        </div>
      )}

      {/* Application Stats */}
      {job.applicationCount > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-3 mt-3">
          <span>
            {job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}
          </span>
          
          {job.viewCount > 0 && (
            <span>
              {job.viewCount} view{job.viewCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}