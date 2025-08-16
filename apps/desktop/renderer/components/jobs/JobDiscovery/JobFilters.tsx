'use client';

/**
 * Advanced Job Filters Component
 * Provides comprehensive filtering options for job search
 */

import React, { useState, useCallback } from 'react';
import { 
  MapPinIcon, 
  CurrencyDollarIcon, 
  BuildingOfficeIcon, 
  ClockIcon,
  XMarkIcon,
  ChevronDownIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';
import type { JobFilters as JobFiltersType } from '@/components/jobs/types/filters';
import { 
  JOB_TYPES, 
  JOB_LEVELS, 
  COMPANY_SIZES, 
  REMOTE_OPTIONS,
  POPULAR_SKILLS,
  POPULAR_INDUSTRIES 
} from '@/components/jobs/types/filters';

interface JobFiltersProps {
  filters: JobFiltersType;
  onFiltersChange: (filters: JobFiltersType) => void;
  jobCount: number;
}

export function JobFilters({ filters, onFiltersChange, jobCount }: JobFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [locationInput, setLocationInput] = useState(filters.location || '');

  const updateFilter = useCallback(<K extends keyof JobFiltersType>(
    key: K, 
    value: JobFiltersType[K]
  ) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  }, [filters, onFiltersChange]);

  const toggleArrayFilter = useCallback(<K extends keyof JobFiltersType>(
    key: K,
    value: string,
    currentArray: string[]
  ) => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter(key, newArray as JobFiltersType[K]);
  }, [updateFilter]);

  const addSkill = useCallback((skill: string) => {
    if (skill.trim() && !filters.skills.includes(skill.trim())) {
      updateFilter('skills', [...filters.skills, skill.trim()]);
      setSkillInput('');
    }
  }, [filters.skills, updateFilter]);

  const removeSkill = useCallback((skillToRemove: string) => {
    updateFilter('skills', filters.skills.filter(skill => skill !== skillToRemove));
  }, [filters.skills, updateFilter]);

  const clearAllFilters = useCallback(() => {
    onFiltersChange({
      location: '',
      remote: 'any',
      jobType: [],
      jobLevel: [],
      salaryMin: 0,
      salaryMax: 300000,
      skills: []
    });
    setLocationInput('');
  }, [onFiltersChange]);

  const hasActiveFilters = 
    filters.location || 
    filters.remote !== 'any' || 
    filters.jobType.length > 0 || 
    filters.jobLevel.length > 0 ||
    filters.skills.length > 0 ||
    filters.salaryMin > 0 ||
    filters.salaryMax < 300000;

  return (
    <div className="space-y-4">
      {/* Quick Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location Filter */}
        <div className="flex-1 min-w-64">
          <div className="relative">
            <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Location (e.g., Milan, Remote, Italy)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onBlur={() => updateFilter('location', locationInput)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  updateFilter('location', locationInput);
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Remote Work Filter */}
        <select
          value={filters.remote}
          onChange={(e) => updateFilter('remote', e.target.value as any)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {REMOTE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Job Type Quick Filters */}
        <div className="flex items-center space-x-2">
          {['INTERNSHIP', 'FULL_TIME', 'CONTRACT'].map(type => {
            const isSelected = filters.jobType.includes(type);
            const option = JOB_TYPES.find(opt => opt.value === type);
            
            return (
              <button
                key={type}
                onClick={() => toggleArrayFilter('jobType', type, filters.jobType)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option?.label}
              </button>
            );
          })}
        </div>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <span>Advanced</span>
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-lg hover:bg-red-50"
          >
            <XMarkIcon className="h-4 w-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
          {/* Job Level */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Experience Level</h4>
            <div className="space-y-2">
              {JOB_LEVELS.map(level => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.jobLevel.includes(level.value)}
                    onChange={() => toggleArrayFilter('jobLevel', level.value, filters.jobLevel)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Company Size */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Company Size</h4>
            <div className="space-y-2">
              {COMPANY_SIZES.map(size => (
                <label key={size.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.companySize?.includes(size.value) || false}
                    onChange={() => {
                      const currentSizes = filters.companySize || [];
                      toggleArrayFilter('companySize', size.value, currentSizes);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{size.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              <CurrencyDollarIcon className="inline h-4 w-4 mr-1" />
              Salary Range
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Minimum</label>
                <input
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => updateFilter('salaryMin', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Maximum</label>
                <input
                  type="number"
                  value={filters.salaryMax === 300000 ? '' : filters.salaryMax}
                  onChange={(e) => updateFilter('salaryMax', parseInt(e.target.value) || 300000)}
                  placeholder="No limit"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
            
            {/* Skills Input */}
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill(skillInput);
                  }
                }}
                placeholder="Add skills (e.g., React, TypeScript)..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={() => addSkill(skillInput)}
                disabled={!skillInput.trim()}
                className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add
              </button>
            </div>

            {/* Popular Skills */}
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-2">Popular skills:</p>
              <div className="flex flex-wrap gap-1">
                {POPULAR_SKILLS.slice(0, 8).map(skill => (
                  <button
                    key={skill}
                    onClick={() => addSkill(skill)}
                    disabled={filters.skills.includes(skill)}
                    className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:bg-blue-100 disabled:text-blue-800 disabled:cursor-not-allowed"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Skills */}
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.skills.map(skill => (
                  <div
                    key={skill}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:bg-blue-700 rounded"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <BookmarkIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {jobCount} {jobCount === 1 ? 'job' : 'jobs'} match your filters
            </span>
          </div>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}