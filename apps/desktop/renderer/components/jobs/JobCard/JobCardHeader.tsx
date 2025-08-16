'use client';

/**
 * JobCardHeader Component
 * Company branding, logo, and verification status
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckBadgeIcon, StarIcon } from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

import type { CompanyData, CompanyLogo } from '../types/job';

interface JobCardHeaderProps {
  company: CompanyData;
  companyLogo: CompanyLogo;
  isVerified: boolean;
  qualityScore?: number;
  className?: string;
}

export function JobCardHeader({
  company,
  companyLogo,
  isVerified,
  qualityScore,
  className
}: JobCardHeaderProps) {
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {/* Company Logo */}
      <motion.div
        className="relative flex-shrink-0"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        {companyLogo.hasLogo && companyLogo.url ? (
          <img
            src={companyLogo.url}
            alt={`${company.name} logo`}
            className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-white"
            loading="lazy"
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        {/* Initials fallback (always present as backup) */}
        <div
          className={cn(
            'w-12 h-12 rounded-xl bg-gradient-to-br from-jobswipe-400 to-jobswipe-600',
            'flex items-center justify-center text-white font-semibold text-sm',
            companyLogo.hasLogo && companyLogo.url ? 'hidden' : 'flex'
          )}
        >
          {companyLogo.fallback}
        </div>

        {/* Verification badge */}
        {isVerified && (
          <motion.div
            className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
          >
            <CheckBadgeIcon className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </motion.div>

      {/* Company Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {company.name}
          </h3>
          
          {/* Quality score indicator */}
          {qualityScore && qualityScore >= 80 && (
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-600 font-medium">
                {Math.round(qualityScore)}
              </span>
            </div>
          )}
        </div>

        {/* Company details */}
        <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
          {company.industry && (
            <span className="capitalize">{company.industry.toLowerCase()}</span>
          )}
          
          {company.industry && company.size && (
            <span>•</span>
          )}
          
          {company.size && (
            <span className="capitalize">
              {formatCompanySize(company.size)}
            </span>
          )}
          
          {(company.industry || company.size) && company.headquarters && (
            <span>•</span>
          )}
          
          {company.headquarters && (
            <span className="truncate">{company.headquarters}</span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Format company size enum to user-friendly string
 */
function formatCompanySize(size: string): string {
  switch (size) {
    case 'STARTUP':
      return '1-10 employees';
    case 'SMALL':
      return '11-50 employees';
    case 'MEDIUM':
      return '51-200 employees';
    case 'LARGE':
      return '201-1000 employees';
    case 'ENTERPRISE':
      return '1000+ employees';
    default:
      return size.toLowerCase();
  }
}