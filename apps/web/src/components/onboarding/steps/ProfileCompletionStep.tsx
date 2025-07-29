'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Award, 
  Globe, 
  Plus, 
  Trash2, 
  Phone,
  Upload,
  FileText 
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/auth/FormInput';
import {
  profileCompletionSchema,
  type ProfileCompletionData
} from '@jobswipe/shared/schemas';

interface ProfileCompletionStepProps {
  data?: ProfileCompletionData;
  onDataChange: (data: ProfileCompletionData) => void;
  onNext: () => void;
  onPrevious: () => void;
  isLoading?: boolean;
}

const PROFICIENCY_LEVELS = [
  { value: 'NATIVE', label: 'Native' },
  { value: 'FLUENT', label: 'Fluent' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'BEGINNER', label: 'Beginner' }
];

export function ProfileCompletionStep({
  data,
  onDataChange,
  onNext,
  onPrevious,
  isLoading = false
}: ProfileCompletionStepProps) {
  const [activeSection, setActiveSection] = useState<string>('contact');

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid }
  } = useForm<ProfileCompletionData>({
    resolver: zodResolver(profileCompletionSchema),
    mode: 'onChange',
    defaultValues: {
      phone: data?.phone || '',
      education: data?.education || [],
      workExperience: data?.workExperience || [],
      certifications: data?.certifications || [],
      languages: data?.languages || []
    }
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation
  } = useFieldArray({
    control,
    name: 'education'
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience
  } = useFieldArray({
    control,
    name: 'workExperience'
  });

  const {
    fields: certificationFields,
    append: appendCertification,
    remove: removeCertification
  } = useFieldArray({
    control,
    name: 'certifications'
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage
  } = useFieldArray({
    control,
    name: 'languages'
  });

  const watchedData = watch();

  // Update parent component when form data changes
  useEffect(() => {
    onDataChange(watchedData);
  }, [watchedData, onDataChange]);

  const addEducation = () => {
    appendEducation({
      institution: '',
      degree: '',
      field: '',
      startYear: new Date().getFullYear() - 4,
      endYear: new Date().getFullYear(),
      gpa: undefined
    });
  };

  const addExperience = () => {
    appendExperience({
      company: '',
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    });
  };

  const addCertification = () => {
    appendCertification({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    });
  };

  const addLanguage = () => {
    appendLanguage({
      language: '',
      proficiency: 'INTERMEDIATE'
    });
  };

  const onSubmit = (formData: ProfileCompletionData) => {
    onNext();
  };

  const sections = [
    { id: 'contact', label: 'Contact Info', icon: Phone },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'languages', label: 'Languages', icon: Globe }
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeSection === section.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Contact Information */}
        {activeSection === 'contact' && (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>
            </div>

            <FormInput
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              error={errors.phone?.message}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Contact Tips</p>
                  <ul className="text-blue-700 mt-2 space-y-1">
                    <li>• Adding a phone number increases recruiter response rates</li>
                    <li>• Use your preferred contact number</li>
                    <li>• You can control visibility in privacy settings</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Education Background</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addEducation}
                disabled={educationFields.length >= 5}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Education</span>
              </Button>
            </div>

            {educationFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No education entries yet</p>
                <Button type="button" variant="outline" onClick={addEducation}>
                  Add Your First Education Entry
                </Button>
              </div>
            )}

            {educationFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Education {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEducation(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id={`education.${index}.institution`}
                    label="Institution"
                    placeholder="University of California, Berkeley"
                    {...register(`education.${index}.institution`)}
                    error={errors.education?.[index]?.institution?.message}
                  />

                  <FormInput
                    id={`education.${index}.degree`}
                    label="Degree"
                    placeholder="Bachelor of Science"
                    {...register(`education.${index}.degree`)}
                    error={errors.education?.[index]?.degree?.message}
                  />

                  <FormInput
                    id={`education.${index}.field`}
                    label="Field of Study"
                    placeholder="Computer Science"
                    {...register(`education.${index}.field`)}
                    error={errors.education?.[index]?.field?.message}
                  />

                  <FormInput
                    id={`education.${index}.gpa`}
                    label="GPA (Optional)"
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.0"
                    placeholder="3.7"
                    {...register(`education.${index}.gpa`, { valueAsNumber: true })}
                    error={errors.education?.[index]?.gpa?.message}
                  />

                  <FormInput
                    id={`education.${index}.startYear`}
                    label="Start Year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear()}
                    {...register(`education.${index}.startYear`, { valueAsNumber: true })}
                    error={errors.education?.[index]?.startYear?.message}
                  />

                  <FormInput
                    id={`education.${index}.endYear`}
                    label="End Year"
                    type="number"
                    min="1950"
                    max={new Date().getFullYear() + 10}
                    {...register(`education.${index}.endYear`, { valueAsNumber: true })}
                    error={errors.education?.[index]?.endYear?.message}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {activeSection === 'experience' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addExperience}
                disabled={experienceFields.length >= 10}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Experience</span>
              </Button>
            </div>

            {experienceFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No work experience entries yet</p>
                <Button type="button" variant="outline" onClick={addExperience}>
                  Add Your First Work Experience
                </Button>
              </div>
            )}

            {experienceFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Experience {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id={`workExperience.${index}.company`}
                    label="Company"
                    placeholder="Google"
                    {...register(`workExperience.${index}.company`)}
                    error={errors.workExperience?.[index]?.company?.message}
                  />

                  <FormInput
                    id={`workExperience.${index}.title`}
                    label="Job Title"
                    placeholder="Software Engineer"
                    {...register(`workExperience.${index}.title`)}
                    error={errors.workExperience?.[index]?.title?.message}
                  />

                  <FormInput
                    id={`workExperience.${index}.startDate`}
                    label="Start Date"
                    type="date"
                    {...register(`workExperience.${index}.startDate`)}
                    error={errors.workExperience?.[index]?.startDate?.message}
                  />

                  <FormInput
                    id={`workExperience.${index}.endDate`}
                    label="End Date"
                    type="date"
                    {...register(`workExperience.${index}.endDate`)}
                    error={errors.workExperience?.[index]?.endDate?.message}
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    {...register(`workExperience.${index}.isCurrent`)}
                  />
                  <label className="text-sm font-medium text-gray-700">
                    I currently work here
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Describe your role, responsibilities, and achievements..."
                    {...register(`workExperience.${index}.description`)}
                  />
                  {errors.workExperience?.[index]?.description && (
                    <p className="text-sm text-red-600">
                      {errors.workExperience[index]?.description?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {activeSection === 'certifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Certifications & Awards</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addCertification}
                disabled={certificationFields.length >= 10}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Certification</span>
              </Button>
            </div>

            {certificationFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No certifications yet</p>
                <Button type="button" variant="outline" onClick={addCertification}>
                  Add Your First Certification
                </Button>
              </div>
            )}

            {certificationFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-md font-medium text-gray-900">Certification {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCertification(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id={`certifications.${index}.name`}
                    label="Certification Name"
                    placeholder="AWS Certified Solutions Architect"
                    {...register(`certifications.${index}.name`)}
                    error={errors.certifications?.[index]?.name?.message}
                  />

                  <FormInput
                    id={`certifications.${index}.issuer`}
                    label="Issuing Organization"
                    placeholder="Amazon Web Services"
                    {...register(`certifications.${index}.issuer`)}
                    error={errors.certifications?.[index]?.issuer?.message}
                  />

                  <FormInput
                    id={`certifications.${index}.issueDate`}
                    label="Issue Date"
                    type="date"
                    {...register(`certifications.${index}.issueDate`)}
                    error={errors.certifications?.[index]?.issueDate?.message}
                  />

                  <FormInput
                    id={`certifications.${index}.expiryDate`}
                    label="Expiry Date (Optional)"
                    type="date"
                    {...register(`certifications.${index}.expiryDate`)}
                    error={errors.certifications?.[index]?.expiryDate?.message}
                  />

                  <FormInput
                    id={`certifications.${index}.credentialId`}
                    label="Credential ID (Optional)"
                    placeholder="ABC123456"
                    {...register(`certifications.${index}.credentialId`)}
                    error={errors.certifications?.[index]?.credentialId?.message}
                  />

                  <FormInput
                    id={`certifications.${index}.credentialUrl`}
                    label="Credential URL (Optional)"
                    type="url"
                    placeholder="https://www.credly.com/badges/..."
                    {...register(`certifications.${index}.credentialUrl`)}
                    error={errors.certifications?.[index]?.credentialUrl?.message}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {activeSection === 'languages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-900">Languages</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addLanguage}
                disabled={languageFields.length >= 10}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Language</span>
              </Button>
            </div>

            {languageFields.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Globe className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">No languages added yet</p>
                <Button type="button" variant="outline" onClick={addLanguage}>
                  Add Your First Language
                </Button>
              </div>
            )}

            {languageFields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Language {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLanguage(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    id={`languages.${index}.language`}
                    label="Language"
                    placeholder="Spanish"
                    {...register(`languages.${index}.language`)}
                    error={errors.languages?.[index]?.language?.message}
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Proficiency Level
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      {...register(`languages.${index}.proficiency`)}
                    >
                      {PROFICIENCY_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                    {errors.languages?.[index]?.proficiency && (
                      <p className="text-sm text-red-600">
                        {errors.languages[index]?.proficiency?.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Completion Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-900">Profile Completion Tips</p>
              <ul className="text-green-700 mt-2 space-y-1">
                <li>• Complete profiles receive 3x more recruiter views</li>
                <li>• Add specific achievements and metrics to stand out</li>
                <li>• Keep information current and accurate</li>
                <li>• You can always edit these details later in your profile</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}