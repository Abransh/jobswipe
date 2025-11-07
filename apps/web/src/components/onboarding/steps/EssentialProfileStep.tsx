'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Briefcase, 
  Search,
  ChevronDown,
  Star,
  Sparkles
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import { FileUpload } from '@/components/ui/FileUpload';
import { SalarySlider } from '@/components/ui/SalarySlider';
import {
  essentialProfileSchema,
  POPULAR_ROLES,
  type EssentialProfileData
} from '@jobswipe/shared/schemas';

interface EssentialProfileStepProps {
  data?: EssentialProfileData;
  onDataChange: (data: EssentialProfileData) => void;
  onNext: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
  onAutoSave?: (data: EssentialProfileData) => void;
}

export function EssentialProfileStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false,
  onAutoSave
}: EssentialProfileStepProps) {
  const [selectedRole, setSelectedRole] = useState<string>(data?.roleType || '');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid, isDirty }
  } = useForm<EssentialProfileData>({
    resolver: zodResolver(essentialProfileSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: data?.fullName || '', // Populated from user.name in parent wizard
      phone: data?.phone || '',
      roleType: data?.roleType || '',
      salaryMin: data?.salaryMin,
      salaryMax: data?.salaryMax,
      salaryCurrency: data?.salaryCurrency || 'USD'
    }
  });

  const watchedData = watch();

  // Auto-save when data changes (debounced)
  useEffect(() => {
    if (isDirty && isValid && onAutoSave) {
      const formData = {
        ...watchedData,
        roleType: selectedRole,
        resumeFile: resumeFile || undefined
      };
      
      const timeout = setTimeout(() => {
        onAutoSave(formData);
      }, 1000); // Debounce auto-save by 1 second

      return () => clearTimeout(timeout);
    }
  }, [isDirty, isValid, watchedData, selectedRole, resumeFile]); // Removed onAutoSave from dependencies

  // Update parent component when form data changes (also debounced to prevent excessive updates)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const updatedData = {
        ...watchedData,
        fullName: data?.fullName || watchedData.fullName, // Ensure fullName is preserved
        roleType: selectedRole,
        resumeFile: resumeFile || undefined
      };
      
      onDataChange(updatedData);
    }, 300); // Short debounce for parent updates

    return () => clearTimeout(timeout);
  }, [watchedData, selectedRole, resumeFile, data?.fullName]); // Removed onDataChange from dependencies

  // Filter roles based on search term
  const filteredRoles = POPULAR_ROLES.filter(role =>
    role.toLowerCase().includes(roleSearchTerm.toLowerCase())
  );

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setValue('roleType', role);
    setShowRoleDropdown(false);
    setRoleSearchTerm('');
    clearErrors('roleType');
  };

  const handleCustomRole = (customRole: string) => {
    if (customRole.trim() && customRole.trim() !== selectedRole) {
      setSelectedRole(customRole.trim());
      setValue('roleType', customRole.trim());
      clearErrors('roleType');
    }
  };

  const handleSalaryChange = useCallback((min: number | undefined, max: number | undefined) => {
    setValue('salaryMin', min);
    setValue('salaryMax', max);
    clearErrors(['salaryMin', 'salaryMax']);
  }, [setValue, clearErrors]);

  const handleCurrencyChange = useCallback((currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD') => {
    setValue('salaryCurrency', currency);
  }, [setValue]);

  const handleFileSelect = (file: File) => {
    setResumeFile(file);
    clearErrors('resumeFile');
  };

  const handleFileRemove = () => {
    setResumeFile(null);
  };

  const onSubmit = (formData: EssentialProfileData) => {
    // Validate resume file
    if (!resumeFile) {
      setError('resumeFile', {
        type: 'required',
        message: 'Please upload your resume to continue'
      });
      return;
    }

    // Validate role selection
    if (!selectedRole || selectedRole.trim() === '') {
      setError('roleType', {
        type: 'required',
        message: 'Please select or enter a role type'
      });
      return;
    }

    // Build final data - ensure fullName is always included
    const finalData = {
      ...formData,
      fullName: data?.fullName || formData.fullName || '', // Fallback to empty string to satisfy schema
      roleType: selectedRole,
      resumeFile: resumeFile
    };

    // Update parent with final data before proceeding
    onDataChange(finalData);

    // Small delay to ensure state updates propagate
    setTimeout(() => {
      onNext();
    }, 100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Let's get you started! ✨
            </h1>
            <p className="text-lg text-gray-600">
              Just a few essentials to create your perfect job-hunting profile
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">About You</h2>
            </div>

            {/* Welcome message with pre-filled name */}
            {data?.fullName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">
                  <span className="font-semibold">Welcome, {data.fullName}!</span> Let's complete your profile.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div className="relative">
                <FormInput
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  icon={Phone}
                  {...register('phone')}
                  error={errors.phone?.message}
                  className="transition-all duration-200 focus:scale-[1.02]"
                />
                <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Required for applications
                </div>
              </div>
            </div>
          </motion.div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Briefcase className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Your Role</h2>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What kind of role are you looking for?
                </label>
                
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 border rounded-xl text-left transition-all duration-200
                    ${selectedRole 
                      ? 'border-gray-300 bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' 
                      : 'border-gray-300 bg-gray-50 text-gray-500 hover:border-gray-400'
                    }
                    ${showRoleDropdown ? 'border-blue-500 ring-2 ring-blue-200' : ''}
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className={selectedRole ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedRole || 'Search or select your role...'}
                    </span>
                  </div>
                  <ChevronDown className={`
                    h-4 w-4 text-gray-400 transition-transform duration-200
                    ${showRoleDropdown ? 'rotate-180' : ''}
                  `} />
                </button>

                {/* Role Dropdown */}
                {showRoleDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg"
                  >
                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search roles..."
                          value={roleSearchTerm}
                          onChange={(e) => setRoleSearchTerm(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && roleSearchTerm.trim()) {
                              handleCustomRole(roleSearchTerm);
                              setShowRoleDropdown(false);
                            }
                          }}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Role Options */}
                    <div className="max-h-64 overflow-y-auto">
                      {filteredRoles.length > 0 ? (
                        filteredRoles.map((role, index) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => handleRoleSelect(role)}
                            className={`
                              w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors
                              ${selectedRole === role ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                              ${index === 0 ? 'border-t border-gray-100' : ''}
                            `}
                          >
                            <Briefcase className="h-4 w-4 text-gray-400" />
                            <span>{role}</span>
                            {selectedRole === role && (
                              <Star className="h-4 w-4 text-blue-500 ml-auto" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-gray-500 text-sm mb-3">
                            No matching roles found
                          </p>
                          {roleSearchTerm.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                handleCustomRole(roleSearchTerm);
                                setShowRoleDropdown(false);
                              }}
                              className="text-blue-600 text-sm hover:text-blue-700 font-medium"
                            >
                              Add "{roleSearchTerm}" as custom role
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {errors.roleType && (
                  <p className="mt-2 text-sm text-red-600">{errors.roleType.message}</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Salary Expectations */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <SalarySlider
              minValue={watchedData.salaryMin}
              maxValue={watchedData.salaryMax}
              currency={watchedData.salaryCurrency}
              onRangeChange={handleSalaryChange}
              onCurrencyChange={handleCurrencyChange}
              showPrivacyNotice={true}
            />
          </motion.div>

          {/* Resume Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100"
          >
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              currentFile={resumeFile}
              error={errors.resumeFile?.message}
              placeholder="Upload your resume to get started"
            />
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="flex items-center justify-center space-x-2 text-sm text-gray-500"
          >
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Step 1 of 2</span>
            <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="flex items-center justify-between pt-6"
          >
            <div>
              {/* Space for back button if needed */}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              size="lg"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Continue</span>
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.div>
                </div>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}