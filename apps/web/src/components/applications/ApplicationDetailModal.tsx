'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { ApplicationStatus } from '@/lib/api/queue';

interface ApplicationDetailModalProps {
  application: ApplicationStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ApplicationDetailModal({
  application,
  isOpen,
  onClose
}: ApplicationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'responses'>('overview');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setActiveTab('overview');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!application) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'processing':
        return <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'queued':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] z-50 p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>

                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center flex-shrink-0">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{application.job.title}</h2>
                    <div className="flex items-center space-x-4 text-white/90 text-sm">
                      <div className="flex items-center space-x-1">
                        <Building2 className="h-4 w-4" />
                        <span>{application.job.company}</span>
                      </div>
                      {application.job.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{application.job.location}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border ${getStatusColor(application.status)} bg-white`}>
                    {getStatusIcon(application.status)}
                    <span className="font-medium capitalize">{application.status}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 px-6">
                <div className="flex space-x-8">
                  {['overview', 'resume', 'responses'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(application.createdAt), 'PPP p')}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>

                        {application.updatedAt && application.updatedAt !== application.createdAt && (
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">Last Updated</p>
                              <p className="text-sm text-gray-600">
                                {format(new Date(application.updatedAt), 'PPP p')}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(application.updatedAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Job Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {application.job.salary && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-gray-600 mb-2">
                              <DollarSign className="h-4 w-4" />
                              <span className="text-sm font-medium">Salary Range</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">
                              ${application.job.salary.min?.toLocaleString()} - ${application.job.salary.max?.toLocaleString()}
                            </p>
                            {application.job.salary.currency && (
                              <p className="text-xs text-gray-500 mt-1">{application.job.salary.currency}</p>
                            )}
                          </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2 text-gray-600 mb-2">
                            <Briefcase className="h-4 w-4" />
                            <span className="text-sm font-medium">Application ID</span>
                          </div>
                          <p className="text-sm font-mono text-gray-900">{application.id}</p>
                        </div>
                      </div>

                      {application.job.url ? (
                        <a
                          href={application.job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <span>View Original Job Posting</span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <p className="mt-4 text-sm text-gray-500">
                          Job posting URL not available
                        </p>
                      )}
                    </div>

                    {/* Error Message if Failed */}
                    {application.errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-red-900 mb-1">Error Details</h4>
                            <p className="text-sm text-red-800">{application.errorMessage}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'resume' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Resume Submitted</h3>
                      {application.metadata?.resume?.url && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={application.metadata.resume.url} download>
                            <Download className="h-4 w-4 mr-2" />
                            Download Resume
                          </a>
                        </Button>
                      )}
                    </div>

                    {application.metadata?.resume ? (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.metadata.resume.fileName || 'Resume.pdf'}
                            </p>
                            <p className="text-sm text-gray-600">Submitted with application</p>
                          </div>
                        </div>

                        {application.metadata.resume.summary && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resume Summary</h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {application.metadata.resume.summary}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Resume Tracking Coming Soon</h4>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                          We're working on a feature to track which resume was submitted with each application.
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                          Feature in development
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'responses' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Responses</h3>

                    {application.metadata?.responses && Object.keys(application.metadata.responses).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(application.metadata.responses).map(([question, answer], index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-2">{question}</p>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{String(answer)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300">
                        <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Response Tracking Coming Soon</h4>
                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                          We're building a feature to capture and display your responses to application questions.
                        </p>
                        <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                          Feature in development
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={handleClose}>
                    Close
                  </Button>
                  {application.status === 'failed' && (
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Retry Application
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
