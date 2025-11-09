'use client';

/**
 * Premium Dashboard Page
 * Apple-Level Minimal Aesthetic with Advanced Animations
 *
 * Design Principles:
 * - Minimal: 90% neutral, 10% primary
 * - Clarity: Information hierarchy through typography
 * - Deference: Content over chrome
 * - Precision: Pixel-perfect spacing & animations
 */

import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import {
  BriefcaseIcon,
  ClockIcon,
  HeartIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] // Apple easing
    }
  }
};

// Mock data - replace with real API calls
const stats = [
  {
    name: 'Applications',
    value: '24',
    change: '+4',
    changePercent: '+20%',
    trend: 'up',
    icon: BriefcaseIcon,
    description: 'This week',
  },
  {
    name: 'Interviews',
    value: '3',
    change: '+1',
    changePercent: '+50%',
    trend: 'up',
    icon: ClockIcon,
    description: 'Scheduled',
  },
  {
    name: 'Saved',
    value: '12',
    change: '+2',
    changePercent: '+20%',
    trend: 'up',
    icon: HeartIcon,
    description: 'Jobs saved',
  },
  {
    name: 'Response',
    value: '12.5%',
    change: '+2.1%',
    changePercent: '+20%',
    trend: 'up',
    icon: ChartBarIcon,
    description: 'Rate',
  },
];

const recentApplications = [
  {
    id: 1,
    company: 'Acme Corp',
    position: 'Senior Frontend Developer',
    status: 'pending',
    appliedAt: '2h ago',
    location: 'San Francisco, CA',
  },
  {
    id: 2,
    company: 'TechFlow',
    position: 'Full Stack Engineer',
    status: 'interview',
    appliedAt: '1d ago',
    location: 'Remote',
  },
  {
    id: 3,
    company: 'DataViz Inc',
    position: 'React Developer',
    status: 'rejected',
    appliedAt: '3d ago',
    location: 'New York, NY',
  },
  {
    id: 4,
    company: 'StartupXYZ',
    position: 'Software Engineer',
    status: 'pending',
    appliedAt: '5d ago',
    location: 'Austin, TX',
  },
];

const quickActions = [
  {
    name: 'Find Jobs',
    description: 'Swipe through opportunities',
    href: '/jobs',
    icon: SparklesIcon,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
  },
  {
    name: 'Update Resume',
    description: 'Manage your resumes',
    href: '/dashboard/resumes',
    icon: DocumentTextIcon,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  {
    name: 'View Analytics',
    description: 'Track your progress',
    href: '/dashboard/analytics',
    icon: ChartBarIcon,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
];

function getStatusConfig(status: string) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pending',
        icon: ClockIcon,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
      };
    case 'interview':
      return {
        label: 'Interview',
        icon: CheckCircleIcon,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-950/30',
      };
    case 'rejected':
      return {
        label: 'Closed',
        icon: XCircleIcon,
        color: 'text-gray-500 dark:text-gray-500',
        bgColor: 'bg-gray-50 dark:bg-gray-900',
      };
    default:
      return {
        label: status,
        icon: ClockIcon,
        color: 'text-gray-600 dark:text-gray-400',
        bgColor: 'bg-gray-100 dark:bg-gray-800',
      };
  }
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-title-1 font-semibold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-body text-gray-500 dark:text-gray-400">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}. Here's your job search overview.
            </p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: 0.2 + index * 0.1,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer"
              >
                {/* Icon */}
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-colors duration-300">
                    <stat.icon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </div>

                  {/* Trend indicator */}
                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                    <span className="text-caption font-medium text-green-600 dark:text-green-400">
                      {stat.changePercent}
                    </span>
                  </div>
                </div>

                {/* Value */}
                <div className="mt-4">
                  <h3 className="text-title-2 font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </h3>
                  <p className="mt-1 text-subhead text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="mt-0.5 text-caption text-gray-500 dark:text-gray-500">
                    {stat.description}
                  </p>
                </div>

                {/* Subtle hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gray-50/0 to-gray-50/0 group-hover:from-gray-50/50 group-hover:to-transparent dark:group-hover:from-gray-800/50 dark:group-hover:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Applications */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-title-3 font-semibold text-gray-900 dark:text-white">
                    Recent Applications
                  </h2>
                  <p className="mt-1 text-caption text-gray-500 dark:text-gray-400">
                    Your latest job applications
                  </p>
                </div>
                <Link
                  href="/dashboard/applications"
                  className="group flex items-center gap-1.5 text-subhead font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  View all
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {recentApplications.map((application, index) => {
                const statusConfig = getStatusConfig(application.status);

                return (
                  <motion.div
                    key={application.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-subhead font-medium text-gray-900 dark:text-white truncate">
                          {application.position}
                        </h3>
                        <p className="mt-1 text-caption text-gray-600 dark:text-gray-400">
                          {application.company} · {application.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="hidden sm:block text-caption text-gray-500 dark:text-gray-500">
                          {application.appliedAt}
                        </span>
                        <div className={cn(
                          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                          statusConfig.bgColor
                        )}>
                          <statusConfig.icon className={cn('h-4 w-4', statusConfig.color)} />
                          <span className={cn('text-caption font-medium', statusConfig.color)}>
                            {statusConfig.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800">
              <Link
                href="/dashboard/applications"
                className="block w-full py-2.5 text-center text-subhead font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                View all applications
              </Link>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <h2 className="text-title-3 font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {quickActions.map((action, index) => (
                <Link key={action.name} href={action.href}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.9 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    whileHover={{
                      scale: 1.02,
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 cursor-pointer"
                  >
                    <div className={cn(
                      'inline-flex p-3 rounded-xl transition-colors duration-300',
                      action.bgColor,
                      'group-hover:scale-110'
                    )}>
                      <action.icon className={cn('h-6 w-6', action.color)} />
                    </div>

                    <h3 className="mt-4 text-subhead font-semibold text-gray-900 dark:text-white">
                      {action.name}
                    </h3>
                    <p className="mt-1 text-caption text-gray-500 dark:text-gray-400">
                      {action.description}
                    </p>

                    <div className="mt-4 flex items-center gap-1 text-caption font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Get started
                      <ArrowRightIcon className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {/* Premium shadow on hover */}
                    <div className="absolute inset-0 rounded-2xl shadow-premium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}