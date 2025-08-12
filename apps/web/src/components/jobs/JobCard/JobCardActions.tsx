'use client';

/**
 * JobCardActions Component
 * Quick action buttons that appear on hover/focus for enhanced interactivity
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon,
  ShareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';
import { cn } from '@/lib/utils';

interface JobCardActionsProps {
  onSave: () => void;
  onShare: () => void;
  onMoreInfo: () => void;
  className?: string;
  isVisible: boolean;
  isSaved?: boolean;
}

export function JobCardActions({
  onSave,
  onShare,
  onMoreInfo,
  className,
  isVisible,
  isSaved = false
}: JobCardActionsProps) {
  const actionButtons = [
    {
      id: 'save',
      label: isSaved ? 'Saved' : 'Save job',
      icon: isSaved ? BookmarkSolidIcon : BookmarkIcon,
      onClick: onSave,
      color: isSaved ? 'text-yellow-500' : 'text-gray-600 hover:text-yellow-500'
    },
    {
      id: 'share',
      label: 'Share job',
      icon: ShareIcon,
      onClick: onShare,
      color: 'text-gray-600 hover:text-blue-500'
    },
    {
      id: 'info',
      label: 'More info',
      icon: InformationCircleIcon,
      onClick: onMoreInfo,
      color: 'text-gray-600 hover:text-indigo-500'
    }
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'flex flex-col space-y-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200',
            className
          )}
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          {actionButtons.map((button, index) => {
            const IconComponent = button.icon;
            
            return (
              <motion.button
                key={button.id}
                onClick={(e) => {
                  e.stopPropagation();
                  button.onClick();
                }}
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg',
                  'transition-colors duration-200',
                  'hover:bg-gray-100 focus:bg-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-jobswipe-300',
                  button.color
                )}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={button.label}
                title={button.label}
              >
                <IconComponent className="w-5 h-5" />
              </motion.button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}