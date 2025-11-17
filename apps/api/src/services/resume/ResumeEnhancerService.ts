/**
 * @fileoverview Resume Enhancer Service - AI-Powered Resume Tailoring
 * @description Tailors resumes to specific job postings using AI analysis
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import {
  StructuredResume,
  WorkExperience,
  Education,
  Skills,
  ContactInfo,
  Certification,
  Project,
  Award,
  Publication,
  Language,
  Reference,
} from './ResumeStructurerService';
import { JobPosting, JobRequirements, Enhancement } from './JobMatchingService';
import { getJobMatchingService } from './JobMatchingService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Tailored resume with enhancements
 */
export interface TailoredResume {
  // Core resume data (enhanced)
  contact: ContactInfo;
  summary: string; // AI-generated targeted summary
  experience: WorkExperience[];
  education: Education[];
  skills: Skills;
  certifications?: Certification[];
  projects?: Project[];
  awards?: Award[];
  publications?: Publication[];
  languages?: Language[];
  references?: Reference[];

  // Tailoring metadata
  metadata: {
    originalResumeId: string;
    jobPostingId: string;
    jobTitle: string;
    company: string;
    tailoredDate: Date;
    matchScore: number; // Expected match score after tailoring
    changesApplied: number;
    aiModel: string;
  };

  // Track what changed
  changes: ChangeLog[];
}

/**
 * Change log entry
 */
export interface ChangeLog {
  type: 'summary' | 'experience_bullet' | 'skills_reorder' | 'skills_add' | 'certification' | 'project';
  section: string;
  field?: string;
  original?: string;
  modified: string;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

/**
 * Diff between original and tailored resume
 */
export interface DiffResult {
  summary: {
    totalChanges: number;
    addedItems: number;
    modifiedItems: number;
    reorderedItems: number;
  };

  // Section-level diffs
  summaryDiff?: TextDiff;
  experienceDiffs: ExperienceDiff[];
  skillsDiff: SkillsDiff;
  otherChanges: ChangeLog[];

