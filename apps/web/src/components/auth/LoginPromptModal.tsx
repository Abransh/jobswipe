'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LogIn,
  UserPlus,
  Heart,
  Briefcase,
  Sparkles,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle?: string;
  onLoginSuccess?: () => void;
}

export function LoginPromptModal({
  isOpen,
  onClose,
  jobTitle,
  onLoginSuccess
}: LoginPromptModalProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignIn = () => {
    router.push(`/auth/signin?callbackUrl=${encodeURIComponent('/jobs')}`);
  };

  const handleSignUp = () => {
    router.push(`/auth/signup?callbackUrl=${encodeURIComponent('/jobs')}`);
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with gradient */}
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-6 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-white text-center mb-2">
                  Love this job?
                </h2>
                <p className="text-white/90 text-center text-sm">
                  Sign in to apply and track your applications
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Job info if provided */}
                {jobTitle && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-600 mb-1">You're applying to:</p>
                        <p className="font-semibold text-gray-900 truncate">{jobTitle}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <p className="text-sm font-medium text-gray-700">What you'll get:</p>
                  <div className="space-y-2">
                    {[
                      { icon: Sparkles, text: 'One-swipe job applications' },
                      { icon: Briefcase, text: 'Track all your applications' },
                      { icon: Lock, text: 'Secure & private profile' }
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + (index * 0.1) }}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <benefit.icon className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-3"
                >
                  <Button
                    onClick={handleSignUp}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create free account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleSignIn}
                    variant="outline"
                    className="w-full border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 font-medium py-3 rounded-xl transition-all duration-200"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign in
                  </Button>
                </motion.div>

                {/* Privacy notice */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-xs text-gray-500 text-center"
                >
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
