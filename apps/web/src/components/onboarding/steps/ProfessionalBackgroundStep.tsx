'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Briefcase, Star, Globe, Github, Linkedin, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import { 
  professionalBackgroundSchema,
  EXPERIENCE_LEVELS,
  type ProfessionalBackgroundData 
} from '@jobswipe/shared/schemas';

interface ProfessionalBackgroundStepProps {
  data?: ProfessionalBackgroundData;
  onDataChange: (data: ProfessionalBackgroundData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const POPULAR_SKILLS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'AWS',
  'SQL', 'Java', 'Docker', 'Kubernetes', 'Git', 'HTML/CSS',
  'Machine Learning', 'Data Analysis', 'Project Management', 'Agile',
  'MongoDB', 'PostgreSQL', 'GraphQL', 'Vue.js', 'Angular', 'PHP'
];

export function ProfessionalBackgroundStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false
}: ProfessionalBackgroundStepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(data?.skills || []);
  const [customSkill, setCustomSkill] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<ProfessionalBackgroundData>({
    resolver: zodResolver(professionalBackgroundSchema),
    mode: 'onChange',
    defaultValues: {
      currentTitle: data?.currentTitle || '',
      currentCompany: data?.currentCompany || '',
      experienceLevel: data?.experienceLevel || 'mid',
      yearsOfExperience: data?.yearsOfExperience || undefined,
      skills: data?.skills || [],
      bio: data?.bio || '',
      headline: data?.headline || '',
      linkedin: data?.linkedin || '',
      github: data?.github || '',
      portfolio: data?.portfolio || '',
      website: data?.website || ''
    }
  });

  const watchedData = watch();

  // Update parent component when form data changes
  useEffect(() => {
    const updatedData = {
      ...watchedData,
      skills: selectedSkills
    };
    onDataChange(updatedData);
  }, [watchedData, selectedSkills, onDataChange]);

  // Update skills in form when selectedSkills changes
  useEffect(() => {
    setValue('skills', selectedSkills);
  }, [selectedSkills, setValue]);

  const addSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill) && selectedSkills.length < 20) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const addCustomSkill = () => {
    if (customSkill.trim()) {
      addSkill(customSkill.trim());
      setCustomSkill('');
    }
  };

  const onSubmit = (formData: ProfessionalBackgroundData) => {
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Current Position */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Current Position</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            id="currentTitle"
            label="Current Job Title"
            type="text"
            placeholder="e.g., Senior Software Engineer"
            {...register('currentTitle')}
            error={errors.currentTitle?.message}
          />

          <FormInput
            id="currentCompany"
            label="Current Company"
            type="text"
            placeholder="e.g., Google, Microsoft, Startup Inc."
            {...register('currentCompany')}
            error={errors.currentCompany?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Experience Level
            </label>
            <select
              {...register('experienceLevel')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {EXPERIENCE_LEVELS.map(level => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="text-sm text-red-600">{errors.experienceLevel.message}</p>
            )}
          </div>

          <FormInput
            id="yearsOfExperience"
            label="Years of Experience"
            type="number"
            min="0"
            max="50"
            placeholder="5"
            {...register('yearsOfExperience', { valueAsNumber: true })}
            error={errors.yearsOfExperience?.message}
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Professional Summary</h3>
        </div>

        <FormInput
          id="headline"
          label="Professional Headline"
          type="text"
          placeholder="e.g., Full-Stack Developer passionate about building scalable web applications"
          {...register('headline')}
          error={errors.headline?.message}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
            {...register('bio')}
          />
          {errors.bio && (
            <p className="text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Skills & Expertise</h3>
          </div>
          <span className="text-sm text-gray-500">{selectedSkills.length}/20</span>
        </div>

        {/* Selected Skills */}
        {selectedSkills.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Selected Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Popular Skills */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Popular Skills (click to add)
          </label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SKILLS.filter(skill => !selectedSkills.includes(skill)).map(skill => (
              <button
                key={skill}
                type="button"
                onClick={() => addSkill(skill)}
                disabled={selectedSkills.length >= 20}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm border border-gray-300 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3 w-3 mr-1" />
                {skill}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Skill Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Add Custom Skill
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              placeholder="Enter a skill..."
              disabled={selectedSkills.length >= 20}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <Button
              type="button"
              onClick={addCustomSkill}
              disabled={!customSkill.trim() || selectedSkills.length >= 20}
              variant="outline"
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Globe className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Professional Links</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <FormInput
              id="linkedin"
              label="LinkedIn Profile"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              {...register('linkedin')}
              error={errors.linkedin?.message}
            />
            <Linkedin className="absolute right-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <FormInput
              id="github"
              label="GitHub Profile"
              type="url"
              placeholder="https://github.com/yourusername"
              {...register('github')}
              error={errors.github?.message}
            />
            <Github className="absolute right-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <FormInput
              id="portfolio"
              label="Portfolio Website"
              type="url"
              placeholder="https://yourportfolio.com"
              {...register('portfolio')}
              error={errors.portfolio?.message}
            />
            <ExternalLink className="absolute right-3 top-8 h-4 w-4 text-gray-400" />
          </div>

          <div className="relative">
            <FormInput
              id="website"
              label="Personal Website"
              type="url"
              placeholder="https://yourwebsite.com"
              {...register('website')}
              error={errors.website?.message}
            />
            <ExternalLink className="absolute right-3 top-8 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Star className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Tips for a Great Profile</p>
            <ul className="text-blue-700 mt-2 space-y-1">
              <li>• Add specific skills that match your target jobs</li>
              <li>• Write a compelling headline that summarizes your expertise</li>
              <li>• Include links to showcase your work and experience</li>
              <li>• Keep your bio professional but show your personality</li>
            </ul>
          </div>
        </div>
      </div>
    </form>
  );
}