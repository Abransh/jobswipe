/**
 * @fileoverview Job Applications Dashboard
 * @description Real-time job application status with queue monitoring
 * @version 1.0.0
 * @author JobSwipe Team
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon,
  PlayIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { queueApi, type ApplicationStatus } from '@/lib/api/queue';
import { useQueueStatus, getStatusColor, getStatusIcon, formatStatusMessage } from '@/providers/QueueStatusProvider';
import { formatDistanceToNow } from 'date-fns';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { 
    isConnected, 
    connectionError, 
    applications: realtimeApplications, 
    lastEvent,
    subscribeToApplication,
    reconnect 
  } = useQueueStatus();

  // Load applications
  const loadApplications = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);

      const response = await queueApi.getApplications({
        limit: 100,
        offset: 0,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (response.success && response.data) {
        const apps = response.data.applications;
        setApplications(apps);
        
        // Subscribe to real-time updates for all applications
        apps.forEach(app => {
          subscribeToApplication(app.id);
        });
      } else {
        throw new Error(response.error || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [statusFilter, subscribeToApplication]);

  // Refresh applications
  const refreshApplications = useCallback(async () => {
    setRefreshing(true);
    await loadApplications(false);
    setRefreshing(false);
  }, [loadApplications]);

  // Update applications with real-time data
  useEffect(() => {
    if (realtimeApplications.size > 0) {
      setApplications(prev => 
        prev.map(app => {
          const realtimeApp = realtimeApplications.get(app.id);
          return realtimeApp ? { ...app, ...realtimeApp } : app;
        })
      );
    }
  }, [realtimeApplications]);

  // Load applications on mount and filter change
  useEffect(() => {
    loadApplications(true);
  }, [loadApplications]);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchQuery === '' || 
      app.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get status counts
  const statusCounts = applications.reduce((counts, app) => {
    counts[app.status] = (counts[app.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  if (loading) {
    return <ApplicationsLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
              <p className="text-gray-600 mt-1">Track your job application progress in real-time</p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium
                ${isConnected 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
                }
              `}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                {!isConnected && connectionError && (
                  <button
                    onClick={reconnect}
                    className="ml-2 p-1 hover:bg-red-100 rounded"
                    title="Reconnect"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <button
                onClick={refreshApplications}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Real-time Event Display */}
          <AnimatePresence>
            {lastEvent && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-blue-800 font-medium">{formatStatusMessage(lastEvent)}</p>
                    <p className="text-blue-600 text-sm mt-1">
                      {formatDistanceToNow(lastEvent.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <StatusCard
              title="Total"
              count={applications.length}
              icon="📊"
              color="bg-gray-100 text-gray-700"
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <StatusCard
              title="Pending"
              count={statusCounts.pending || 0}
              icon="⏳"
              color="bg-yellow-100 text-yellow-700"
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
            />
            <StatusCard
              title="Queued"
              count={statusCounts.queued || 0}
              icon="📋"
              color="bg-blue-100 text-blue-700"
              active={statusFilter === 'queued'}
              onClick={() => setStatusFilter('queued')}
            />
            <StatusCard
              title="Processing"
              count={statusCounts.processing || 0}
              icon="⚡"
              color="bg-purple-100 text-purple-700"
              active={statusFilter === 'processing'}
              onClick={() => setStatusFilter('processing')}
            />
            <StatusCard
              title="Completed"
              count={statusCounts.completed || 0}
              icon="✅"
              color="bg-green-100 text-green-700"
              active={statusFilter === 'completed'}
              onClick={() => setStatusFilter('completed')}
            />
            <StatusCard
              title="Failed"
              count={statusCounts.failed || 0}
              icon="❌"
              color="bg-red-100 text-red-700"
              active={statusFilter === 'failed'}
              onClick={() => setStatusFilter('failed')}
            />
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <EmptyState searchQuery={searchQuery} statusFilter={statusFilter} />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredApplications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application}
                  isRealtime={realtimeApplications.has(application.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatusCardProps {
  title: string;
  count: number;
  icon: string;
  color: string;
  active: boolean;
  onClick: () => void;
}

function StatusCard({ title, count, icon, color, active, onClick }: StatusCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-4 rounded-lg border-2 transition-all duration-200 text-left
        ${active 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
      `}
    >
      <div className="flex items-center space-x-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className={`text-2xl font-bold ${active ? 'text-blue-900' : 'text-gray-900'}`}>
            {count}
          </p>
          <p className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-600'}`}>
            {title}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

interface ApplicationCardProps {
  application: ApplicationStatus;
  isRealtime: boolean;
}

function ApplicationCard({ application, isRealtime }: ApplicationCardProps) {
  const statusColors = getStatusColor(application.status);
  const statusIcon = getStatusIcon(application.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-200
        ${isRealtime ? 'ring-2 ring-blue-200' : 'border-gray-200'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{application.job.title}</h3>
            {isRealtime && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1 animate-pulse" />
                Live
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-3">{application.job.company}</p>
          
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Applied {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}</span>
            {application.job.location && (
              <span>📍 {application.job.location}</span>
            )}
            {application.job.salary && (
              <span>💰 ${application.job.salary.min?.toLocaleString()}-${application.job.salary.max?.toLocaleString()}</span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Status Badge */}
          <div className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border
            ${statusColors}
          `}>
            <span className="mr-1">{statusIcon}</span>
            <span className="capitalize">{application.status}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {application.status === 'failed' && (
              <button
                onClick={() => {/* Retry logic */}}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title="Retry Application"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            )}
            
            {(application.status === 'pending' || application.status === 'queued') && (
              <button
                onClick={() => {/* Cancel logic */}}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                title="Cancel Application"
              >
                <XCircleIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress/Error Information */}
      {application.errorMessage && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-medium">Error Details:</p>
          <p className="text-red-700 text-sm mt-1">{application.errorMessage}</p>
        </div>
      )}

      {application.status === 'processing' && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-purple-600">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
            <span>Processing application...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ searchQuery, statusFilter }: { searchQuery: string; statusFilter: string }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {searchQuery || statusFilter !== 'all' 
          ? 'No matching applications found' 
          : 'No job applications yet'
        }
      </h3>
      <p className="text-gray-600 mb-6">
        {searchQuery || statusFilter !== 'all'
          ? 'Try adjusting your search or filter criteria'
          : 'Start swiping on jobs to see your applications here'
        }
      </p>
      {!searchQuery && statusFilter === 'all' && (
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <span>Start Job Swiping</span>
        </button>
      )}
    </div>
  );
}

function ApplicationsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-96" />
          </div>
          
          {/* Stats cards skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
          
          {/* Application cards skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
                <div className="flex space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-4 bg-gray-200 rounded w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}