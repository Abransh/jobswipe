'use client';

/**
 * JobCardBadges Component
 * Status badges that implement Von Restorff Effect for important information
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  ComputerDesktopIcon,
  HeartIcon,
  ClockIcon
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

import type { JobBadge } from '../types/job';

interface JobCardBadgesProps {
  badges: JobBadge[];
  matchScore?: number;
  className?: string;
}

export function JobCardBadges({ badges, matchScore, className }: JobCardBadgesProps) {
  if (badges.length === 0 && !matchScore) return null;

  const getBadgeIcon = (type: JobBadge['type']) => {
    switch (type) {
      case 'new':
        return <SparklesIcon className="w-3 h-3" />;
      case 'urgent':
        return <ExclamationTriangleIcon className="w-3 h-3" />;
      case 'featured':
        return <SparklesIcon className="w-3 h-3" />;
      case 'verified':
        return <CheckBadgeIcon className="w-3 h-3" />;
      case 'remote':
        return <ComputerDesktopIcon className="w-3 h-3" />;
      case 'match':
        return <HeartIcon className="w-3 h-3" />;
      default:
        return <ClockIcon className="w-3 h-3" />;
    }
  };

  const getBadgeColors = (color: JobBadge['color']) => {
    switch (color) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'amber':
        return 'bg-amber-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'purple':
        return 'bg-purple-500 text-white';
      case 'indigo':
        return 'bg-indigo-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {/* Match Score Badge (highest priority if present) */}
      {matchScore && matchScore >= 75 && (
        <motion.div
          className={cn(
            'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            matchScore >= 90 ? 'bg-green-500 text-white' :
            matchScore >= 85 ? 'bg-emerald-500 text-white' :
            'bg-green-400 text-white'
          )}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          whileHover={{ scale: 1.05 }}
        >
          <HeartIcon className="w-3 h-3" />
          <span>{Math.round(matchScore)}% Match</span>
        </motion.div>
      )}

      {/* Regular Badges */}
      {badges.map((badge, index) => (
        <motion.div
          key={`${badge.type}-${index}`}
          className={cn(
            'inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
            'shadow-sm backdrop-blur-sm',
            getBadgeColors(badge.color)
          )}
          initial={{ scale: 0, opacity: 0, x: 10 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          transition={{ 
            delay: index * 0.1,
            type: 'spring', 
            stiffness: 400, 
            damping: 30 
          }}
          whileHover={{ scale: 1.05 }}
        >
          {getBadgeIcon(badge.type)}
          <span>{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}