'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Target, DollarSign, Building, TrendingUp, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import {
  jobPreferencesSchema,
  JOB_TYPES,
  INDUSTRIES,
  COMPANY_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_CURRENCIES,
  type JobPreferencesData
} from '@jobswipe/shared/schemas';

interface JobPreferencesStepProps {
  data?: JobPreferencesData;
  onDataChange: (data: JobPreferencesData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const JOB_TYPE_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary'
};

const INDUSTRY_LABELS = {
  TECHNOLOGY: 'Technology',
  ENGINEERING: 'Engineering',
  DESIGN: 'Design',
  PRODUCT: 'Product',
  MARKETING: 'Marketing',
  SALES: 'Sales',
  FINANCE: 'Finance',
  OPERATIONS: 'Operations',
  HUMAN_RESOURCES: 'Human Resources',
  LEGAL: 'Legal',
  CUSTOMER_SUCCESS: 'Customer Success',
  DATA_SCIENCE: 'Data Science',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  CONSULTING: 'Consulting',
  MANUFACTURING: 'Manufacturing',
  RETAIL: 'Retail',
  HOSPITALITY: 'Hospitality',
  MEDIA: 'Media',
  NON_PROFIT: 'Non-profit',
  GOVERNMENT: 'Government',
  OTHER: 'Other'
};

const COMPANY_TYPE_LABELS = {
  STARTUP: 'Startup (1-50 employees)',
  SMALL: 'Small (51-200 employees)',
  MEDIUM: 'Medium (201-1000 employees)',
  LARGE: 'Large (1000-5000 employees)',
  ENTERPRISE: 'Enterprise (5000+ employees)'
};

export function JobPreferencesStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false
}: JobPreferencesStepProps) {
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>(data?.desiredJobTypes || []);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(data?.industries || []);
  const [selectedCompanyTypes, setSelectedCompanyTypes] = useState<string[]>(data?.companyTypes || []);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>(data?.experienceLevels || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<JobPreferencesData>({
    resolver: zodResolver(jobPreferencesSchema),
    mode: 'onChange',
    defaultValues: {
      desiredJobTypes: data?.desiredJobTypes || [],
      industries: data?.industries || [],
      companyTypes: data?.companyTypes || [],
      experienceLevels: data?.experienceLevels || [],
      desiredSalaryMin: data?.desiredSalaryMin || undefined,
      desiredSalaryMax: data?.desiredSalaryMax || undefined,
      preferredCurrency: data?.preferredCurrency || 'USD',
      jobSearchRadius: data?.jobSearchRadius || 50
    }
  });

  const watchedData = watch();

  // Update parent component when form data changes
  useEffect(() => {
    const updatedData = {
      ...watchedData,
      desiredJobTypes: selectedJobTypes as any,
      industries: selectedIndustries as any,
      companyTypes: selectedCompanyTypes as any,
      experienceLevels: selectedExperienceLevels as any
    };
    onDataChange(updatedData);
  }, [watchedData, selectedJobTypes, selectedIndustries, selectedCompanyTypes, selectedExperienceLevels, onDataChange]);

  // Update form values when selections change
  useEffect(() => {
    setValue('desiredJobTypes', selectedJobTypes as any);
    setValue('industries', selectedIndustries as any);
    setValue('companyTypes', selectedCompanyTypes as any);
    setValue('experienceLevels', selectedExperienceLevels as any);
  }, [selectedJobTypes, selectedIndustries, selectedCompanyTypes, selectedExperienceLevels, setValue]);

  const toggleSelection = (
    item: string,
    currentSelection: string[],
    setSelection: (items: string[]) => void,
    maxItems: number
  ) => {
    if (currentSelection.includes(item)) {
      setSelection(currentSelection.filter(i => i !== item));
    } else if (currentSelection.length < maxItems) {
      setSelection([...currentSelection, item]);
    }
  };

  const onSubmit = (formData: JobPreferencesData) => {
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Job Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Job Types</h3>
          </div>
          <span className="text-sm text-gray-500">{selectedJobTypes.length}/6 selected</span>
        </div>
        
        <p className="text-sm text-gray-600">
          What types of employment are you interested in? (Select at least 1)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {JOB_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleSelection(type, selectedJobTypes, setSelectedJobTypes, 6)}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${selectedJobTypes.includes(type)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{JOB_TYPE_LABELS[type]}</span>
                {selectedJobTypes.includes(type) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {errors.desiredJobTypes && (
          <p className="text-sm text-red-600">{errors.desiredJobTypes.message}</p>
        )}
      </div>

      {/* Industries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Industries</h3>
          </div>
          <span className="text-sm text-gray-500">{selectedIndustries.length}/10 selected</span>
        </div>
        
        <p className="text-sm text-gray-600">
          Which industries interest you? (Select at least 1, up to 10)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {INDUSTRIES.map(industry => (
            <button
              key={industry}
              type="button"
              onClick={() => toggleSelection(industry, selectedIndustries, setSelectedIndustries, 10)}
              disabled={!selectedIndustries.includes(industry) && selectedIndustries.length >= 10}
              className={`
                relative p-3 rounded-lg border text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                ${selectedIndustries.includes(industry)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{INDUSTRY_LABELS[industry]}</span>
                {selectedIndustries.includes(industry) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {errors.industries && (
          <p className="text-sm text-red-600">{errors.industries.message}</p>
        )}
      </div>

      {/* Company Types */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Company Size</h3>
          </div>
          <span className="text-sm text-gray-500">{selectedCompanyTypes.length}/5 selected</span>
        </div>
        
        <p className="text-sm text-gray-600">
          What company sizes do you prefer? (Select at least 1)
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {COMPANY_TYPES.map(type => (
            <button
              key={type}
              type="button"
              onClick={() => toggleSelection(type, selectedCompanyTypes, setSelectedCompanyTypes, 5)}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${selectedCompanyTypes.includes(type)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{COMPANY_TYPE_LABELS[type]}</span>
                {selectedCompanyTypes.includes(type) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {errors.companyTypes && (
          <p className="text-sm text-red-600">{errors.companyTypes.message}</p>
        )}
      </div>

      {/* Experience Levels */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Experience Levels</h3>
          </div>
          <span className="text-sm text-gray-500">{selectedExperienceLevels.length}/5 selected</span>
        </div>
        
        <p className="text-sm text-gray-600">
          What experience levels are you targeting? (Select at least 1)
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map(level => (
            <button
              key={level}
              type="button"
              onClick={() => toggleSelection(level, selectedExperienceLevels, setSelectedExperienceLevels, 5)}
              className={`
                relative p-3 rounded-lg border text-left transition-all duration-200
                ${selectedExperienceLevels.includes(level)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {level.replace('_', ' ')}
                </span>
                {selectedExperienceLevels.includes(level) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
        
        {errors.experienceLevels && (
          <p className="text-sm text-red-600">{errors.experienceLevels.message}</p>
        )}
      </div>

      {/* Salary Expectations */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Salary Expectations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormInput
            id="desiredSalaryMin"
            label="Minimum Salary"
            type="number"
            min="0"
            step="1000"
            placeholder="50000"
            {...register('desiredSalaryMin', { valueAsNumber: true })}
            error={errors.desiredSalaryMin?.message}
          />

          <FormInput
            id="desiredSalaryMax"
            label="Maximum Salary"
            type="number"
            min="0"
            step="1000"
            placeholder="100000"
            {...register('desiredSalaryMax', { valueAsNumber: true })}
            error={errors.desiredSalaryMax?.message}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <select
              {...register('preferredCurrency')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SALARY_CURRENCIES.map(currency => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
            {errors.preferredCurrency && (
              <p className="text-sm text-red-600">{errors.preferredCurrency.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Job Search Radius */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Job Search Radius</h3>
        </div>

        <FormInput
          id="jobSearchRadius"
          label="Search Radius (miles)"
          type="number"
          min="1"
          max="500"
          {...register('jobSearchRadius', { valueAsNumber: true })}
          error={errors.jobSearchRadius?.message}
        />
        
        <p className="text-sm text-gray-600">
          How far are you willing to travel for work? This applies to on-site and hybrid positions.
        </p>
      </div>

      {/* Help Text */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Target className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-green-900">Job Matching Tips</p>
            <ul className="text-green-700 mt-2 space-y-1">
              <li>• Select multiple job types to see more opportunities</li>
              <li>• Broader industry selection increases job matches</li>
              <li>• Salary ranges help filter appropriate positions</li>
              <li>• You can always update these preferences later</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}