  // Visual diff for UI
  visualDiff: string; // Markdown format with additions/deletions
}

export interface TextDiff {
  original: string;
  modified: string;
  additions: string[];
  deletions: string[];
}

export interface ExperienceDiff {
  company: string;
  role: string;
  bulletsDiff: Array<{
    index: number;
    original: string;
    modified: string;
    changeType: 'added' | 'modified' | 'unchanged';
  }>;
}

export interface SkillsDiff {
  added: string[];
  removed: string[];
  reordered: boolean;
  categories: {
    [category: string]: {
      added: string[];
      removed: string[];
    };
  };
}

/**
 * Enhancement options
 */
export interface EnhancementOptions {
  aggressiveness: 'conservative' | 'moderate' | 'aggressive';
  maxBulletChanges: number; // Maximum number of bullets to modify
  includeHiddenSkills: boolean;
  reorderExperience: boolean;
  generateNewSummary: boolean;
  optimizeForATS: boolean;
}

// =============================================================================
// RESUME ENHANCER SERVICE CLASS
// =============================================================================

export class ResumeEnhancerService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private jobMatchingService = getJobMatchingService();

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini 2.0 Flash for fast enhancement
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';

    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.7, // Creative but controlled
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 16384,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    console.log(`✨ ResumeEnhancerService initialized with model: ${modelName}`);
  }

  // ===========================================================================
  // MAIN TAILORING METHOD
  // ===========================================================================

  /**
   * Tailor resume to specific job posting
   */
  async tailorResumeToJob(
    resume: StructuredResume,
    jobPosting: JobPosting,
    options: Partial<EnhancementOptions> = {}
  ): Promise<TailoredResume> {
    const startTime = Date.now();
    console.log(`✨ Tailoring resume for: "${jobPosting.title}" at ${jobPosting.companyId}`);

    // Default options
    const opts: EnhancementOptions = {
      aggressiveness: 'moderate',
      maxBulletChanges: 10,
      includeHiddenSkills: true,
      reorderExperience: false,
      generateNewSummary: true,
      optimizeForATS: true,
      ...options,
    };

    try {
      const changes: ChangeLog[] = [];

      // Step 1: Analyze job fit to identify gaps
      const jobFit = await this.jobMatchingService.analyzeJobFit(jobPosting, resume);
      console.log(`✓ Job fit analyzed: ${jobFit.overallMatchScore}% match`);

      // Step 2: Extract job requirements
      const jobReqs = this.extractJobRequirements(jobPosting);

      // Step 3: Generate targeted summary
      let summary = resume.summary || '';
      if (opts.generateNewSummary) {
        summary = await this.generateTargetedSummary(resume, jobPosting, jobFit);
        if (summary !== resume.summary) {
          changes.push({
            type: 'summary',
            section: 'summary',
            original: resume.summary,
            modified: summary,
            reasoning: 'Generated targeted summary highlighting relevant skills and experience for this role',
            impact: 'high',
          });
        }
        console.log(`✓ Generated targeted summary`);
      }

      // Step 4: Enhance experience bullets
      const enhancedExperience = await this.enhanceExperienceBullets(
        resume.experience,
        jobReqs,
        jobFit.recommendations,
        opts
      );
      enhancedExperience.changes.forEach(change => changes.push(change));
      console.log(`✓ Enhanced ${enhancedExperience.changes.length} experience bullets`);

      // Step 5: Optimize skills section
      const optimizedSkills = await this.optimizeSkillsSection(
        resume.skills,
        jobReqs.requiredSkills,
        jobFit.hiddenSkills,
        opts
      );
      optimizedSkills.changes.forEach(change => changes.push(change));
      console.log(`✓ Optimized skills section (${optimizedSkills.changes.length} changes)`);

      // Step 6: Calculate expected match score after tailoring
      const expectedMatchScore = this.estimateImprovedMatchScore(jobFit.overallMatchScore, changes);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Resume tailoring complete in ${processingTime}ms (${changes.length} changes)`);

      return {
        contact: resume.contact,
        summary,
        experience: enhancedExperience.experience,
        education: resume.education,
        skills: optimizedSkills.skills,
        certifications: resume.certifications,
        projects: resume.projects,
        awards: resume.awards,
        publications: resume.publications,
        languages: resume.languages,
        references: resume.references,
        metadata: {
          originalResumeId: '', // Will be set by caller
          jobPostingId: jobPosting.id,
          jobTitle: jobPosting.title,
          company: jobPosting.companyId,
          tailoredDate: new Date(),
          matchScore: expectedMatchScore,
          changesApplied: changes.length,
          aiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
        },
        changes,
      };
    } catch (error) {
      console.error('❌ Resume tailoring failed:', error);
      throw new Error(`Failed to tailor resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // JOB REQUIREMENTS EXTRACTION (simplified from JobMatchingService)
  // ===========================================================================

  private extractJobRequirements(jobPosting: JobPosting): JobRequirements {
    return {
      requiredSkills: jobPosting.skills || [],
      preferredSkills: [],
      requiredExperience: jobPosting.experienceYears || 0,
      requiredEducation: jobPosting.education ? [jobPosting.education] : [],
      requiredLanguages: jobPosting.languages || [],
      technicalKeywords: jobPosting.keywords || [],
      softSkillKeywords: [],
      domainKeywords: jobPosting.tags || [],
      seniorityLevel: this.mapJobLevel(jobPosting.level),
      industryVertical: jobPosting.category,
    };
  }

  private mapJobLevel(level: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('entry') || levelLower.includes('junior')) return 'entry';
    if (levelLower.includes('mid')) return 'mid';
    if (levelLower.includes('senior')) return 'senior';
    if (levelLower.includes('lead') || levelLower.includes('principal')) return 'lead';
    if (levelLower.includes('executive') || levelLower.includes('director')) return 'executive';
    return 'mid';
  }

  // ===========================================================================
  // SUMMARY GENERATION
  // ===========================================================================

  /**
   * Generate targeted summary for job posting
   */
  async generateTargetedSummary(
    resume: StructuredResume,
    jobPosting: JobPosting,
    jobFit: any
  ): Promise<string> {
    const prompt = `You are an expert resume writer. Generate a compelling professional summary for this candidate applying to a specific job.

**Job Posting:**
- Title: ${jobPosting.title}
- Company: ${jobPosting.companyId}
- Level: ${jobPosting.level}
- Required Skills: ${jobPosting.skills.slice(0, 10).join(', ')}

**Candidate Background:**
- Name: ${resume.contact.fullName}
- Experience: ${resume.experience.length} positions
- Top Skills: ${this.getTopSkills(resume).slice(0, 10).join(', ')}
- Education: ${resume.education.map(e => `${e.degree} in ${e.field}`).join(', ')}

**Current Summary (if any):**
${resume.summary || 'None provided'}

**Instructions:**
1. Write a 2-3 sentence professional summary
2. Highlight skills and experience that match the job requirements
3. Use action words and quantifiable achievements if mentioned in experience
4. Be authentic - only mention skills/experience the candidate actually has
5. Optimize for ATS keywords: ${jobPosting.skills.slice(0, 5).join(', ')}
6. NEVER invent experience or skills the candidate doesn't have

**Output Format:**
Return ONLY the summary text (no markdown, no labels).

Example:
"Results-driven Software Engineer with 5+ years of experience building scalable web applications using React, Node.js, and AWS. Proven track record of leading cross-functional teams and delivering high-impact features that increased user engagement by 40%. Passionate about clean code, system architecture, and mentoring junior developers."`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      let summary = response.text().trim();

      // Clean up markdown if present
      summary = summary.replace(/```\w*\n?/g, '').replace(/\*\*/g, '').trim();

      // Ensure it's not too long (max 4 sentences)
      const sentences = summary.match(/[^.!?]+[.!?]+/g) || [];
      if (sentences.length > 4) {
        summary = sentences.slice(0, 4).join(' ');
      }

      return summary;
    } catch (error) {
      console.error('Failed to generate summary:', error);
      // Fallback to original or generic summary
      return resume.summary || `Experienced professional with expertise in ${this.getTopSkills(resume).slice(0, 3).join(', ')}`;
    }
  }

  // ===========================================================================
  // EXPERIENCE ENHANCEMENT
  // ===========================================================================

  /**
   * Enhance experience bullets to match job requirements
   */
  async enhanceExperienceBullets(
    experience: WorkExperience[],
    jobReqs: JobRequirements,
    recommendations: Enhancement[],
    options: EnhancementOptions
  ): Promise<{ experience: WorkExperience[]; changes: ChangeLog[] }> {
    const changes: ChangeLog[] = [];
    const enhancedExperience = [...experience];

    // Identify which bullets to enhance based on relevance
    const bulletsToEnhance = this.identifyBulletsToEnhance(experience, jobReqs, options.maxBulletChanges);

    console.log(`📝 Enhancing ${bulletsToEnhance.length} experience bullets...`);

    // Enhance each bullet
    for (const { expIndex, bulletIndex, bullet, relevance } of bulletsToEnhance) {
      const enhanced = await this.enhanceBullet(bullet, jobReqs, options);

      if (enhanced && enhanced !== bullet) {
        // Update the bullet
        if (!enhancedExperience[expIndex].highlights) {
          enhancedExperience[expIndex].highlights = [];
        }
        enhancedExperience[expIndex].highlights![bulletIndex] = enhanced;

        changes.push({
          type: 'experience_bullet',
          section: 'experience',
          field: `${enhancedExperience[expIndex].company} - ${enhancedExperience[expIndex].role}`,
          original: bullet,
          modified: enhanced,
          reasoning: `Reworded to emphasize ${relevance.join(', ')} skills required for the role`,
          impact: 'high',
        });
      }
    }

    return { experience: enhancedExperience, changes };
  }

  /**
   * Identify which bullets to enhance
   */
  private identifyBulletsToEnhance(
    experience: WorkExperience[],
    jobReqs: JobRequirements,
    maxBullets: number
  ): Array<{ expIndex: number; bulletIndex: number; bullet: string; relevance: string[] }> {
    const bullets: Array<{ expIndex: number; bulletIndex: number; bullet: string; relevance: string[]; score: number }> = [];

    experience.forEach((exp, expIndex) => {
      exp.highlights?.forEach((bullet, bulletIndex) => {
        const relevance = this.calculateBulletRelevance(bullet, jobReqs);
        if (relevance.skills.length > 0) {
          bullets.push({
            expIndex,
            bulletIndex,
            bullet,
            relevance: relevance.skills,
            score: relevance.score,
          });
        }
      });
    });

    // Sort by relevance score and take top N
    return bullets
      .sort((a, b) => b.score - a.score)
      .slice(0, maxBullets)
      .map(({ expIndex, bulletIndex, bullet, relevance }) => ({ expIndex, bulletIndex, bullet, relevance }));
  }

  /**
   * Calculate how relevant a bullet is to job requirements
   */
  private calculateBulletRelevance(bullet: string, jobReqs: JobRequirements): { skills: string[]; score: number } {
    const bulletLower = bullet.toLowerCase();
    const matchedSkills: string[] = [];
    let score = 0;

    // Check for required skills
    jobReqs.requiredSkills.forEach(skill => {
      if (bulletLower.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
        score += 10;
      }
    });

    // Check for preferred skills
    jobReqs.preferredSkills.forEach(skill => {
      if (bulletLower.includes(skill.toLowerCase())) {
        matchedSkills.push(skill);
        score += 5;
      }
    });

    // Check for keywords
    jobReqs.technicalKeywords.forEach(keyword => {
      if (bulletLower.includes(keyword.toLowerCase())) {
        score += 3;
      }
    });

    return { skills: matchedSkills, score };
  }

  /**
   * Enhance a single bullet point
   */
  private async enhanceBullet(bullet: string, jobReqs: JobRequirements, options: EnhancementOptions): Promise<string> {
    const prompt = `You are an expert resume writer optimizing a resume bullet point for a specific job.

**Original Bullet:**
${bullet}

**Job Requirements:**
- Required Skills: ${jobReqs.requiredSkills.slice(0, 10).join(', ')}
- Keywords to emphasize: ${jobReqs.technicalKeywords.slice(0, 5).join(', ')}

**Instructions:**
1. Rewrite the bullet to emphasize skills that match job requirements
2. Use strong action verbs (led, architected, implemented, optimized, etc.)
3. Include quantifiable results if present in the original
4. Optimize for ATS by naturally incorporating keywords
5. Keep the same core meaning - DO NOT invent new accomplishments
6. NEVER change facts, add fake metrics, or exaggerate
7. Maximum length: 2 lines (about 150 characters)
8. Start with an action verb

**Aggressiveness Level:** ${options.aggressiveness}
- conservative: Minor rewording only
- moderate: Emphasize relevant skills more prominently
- aggressive: Maximum keyword optimization while staying truthful

**Output Format:**
Return ONLY the enhanced bullet point (no explanation, no markdown).`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      let enhanced = response.text().trim();

      // Clean up
      enhanced = enhanced.replace(/^[•\-\*]\s*/, ''); // Remove bullet symbols
      enhanced = enhanced.replace(/```\w*\n?/g, '').trim();
      enhanced = enhanced.replace(/^["']|["']$/g, ''); // Remove quotes

      // Validate: ensure it's not too different from original
      if (this.isTooDeviated(bullet, enhanced)) {
        console.warn('Enhanced bullet deviated too much, using original');
        return bullet;
      }

      return enhanced;
    } catch (error) {
      console.error('Failed to enhance bullet:', error);
      return bullet;
    }
  }

  /**
   * Check if enhanced version deviated too much from original
   */
  private isTooDeviated(original: string, enhanced: string): boolean {
    // Simple heuristic: check if key words are preserved
    const originalWords = new Set(original.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const enhancedWords = new Set(enhanced.toLowerCase().split(/\W+/).filter(w => w.length > 3));

    const commonWords = Array.from(originalWords).filter(w => enhancedWords.has(w));
    const preservationRatio = commonWords.length / originalWords.size;

    // At least 40% of key words should be preserved
    return preservationRatio < 0.4;
  }

  // ===========================================================================
  // SKILLS OPTIMIZATION
  // ===========================================================================

  /**
   * Optimize skills section for job requirements
   */
  async optimizeSkillsSection(
    skills: Skills,
    jobSkills: string[],
    hiddenSkills: any[],
    options: EnhancementOptions
  ): Promise<{ skills: Skills; changes: ChangeLog[] }> {
    const changes: ChangeLog[] = [];
    const optimized: Skills = JSON.parse(JSON.stringify(skills)); // Deep clone

    // Add hidden skills if option enabled
    if (options.includeHiddenSkills && hiddenSkills.length > 0) {
      hiddenSkills.forEach(hidden => {
        if (hidden.relevance === 'high') {
          const category = this.determineSkillCategory(hidden.skill);

          if (!optimized[category as keyof Skills]) {
            (optimized as any)[category] = [];
          }

          const categoryArray = optimized[category as keyof Skills] as string[] | undefined;
          if (Array.isArray(categoryArray) && !categoryArray.includes(hidden.skill)) {
            categoryArray.unshift(hidden.skill); // Add to top

            changes.push({
              type: 'skills_add',
              section: 'skills',
              field: category,
              modified: hidden.skill,
              reasoning: `Added ${hidden.skill} from your ${hidden.foundIn} to match job requirements`,
              impact: 'high',
            });
          }
        }
      });
    }

    // Reorder skills to prioritize job-required skills
    if (options.optimizeForATS) {
      const reordered = this.reorderSkillsByPriority(optimized, jobSkills);

      if (reordered.changed) {
        changes.push({
          type: 'skills_reorder',
          section: 'skills',
          modified: 'Reordered skills to prioritize job requirements',
          reasoning: 'Skills matching job requirements moved to top for better ATS scoring',
          impact: 'medium',
        });
        Object.assign(optimized, reordered.skills);
      }
    }

    return { skills: optimized, changes };
  }

  /**
   * Determine which category a skill belongs to
   */
  private determineSkillCategory(skill: string): string {
    const skillLower = skill.toLowerCase();

    // Programming languages
    if (/\b(javascript|typescript|python|java|c\+\+|ruby|go|rust|php)\b/i.test(skillLower)) {
      return 'languages';
    }

    // Frameworks
    if (/\b(react|vue|angular|django|flask|spring|express|fastify)\b/i.test(skillLower)) {
      return 'frameworks';
    }

    // Tools
    if (/\b(git|docker|kubernetes|jenkins|jira|aws|azure)\b/i.test(skillLower)) {
      return 'tools';
    }

    // Default to technical
    return 'technical';
  }

  /**
   * Reorder skills to prioritize job-required skills
   */
  private reorderSkillsByPriority(
    skills: Skills,
    jobSkills: string[]
  ): { skills: Skills; changed: boolean } {
    let changed = false;
    const reordered: Skills = { ...skills };

    // Reorder each category
    (['technical', 'languages', 'frameworks', 'tools', 'soft'] as const).forEach(category => {
      const categorySkills = skills[category];
      if (Array.isArray(categorySkills) && categorySkills.length > 0) {
        const prioritized = this.prioritizeSkills(categorySkills, jobSkills);
        if (JSON.stringify(prioritized) !== JSON.stringify(categorySkills)) {
          (reordered as any)[category] = prioritized;
          changed = true;
        }
      }
    });

    return { skills: reordered, changed };
  }

  /**
   * Prioritize skills based on job requirements
   */
  private prioritizeSkills(skillsArray: string[], jobSkills: string[]): string[] {
    const jobSkillsLower = jobSkills.map(s => s.toLowerCase());

    // Separate into matching and non-matching
    const matching = skillsArray.filter(s => jobSkillsLower.some(js => s.toLowerCase().includes(js)));
    const nonMatching = skillsArray.filter(s => !jobSkillsLower.some(js => s.toLowerCase().includes(js)));

    // Return matching first, then non-matching
    return [...matching, ...nonMatching];
  }

  // ===========================================================================
  // COMPARISON & DIFF GENERATION
  // ===========================================================================

  /**
   * Compare original and tailored resume
   */
  async compareVersions(original: StructuredResume, tailored: TailoredResume): Promise<DiffResult> {
    console.log('🔍 Generating diff between original and tailored resume...');

    const changes = tailored.changes;

    // Summary diff
    const summaryDiff = original.summary !== tailored.summary
      ? {
          original: original.summary || '',
          modified: tailored.summary,
          additions: this.findAdditions(original.summary || '', tailored.summary),
          deletions: this.findDeletions(original.summary || '', tailored.summary),
        }
      : undefined;

    // Experience diffs
    const experienceDiffs = this.generateExperienceDiffs(original.experience, tailored.experience);

    // Skills diff
    const skillsDiff = this.generateSkillsDiff(original.skills, tailored.skills);

    // Other changes
    const otherChanges = changes.filter(c => c.type !== 'summary' && c.type !== 'experience_bullet' && c.type !== 'skills_reorder' && c.type !== 'skills_add');

    // Generate visual diff
    const visualDiff = this.generateVisualDiff(summaryDiff, experienceDiffs, skillsDiff, otherChanges);

    return {
      summary: {
        totalChanges: changes.length,
        addedItems: changes.filter(c => c.type.includes('add')).length,
        modifiedItems: changes.filter(c => c.type.includes('bullet') || c.type === 'summary').length,
        reorderedItems: changes.filter(c => c.type.includes('reorder')).length,
      },
      summaryDiff,
      experienceDiffs,
      skillsDiff,
      otherChanges,
      visualDiff,
    };
  }

  /**
   * Generate experience diffs
   */
  private generateExperienceDiffs(original: WorkExperience[], tailored: WorkExperience[]): ExperienceDiff[] {
    const diffs: ExperienceDiff[] = [];

    original.forEach((origExp, index) => {
      const tailoredExp = tailored[index];
      if (!tailoredExp) return;

      const bulletsDiff: ExperienceDiff['bulletsDiff'] = [];

      const maxBullets = Math.max(origExp.highlights?.length || 0, tailoredExp.highlights?.length || 0);

      for (let i = 0; i < maxBullets; i++) {
        const origBullet = origExp.highlights?.[i] || '';
        const tailoredBullet = tailoredExp.highlights?.[i] || '';

        if (origBullet !== tailoredBullet) {
          bulletsDiff.push({
            index: i,
            original: origBullet,
            modified: tailoredBullet,
            changeType: !origBullet ? 'added' : 'modified',
          });
        } else if (origBullet) {
          bulletsDiff.push({
            index: i,
            original: origBullet,
            modified: tailoredBullet,
            changeType: 'unchanged',
          });
        }
      }

      if (bulletsDiff.some(b => b.changeType !== 'unchanged')) {
        diffs.push({
          company: origExp.company,
          role: origExp.role,
          bulletsDiff,
        });
      }
    });

    return diffs;
  }

  /**
   * Generate skills diff
   */
  private generateSkillsDiff(original: Skills, tailored: Skills): SkillsDiff {
    const getAllSkillsFlat = (skills: Skills): string[] => {
      const all: string[] = [];
      if (skills.technical) all.push(...skills.technical);
      if (skills.languages) all.push(...skills.languages);
      if (skills.frameworks) all.push(...skills.frameworks);
      if (skills.tools) all.push(...skills.tools);
      if (skills.soft) all.push(...skills.soft);
      if (skills.categories) {
        Object.values(skills.categories).forEach(cat => all.push(...cat));
      }
      return all;
    };

    const origSkills = getAllSkillsFlat(original);
    const tailoredSkills = getAllSkillsFlat(tailored);

    const added = tailoredSkills.filter(s => !origSkills.includes(s));
    const removed = origSkills.filter(s => !tailoredSkills.includes(s));

    return {
      added,
      removed,
      reordered: JSON.stringify(original) !== JSON.stringify(tailored) && added.length === 0 && removed.length === 0,
      categories: {},
    };
  }

  /**
   * Find text additions
   */
  private findAdditions(original: string, modified: string): string[] {
    const origWords = new Set(original.toLowerCase().split(/\s+/));
    const modWords = modified.toLowerCase().split(/\s+/);

    return modWords.filter(w => !origWords.has(w) && w.length > 3);
  }

  /**
   * Find text deletions
   */
  private findDeletions(original: string, modified: string): string[] {
    const origWords = original.toLowerCase().split(/\s+/);
    const modWords = new Set(modified.toLowerCase().split(/\s+/));

    return origWords.filter(w => !modWords.has(w) && w.length > 3);
  }

  /**
   * Generate visual diff in markdown format
   */
  private generateVisualDiff(
    summaryDiff?: TextDiff,
    experienceDiffs: ExperienceDiff[] = [],
    skillsDiff?: SkillsDiff,
    otherChanges: ChangeLog[] = []
  ): string {
    let markdown = '# Resume Changes\n\n';

    // Summary changes
    if (summaryDiff) {
      markdown += '## Summary\n\n';
      markdown += `**Original:**\n> ${summaryDiff.original}\n\n`;
      markdown += `**Modified:**\n> ${summaryDiff.modified}\n\n`;
      if (summaryDiff.additions.length > 0) {
        markdown += `**Added keywords:** ${summaryDiff.additions.join(', ')}\n\n`;
      }
    }

    // Experience changes
    if (experienceDiffs.length > 0) {
      markdown += '## Experience\n\n';
      experienceDiffs.forEach(diff => {
        markdown += `### ${diff.role} at ${diff.company}\n\n`;
        diff.bulletsDiff.forEach(bullet => {
          if (bullet.changeType === 'modified') {
            markdown += `**Before:**\n- ${bullet.original}\n\n`;
            markdown += `**After:**\n- ${bullet.modified}\n\n`;
          } else if (bullet.changeType === 'added') {
            markdown += `**Added:**\n- ${bullet.modified}\n\n`;
          }
        });
      });
    }

    // Skills changes
    if (skillsDiff) {
      markdown += '## Skills\n\n';
      if (skillsDiff.added.length > 0) {
        markdown += `**Added:** ${skillsDiff.added.join(', ')}\n\n`;
      }
      if (skillsDiff.removed.length > 0) {
        markdown += `**Removed:** ${skillsDiff.removed.join(', ')}\n\n`;
      }
      if (skillsDiff.reordered) {
        markdown += `**Note:** Skills reordered to prioritize job requirements\n\n`;
      }
    }

    return markdown;
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Get top skills from resume
   */
  private getTopSkills(resume: StructuredResume): string[] {
    const skills: string[] = [];
    if (resume.skills.technical) skills.push(...resume.skills.technical);
    if (resume.skills.frameworks) skills.push(...resume.skills.frameworks);
    if (resume.skills.tools) skills.push(...resume.skills.tools);
    return skills.slice(0, 15);
  }

  /**
   * Estimate improved match score
   */
  private estimateImprovedMatchScore(currentScore: number, changes: ChangeLog[]): number {
    let improvement = 0;

    changes.forEach(change => {
      if (change.impact === 'high') improvement += 3;
      if (change.impact === 'medium') improvement += 2;
      if (change.impact === 'low') improvement += 1;
    });

    return Math.min(100, currentScore + improvement);
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let resumeEnhancerService: ResumeEnhancerService | null = null;

export function getResumeEnhancerService(): ResumeEnhancerService {
  if (!resumeEnhancerService) {
    resumeEnhancerService = new ResumeEnhancerService();
  }
  return resumeEnhancerService;
}

export default ResumeEnhancerService;
