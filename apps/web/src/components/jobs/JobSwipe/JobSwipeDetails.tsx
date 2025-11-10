'use client';

/**
 * JobSwipeDetails Component
 * Expandable job details with smooth animations and progressive disclosure
 * Optimized for both desktop hover and mobile tap interactions
 */

import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  ClockIcon,
  AcademicCapIcon,
  CurrencyDollarIcon,
  HeartIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

// Types
import type { JobSwipeDetailsProps } from '../types/jobSwipe';

// Styles
import styles from './JobSwipe.module.css';

export function JobSwipeDetails({
  job,
  isExpanded,
  expansionProgress,
  trigger,
  onCollapse,
  onApply,
  onSave,
  onShare,
  config,
  deviceType,
  className,
  style
}: JobSwipeDetailsProps) {

  // Format job requirements
  const formatRequirements = useCallback(() => {
    if (!job.description) return [];
    
    // Extract bullet points or key requirements from description
    const lines = job.description.split('\n').filter(line => line.trim());
    const requirements = lines
      .filter(line => 
        line.includes('•') || 
        line.includes('-') || 
        line.toLowerCase().includes('require') ||
        line.toLowerCase().includes('experience')
      )
      .slice(0, 4)
      .map(line => line.replace(/^[•\-\s]+/, '').trim());
    
    return requirements.length > 0 ? requirements : [
      `${job.level || 'Mid'}-level experience required`,
      'Strong communication skills',
      'Team collaboration experience'
    ];
  }, [job.description, job.level]);

  // Format company benefits
  const formatBenefits = useCallback(() => {
    if (job.benefits) {
      return job.benefits.split(',').map(benefit => benefit.trim()).slice(0, 6);
    }
    
    // Default benefits based on job type and company
    const defaultBenefits = [
      'Health insurance',
      'Flexible PTO',
      'Professional development',
      'Remote work options'
    ];
    
    if (job.equity) defaultBenefits.push('Equity package');
    if (job.remote) defaultBenefits.push('Work from anywhere');
    
    return defaultBenefits.slice(0, 6);
  }, [job.benefits, job.equity, job.remote]);

  // Calculate team size display
  const getTeamSizeDisplay = useCallback(() => {
    switch (job.company.size) {
      case 'STARTUP': return '1-10 people';
      case 'SMALL': return '11-50 people';
      case 'MEDIUM': return '51-200 people';
      case 'LARGE': return '201-1000 people';
      case 'ENTERPRISE': return '1000+ people';
      default: return 'Team size varies';
    }
  }, [job.company.size]);

  // Animation variants for content sections
  const sectionVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      height: 0,
      transition: { duration: 0.2 }
    },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      height: 'auto',
      transition: { 
        duration: 0.3,
        delay: delay * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    })
  };

  // Button animation variants
  const buttonVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: (delay: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: delay * 0.05,
        type: 'spring',
        stiffness: 400,
        damping: 30
      }
    }),
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const requirements = useMemo(() => formatRequirements(), [formatRequirements]);
  const benefits = useMemo(() => formatBenefits(), [formatBenefits]);

  if (!isExpanded && expansionProgress === 0) {
    return null;
  }

  return (
    <motion.div
      className={cn(styles.jobDetails, className)}
      style={{
        ...style,
        overflow: 'hidden'
      }}
      initial="hidden"
      animate={isExpanded ? "visible" : "hidden"}
      exit="hidden"
      transition={{ duration: config.animationDuration / 1000 }}
    >
      <AnimatePresence>
        {isExpanded && (
          <div className={styles.detailsContent}>
            {/* Job Description */}
            <motion.section
              className={styles.detailsSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={0}
            >
              <h3 className={styles.sectionTitle}>
                <BuildingOfficeIcon className="w-5 h-5" />
                About the Role
              </h3>
              <div
                className={cn(
                  styles.jobDescription,
                  'prose prose-sm max-w-none',
                  '[&>h2]:text-base [&>h2]:font-semibold [&>h2]:mt-3 [&>h2]:mb-2',
                  '[&>h3]:text-sm [&>h3]:font-semibold [&>h3]:mt-2 [&>h3]:mb-1',
                  '[&>p]:mb-2 [&>p]:leading-relaxed',
                  '[&>ul]:mb-2 [&>ul]:ml-4 [&>li]:mb-1',
                  '[&>strong]:font-semibold'
                )}
                dangerouslySetInnerHTML={{
                  __html: job.description || 'Join our team and make an impact in this exciting role. We\'re looking for someone passionate about their craft and eager to grow with our company.'
                }}
              />
            </motion.section>

            {/* Requirements */}
            <motion.section
              className={styles.detailsSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={1}
            >
              <h3 className={styles.sectionTitle}>
                <AcademicCapIcon className="w-5 h-5" />
                What We're Looking For
              </h3>
              <ul className={styles.requirementsList}>
                {requirements.map((requirement, index) => (
                  <motion.li
                    key={index}
                    className={styles.requirementItem}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{requirement}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.section>

            {/* Skills */}
            {job.skills && job.skills.length > 0 && (
              <motion.section
                className={styles.detailsSection}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={2}
              >
                <h3 className={styles.sectionTitle}>
                  <AcademicCapIcon className="w-5 h-5" />
                  Skills & Technologies
                </h3>
                <div className={styles.skillsGrid}>
                  {job.skills.map((skill, index) => (
                    <motion.span
                      key={skill}
                      className={styles.skillBadge}
                      variants={buttonVariants}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileHover="hover"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Company Info */}
            <motion.section
              className={styles.detailsSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={3}
            >
              <h3 className={styles.sectionTitle}>
                <BuildingOfficeIcon className="w-5 h-5" />
                About {job.company.name}
              </h3>
              <div className={styles.companyDetails}>
                <div className={styles.companyDetailItem}>
                  <UserGroupIcon className="w-4 h-4" />
                  <span>{getTeamSizeDisplay()}</span>
                </div>
                {job.company.industry && (
                  <div className={styles.companyDetailItem}>
                    <BuildingOfficeIcon className="w-4 h-4" />
                    <span>{job.company.industry}</span>
                  </div>
                )}
                {job.company.headquarters && (
                  <div className={styles.companyDetailItem}>
                    <span>📍</span>
                    <span>{job.company.headquarters}</span>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Benefits */}
            <motion.section
              className={styles.detailsSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={4}
            >
              <h3 className={styles.sectionTitle}>
                <HeartIcon className="w-5 h-5" />
                Benefits & Perks
              </h3>
              <div className={styles.benefitsGrid}>
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    className={styles.benefitItem}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Action Buttons */}
            <motion.div
              className={styles.detailsActions}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              custom={5}
            >
              <motion.button
                className={cn(styles.actionButton, styles.primaryAction)}
                onClick={onApply}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={0}
                aria-label="Apply to this job"
              >
                <CheckCircleIcon className="w-5 h-5" />
                <span>Apply Now</span>
              </motion.button>

              <motion.button
                className={cn(styles.actionButton, styles.secondaryAction)}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
                variants={buttonVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                whileTap="tap"
                custom={1}
                aria-label="Save job for later"
              >
                <HeartIcon className="w-5 h-5" />
                <span>Save</span>
              </motion.button>

              {deviceType === 'mobile' && (
                <motion.button
                  className={cn(styles.actionButton, styles.tertiaryAction)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCollapse();
                  }}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  custom={2}
                  aria-label="Close details"
                >
                  <XMarkIcon className="w-5 h-5" />
                  <span>Close</span>
                </motion.button>
              )}
            </motion.div>

            {/* Application Stats */}
            {(job.applicationCount > 0 || job.viewCount > 0) && (
              <motion.div
                className={styles.applicationStats}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={6}
              >
                <div className={styles.statsGrid}>
                  {job.applicationCount > 0 && (
                    <div className={styles.statItem}>
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{job.applicationCount} applicant{job.applicationCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {job.viewCount > 0 && (
                    <div className={styles.statItem}>
                      <span>👀</span>
                      <span>{job.viewCount} view{job.viewCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Accessibility enhancement */}
      <div className="sr-only" aria-live="polite">
        {isExpanded ? 'Job details expanded' : 'Job details collapsed'}
      </div>
    </motion.div>
  );
}