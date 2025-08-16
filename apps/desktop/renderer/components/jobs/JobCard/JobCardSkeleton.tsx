'use client';

/**
 * JobCardSkeleton Component
 * Loading state skeleton that maintains the visual structure and dimensions of the JobCard
 * Implements smooth loading animations and accessibility features
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface JobCardSkeletonProps {
  className?: string;
  animate?: boolean;
  count?: number;
}

/**
 * Individual skeleton card component
 */
function SkeletonCard({ animate = true, className }: { animate?: boolean; className?: string }) {
  const shimmerVariants = {
    initial: { 
      backgroundPosition: '-200% 0' 
    },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear"
      }
    }
  };

  const Skeleton = ({ width = 'w-full', height = 'h-4', className: skeletonClassName }: {
    width?: string;
    height?: string;
    className?: string;
  }) => (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md',
        width,
        height,
        skeletonClassName
      )}
      variants={animate ? shimmerVariants : {}}
      initial="initial"
      animate="animate"
      style={animate ? {
        backgroundSize: '200% 100%'
      } : {}}
    />
  );

  return (
    <motion.div
      className={cn(
        'relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg',
        'border border-gray-200 p-6 space-y-4',
        'backdrop-blur-sm bg-white/90',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="Loading job card"
    >
      {/* Header skeleton */}
      <div className="flex items-center space-x-3">
        {/* Company logo skeleton */}
        <Skeleton width="w-12" height="h-12" className="rounded-xl flex-shrink-0" />
        
        {/* Company info skeleton */}
        <div className="flex-1 space-y-2">
          <Skeleton width="w-32" height="h-4" />
          <Skeleton width="w-24" height="h-3" />
        </div>

        {/* Badge skeleton */}
        <Skeleton width="w-16" height="h-6" className="rounded-full" />
      </div>

      {/* Job title skeleton */}
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-6" />
        <Skeleton width="w-3/4" height="h-6" />
        
        {/* Metadata skeleton */}
        <div className="flex items-center space-x-2 mt-2">
          <Skeleton width="w-20" height="h-3" />
          <span className="text-gray-300">•</span>
          <Skeleton width="w-16" height="h-3" />
          <span className="text-gray-300">•</span>
          <Skeleton width="w-18" height="h-3" />
        </div>
      </div>

      {/* Salary skeleton */}
      <div className="bg-gray-50 rounded-lg p-3">
        <Skeleton width="w-32" height="h-5" />
      </div>

      {/* Location and remote skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton width="w-28" height="h-4" />
        <Skeleton width="w-16" height="h-6" className="rounded-md" />
      </div>

      {/* Description skeleton */}
      <div className="space-y-2">
        <Skeleton width="w-full" height="h-3" />
        <Skeleton width="w-full" height="h-3" />
        <Skeleton width="w-2/3" height="h-3" />
      </div>

      {/* Skills skeleton */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton width="w-10" height="h-3" />
          <div className="flex space-x-2">
            <Skeleton width="w-12" height="h-6" className="rounded-md" />
            <Skeleton width="w-16" height="h-6" className="rounded-md" />
            <Skeleton width="w-14" height="h-6" className="rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <Skeleton width="w-20" height="h-3" />
        <Skeleton width="w-16" height="h-3" />
      </div>

      {/* Loading indicator */}
      <div className="sr-only" aria-live="polite">
        Loading job information...
      </div>
    </motion.div>
  );
}

/**
 * Main JobCardSkeleton component supporting multiple cards
 */
export function JobCardSkeleton({ 
  className, 
  animate = true, 
  count = 1 
}: JobCardSkeletonProps) {
  // Generate multiple skeleton cards if count > 1
  const skeletonCards = Array.from({ length: count }, (_, index) => (
    <SkeletonCard 
      key={index} 
      animate={animate}
      className={cn(
        count > 1 && 'mb-4',
        className
      )}
    />
  ));

  if (count === 1) {
    return skeletonCards[0];
  }

  return (
    <div className="space-y-4" role="status" aria-label={`Loading ${count} job cards`}>
      {skeletonCards}
      <div className="sr-only" aria-live="polite">
        Loading {count} job cards...
      </div>
    </div>
  );
}

/**
 * Compact skeleton variant for list views
 */
export function JobCardSkeletonCompact({ 
  className, 
  animate = true 
}: Omit<JobCardSkeletonProps, 'count'>) {
  const shimmerVariants = {
    initial: { 
      backgroundPosition: '-200% 0' 
    },
    animate: { 
      backgroundPosition: '200% 0',
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear"
      }
    }
  };

  const Skeleton = ({ width = 'w-full', height = 'h-3', className: skeletonClassName }: {
    width?: string;
    height?: string;
    className?: string;
  }) => (
    <motion.div
      className={cn(
        'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded',
        width,
        height,
        skeletonClassName
      )}
      variants={animate ? shimmerVariants : {}}
      initial="initial"
      animate="animate"
      style={animate ? {
        backgroundSize: '200% 100%'
      } : {}}
    />
  );

  return (
    <motion.div
      className={cn(
        'flex items-center space-x-3 p-4 bg-white rounded-lg shadow-sm border border-gray-200',
        className
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label="Loading compact job card"
    >
      {/* Company logo */}
      <Skeleton width="w-10" height="h-10" className="rounded-lg flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 space-y-2">
        <Skeleton width="w-48" height="h-4" />
        <div className="flex items-center space-x-2">
          <Skeleton width="w-20" height="h-3" />
          <span className="text-gray-300">•</span>
          <Skeleton width="w-16" height="h-3" />
        </div>
      </div>

      {/* Action skeleton */}
      <Skeleton width="w-8" height="h-8" className="rounded-full" />

      <div className="sr-only" aria-live="polite">
        Loading compact job information...
      </div>
    </motion.div>
  );
}

/**
 * Grid skeleton for dashboard views
 */
export function JobCardSkeletonGrid({ 
  className,
  animate = true,
  columns = 3,
  rows = 2
}: JobCardSkeletonProps & { columns?: number; rows?: number }) {
  const totalCards = columns * rows;

  return (
    <div 
      className={cn(
        `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} lg:grid-cols-${columns} gap-6`,
        className
      )}
      role="status"
      aria-label={`Loading ${totalCards} job cards in grid`}
    >
      {Array.from({ length: totalCards }, (_, index) => (
        <SkeletonCard 
          key={index} 
          animate={animate}
        />
      ))}
      <div className="sr-only" aria-live="polite">
        Loading {totalCards} job cards...
      </div>
    </div>
  );
}

export default JobCardSkeleton;