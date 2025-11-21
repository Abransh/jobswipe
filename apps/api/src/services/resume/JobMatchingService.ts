/**
 * @fileoverview Job Matching Service - Analyze Resume-Job Fit
 * @description AI-powered analysis of resume fit for job postings
 * @version 1.0.0
 * @author JobSwipe Team
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { StructuredResume, WorkExperience, Education, Skills } from './ResumeStructurerService';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

/**
 * Job posting data structure (from Prisma schema)
 */
export interface JobPosting {
  id: string;
  title: string;
  description: string;
  requirements?: string | null;
  benefits?: string | null;
  type: string; // JobType enum
  level: string; // JobLevel enum
  department?: string | null;
  category: string; // JobCategory enum
  remote: boolean;
  remoteType: string; // RemoteType enum
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  experienceYears?: number | null;
  skills: string[];
  education?: string | null;
  languages: string[];
  keywords: string[];
  tags: string[];
  companyId: string;
  applyUrl?: string | null;
}

/**
 * Structured job requirements extracted from posting
 */
export interface JobRequirements {
  // Core requirements
  requiredSkills: string[];
  preferredSkills: string[];
  requiredExperience: number; // Years
  requiredEducation: string[];
  requiredLanguages: string[];

  // Semantic analysis
  technicalKeywords: string[];
  softSkillKeywords: string[];
  domainKeywords: string[];

  // Metadata
  seniorityLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  industryVertical: string;
}

/**
 * Skill gap analysis
 */
export interface SkillGap {
  skill: string;
  category: 'required' | 'preferred';
  severity: 'critical' | 'high' | 'medium' | 'low';
  alternativeMatch?: string; // Similar skill user has
  learningCurve: 'easy' | 'moderate' | 'steep';
}

/**
 * Hidden skill (user has but didn't emphasize)
 */
export interface HiddenSkill {
  skill: string;
  foundIn: 'experience' | 'projects' | 'certifications' | 'education';
  context: string; // Where it was found
  relevance: 'high' | 'medium' | 'low';
  recommendedPlacement: 'top_skills' | 'experience_highlights' | 'certifications';
}

/**
 * Enhancement recommendation
 */
export interface Enhancement {
  type: 'add_skill' | 'emphasize_skill' | 'add_experience' | 'reword_bullet' | 'add_certification';
  priority: 'critical' | 'high' | 'medium' | 'low';
  skill?: string;
  currentText?: string;
  suggestedText?: string;
  reasoning: string;
  impact: number; // 0-100: expected impact on match score
}

/**
 * Complete job fit analysis
 */
export interface JobFitAnalysis {
  // Overall metrics
  overallMatchScore: number; // 0-100
  confidenceLevel: number; // 0-100: how confident is the analysis

  // Detailed scores
  scores: {
    skillsMatch: number; // 0-100
    experienceMatch: number; // 0-100
    educationMatch: number; // 0-100
    seniorityMatch: number; // 0-100
    locationMatch: number; // 0-100
    overallFit: number; // 0-100
  };

  // Gaps and opportunities
  skillGaps: SkillGap[];
  hiddenSkills: HiddenSkill[];
  missingKeywords: string[];

  // Recommendations
  recommendations: Enhancement[];

  // Analysis metadata
  analysisDate: Date;
  aiModelUsed: string;
  processingTime: number; // milliseconds
}

/**
 * AI skill matching result
 */
interface SkillMatchResult {
  directMatches: string[]; // Exact or very close matches
  semanticMatches: Array<{ jobSkill: string; resumeSkill: string; confidence: number }>;
  missingSkills: string[];
  hiddenSkills: HiddenSkill[];
}

// =============================================================================
// JOB MATCHING SERVICE CLASS
// =============================================================================

export class JobMatchingService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // Use Gemini Flash for quick analysis
    const modelName = process.env.GEMINI_MATCHING_MODEL || 'gemini-2.0-flash-exp';

    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.3, // Lower temperature for consistent analysis
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    console.log(`🎯 JobMatchingService initialized with model: ${modelName}`);
  }

  // ===========================================================================
  // MAIN ANALYSIS METHOD
  // ===========================================================================

  /**
   * Perform comprehensive job fit analysis
   */
  async analyzeJobFit(jobPosting: JobPosting, resume: StructuredResume): Promise<JobFitAnalysis> {
    const startTime = Date.now();
    console.log(`🔍 Analyzing job fit: "${jobPosting.title}" vs "${resume.contact.fullName}"`);

    try {
      // Step 1: Extract job requirements
      const jobReqs = this.extractJobRequirements(jobPosting);
      console.log(`✓ Extracted ${jobReqs.requiredSkills.length} required skills, ${jobReqs.preferredSkills.length} preferred`);

      // Step 2: Perform AI-powered skill matching
      const skillMatch = await this.performAISkillMatching(jobReqs, resume);
      console.log(`✓ Found ${skillMatch.directMatches.length} direct matches, ${skillMatch.semanticMatches.length} semantic matches`);

      // Step 3: Calculate match scores
      const scores = this.calculateDetailedScores(jobPosting, jobReqs, resume, skillMatch);
      console.log(`✓ Overall match score: ${scores.overallFit}%`);

      // Step 4: Identify skill gaps
      const skillGaps = this.identifySkillGaps(jobReqs, skillMatch, resume);
      console.log(`✓ Identified ${skillGaps.length} skill gaps`);

      // Step 5: Find hidden skills
      const hiddenSkills = await this.findHiddenSkills(jobPosting.skills, resume);
      console.log(`✓ Found ${hiddenSkills.length} hidden skills`);

      // Step 6: Generate recommendations
      const recommendations = this.generateRecommendations(skillGaps, hiddenSkills, jobReqs, resume);
      console.log(`✓ Generated ${recommendations.length} recommendations`);

      // Step 7: Calculate overall match score
      const overallMatchScore = await this.calculateMatchScore(jobPosting, resume);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Job fit analysis complete in ${processingTime}ms`);

      return {
        overallMatchScore,
        confidenceLevel: this.calculateConfidenceLevel(jobPosting, resume),
        scores,
        skillGaps,
        hiddenSkills,
        missingKeywords: this.findMissingKeywords(jobPosting.keywords, resume),
        recommendations,
        analysisDate: new Date(),
        aiModelUsed: process.env.GEMINI_MATCHING_MODEL || 'gemini-2.0-flash-exp',
        processingTime,
      };
    } catch (error) {
      console.error('❌ Job fit analysis failed:', error);
      throw new Error(`Failed to analyze job fit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ===========================================================================
  // JOB REQUIREMENTS EXTRACTION
  // ===========================================================================

  /**
   * Extract structured requirements from job posting
   */
  private extractJobRequirements(jobPosting: JobPosting): JobRequirements {
    // Parse skills into required vs preferred
    const requiredSkills: string[] = [];
    const preferredSkills: string[] = [];

    // Skills array is typically required
    jobPosting.skills.forEach(skill => {
      const normalized = skill.trim().toLowerCase();
      if (normalized.includes('preferred') || normalized.includes('nice to have') || normalized.includes('bonus')) {
        preferredSkills.push(skill.replace(/(preferred|nice to have|bonus)/gi, '').trim());
      } else {
        requiredSkills.push(skill);
      }
    });

    // Extract skills from requirements text
    if (jobPosting.requirements) {
      const reqText = jobPosting.requirements.toLowerCase();
      const requiredMatches = reqText.match(/required:?\s*([^.]*)/gi);
      const preferredMatches = reqText.match(/(preferred|nice to have|bonus):?\s*([^.]*)/gi);

      // Parse required skills from text
      requiredMatches?.forEach(match => {
        const skills = match.split(/,|;|\n/).filter(s => s.trim().length > 3);
        skills.forEach(s => {
          const cleaned = s.replace(/required:?/gi, '').trim();
          if (cleaned && !requiredSkills.includes(cleaned)) {
            requiredSkills.push(cleaned);
          }
        });
      });

      // Parse preferred skills from text
      preferredMatches?.forEach(match => {
        const skills = match.split(/,|;|\n/).filter(s => s.trim().length > 3);
        skills.forEach(s => {
          const cleaned = s.replace(/(preferred|nice to have|bonus):?/gi, '').trim();
          if (cleaned && !preferredSkills.includes(cleaned)) {
            preferredSkills.push(cleaned);
          }
        });
      });
    }

    // Extract technical keywords
    const technicalKeywords = this.extractTechnicalKeywords(jobPosting);
    const softSkillKeywords = this.extractSoftSkills(jobPosting);
    const domainKeywords = jobPosting.keywords.filter(k =>
      !technicalKeywords.includes(k) && !softSkillKeywords.includes(k)
    );

    return {
      requiredSkills,
      preferredSkills,
      requiredExperience: jobPosting.experienceYears || 0,
      requiredEducation: jobPosting.education ? [jobPosting.education] : [],
      requiredLanguages: jobPosting.languages || [],
      technicalKeywords,
      softSkillKeywords,
      domainKeywords,
      seniorityLevel: this.mapJobLevelToSeniority(jobPosting.level),
      industryVertical: jobPosting.category,
    };
  }

  /**
   * Extract technical keywords from job description
   */
  private extractTechnicalKeywords(jobPosting: JobPosting): string[] {
    const text = `${jobPosting.description} ${jobPosting.requirements || ''}`.toLowerCase();
    const techPatterns = [
      // Programming languages
      /\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin)\b/gi,
      // Frameworks
      /\b(react|vue|angular|node\.?js|express|fastify|django|flask|spring|\.net)\b/gi,
      // Databases
      /\b(postgresql|mysql|mongodb|redis|elasticsearch|cassandra|dynamodb)\b/gi,
      // Cloud
      /\b(aws|azure|gcp|kubernetes|docker|terraform|cloudformation)\b/gi,
      // Tools
      /\b(git|jenkins|gitlab|github|jira|confluence|slack)\b/gi,
    ];

    const keywords = new Set<string>();
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      matches?.forEach(m => keywords.add(m.toLowerCase()));
    });

    return Array.from(keywords);
  }

  /**
   * Extract soft skills from job description
   */
  private extractSoftSkills(jobPosting: JobPosting): string[] {
    const text = `${jobPosting.description} ${jobPosting.requirements || ''}`.toLowerCase();
    const softSkills = [
      'communication', 'leadership', 'teamwork', 'problem solving', 'critical thinking',
      'collaboration', 'adaptability', 'creativity', 'time management', 'organization',
      'attention to detail', 'analytical', 'self-motivated', 'proactive', 'mentoring',
    ];

    return softSkills.filter(skill => text.includes(skill));
  }

  /**
   * Map job level to seniority
   */
  private mapJobLevelToSeniority(level: string): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' {
    const levelLower = level.toLowerCase();
    if (levelLower.includes('entry') || levelLower.includes('junior')) return 'entry';
    if (levelLower.includes('mid') || levelLower.includes('intermediate')) return 'mid';
    if (levelLower.includes('senior') || levelLower.includes('sr')) return 'senior';
    if (levelLower.includes('lead') || levelLower.includes('principal') || levelLower.includes('staff')) return 'lead';
    if (levelLower.includes('executive') || levelLower.includes('director') || levelLower.includes('vp') || levelLower.includes('cto') || levelLower.includes('cio')) return 'executive';
    return 'mid'; // Default
  }

  // ===========================================================================
  // AI-POWERED SKILL MATCHING
  // ===========================================================================

  /**
   * Use AI to match skills semantically (e.g., "microservices" matches "modular applications")
   */
  private async performAISkillMatching(
    jobReqs: JobRequirements,
    resume: StructuredResume
  ): Promise<SkillMatchResult> {
    // Collect all resume skills
    const resumeSkills = this.getAllResumeSkills(resume);

    // Build prompt for AI skill matching
    const prompt = this.buildSkillMatchingPrompt(jobReqs, resumeSkills);

    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Parse AI response
      const parsed = JSON.parse(this.extractJSON(text));

      return {
        directMatches: parsed.directMatches || [],
        semanticMatches: parsed.semanticMatches || [],
        missingSkills: parsed.missingSkills || [],
        hiddenSkills: [], // Will be populated separately
      };
    } catch (error) {
      console.warn('AI skill matching failed, falling back to exact matching:', error);

      // Fallback to exact matching
      return this.performExactSkillMatching(jobReqs, resumeSkills);
    }
  }

  /**
   * Build prompt for AI skill matching
   */
  private buildSkillMatchingPrompt(jobReqs: JobRequirements, resumeSkills: string[]): string {
    return `You are an expert technical recruiter analyzing skill matches between a job posting and a resume.

**Job Required Skills:**
${jobReqs.requiredSkills.join(', ')}

**Job Preferred Skills:**
${jobReqs.preferredSkills.join(', ')}

**Resume Skills:**
${resumeSkills.join(', ')}

**Task:**
Analyze the skills and identify:
1. **Direct Matches**: Skills that are exactly the same or very similar (e.g., "JavaScript" = "JS", "PostgreSQL" = "Postgres")
2. **Semantic Matches**: Skills that are conceptually similar (e.g., "microservices" ≈ "distributed systems", "React" ≈ "frontend frameworks")
3. **Missing Skills**: Required job skills that the candidate does NOT have (be strict)

**IMPORTANT:**
- Be intelligent about synonyms (Docker = containerization, K8s = Kubernetes)
- Understand technology families (React, Vue, Angular are all frontend frameworks)
- Consider experience level (5 years Python > 1 year Python)
- DO NOT invent skills the candidate doesn't have
- If uncertain, classify as "missing" rather than "match"

**Output Format (JSON only, no markdown):**
{
  "directMatches": ["skill1", "skill2"],
  "semanticMatches": [
    {"jobSkill": "microservices", "resumeSkill": "distributed systems", "confidence": 85}
  ],
  "missingSkills": ["skill3", "skill4"]
}`;
  }

  /**
   * Get all skills from resume (including implicit skills from experience)
   */
  private getAllResumeSkills(resume: StructuredResume): string[] {
    const skills = new Set<string>();

    // Explicit skills
    if (resume.skills.technical) resume.skills.technical.forEach(s => skills.add(s));
    if (resume.skills.frameworks) resume.skills.frameworks.forEach(s => skills.add(s));
    if (resume.skills.tools) resume.skills.tools.forEach(s => skills.add(s));
    if (resume.skills.languages) resume.skills.languages.forEach(s => skills.add(s));
    if (resume.skills.soft) resume.skills.soft.forEach(s => skills.add(s));

    // Skills from categories
    if (resume.skills.categories) {
      Object.values(resume.skills.categories).forEach(categorySkills => {
        categorySkills.forEach(s => skills.add(s));
      });
    }

    // Extract skills from experience highlights
    resume.experience.forEach(exp => {
      exp.highlights?.forEach(highlight => {
        const techTerms = this.extractTechTermsFromText(highlight);
        techTerms.forEach(term => skills.add(term));
      });
    });

    // Certifications imply skills
    resume.certifications?.forEach(cert => {
      if (cert.name.toLowerCase().includes('aws')) skills.add('AWS');
      if (cert.name.toLowerCase().includes('kubernetes')) skills.add('Kubernetes');
      if (cert.name.toLowerCase().includes('pmp')) skills.add('Project Management');
      // Add more certification-to-skill mappings as needed
    });

    return Array.from(skills);
  }

  /**
   * Extract technical terms from text
   */
  private extractTechTermsFromText(text: string): string[] {
    const techPatterns = [
      /\b(React|Vue|Angular|Node\.?js|Python|Java|JavaScript|TypeScript)\b/gi,
      /\b(AWS|Azure|GCP|Kubernetes|Docker|Terraform)\b/gi,
      /\b(PostgreSQL|MySQL|MongoDB|Redis|Elasticsearch)\b/gi,
      /\b(Git|CI\/CD|Jenkins|GitHub|GitLab)\b/gi,
    ];

    const terms = new Set<string>();
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      matches?.forEach(m => terms.add(m));
    });

    return Array.from(terms);
  }

  /**
   * Fallback: exact skill matching
   */
  private performExactSkillMatching(jobReqs: JobRequirements, resumeSkills: string[]): SkillMatchResult {
    const resumeSkillsLower = resumeSkills.map(s => s.toLowerCase());
    const directMatches: string[] = [];
    const missingSkills: string[] = [];

    [...jobReqs.requiredSkills, ...jobReqs.preferredSkills].forEach(jobSkill => {
      const jobSkillLower = jobSkill.toLowerCase();
      if (resumeSkillsLower.some(rs => rs.includes(jobSkillLower) || jobSkillLower.includes(rs))) {
        directMatches.push(jobSkill);
      } else {
        missingSkills.push(jobSkill);
      }
    });

    return {
      directMatches,
      semanticMatches: [],
      missingSkills,
      hiddenSkills: [],
    };
  }

  // ===========================================================================
  // SCORE CALCULATION
  // ===========================================================================

  /**
   * Calculate detailed match scores
   */
  private calculateDetailedScores(
    jobPosting: JobPosting,
    jobReqs: JobRequirements,
    resume: StructuredResume,
    skillMatch: SkillMatchResult
  ): JobFitAnalysis['scores'] {
    // Skills match score (40% weight)
    const totalJobSkills = jobReqs.requiredSkills.length + jobReqs.preferredSkills.length;
    const matchedSkills = skillMatch.directMatches.length + skillMatch.semanticMatches.length;
    const skillsMatch = totalJobSkills > 0 ? Math.round((matchedSkills / totalJobSkills) * 100) : 0;

    // Experience match score (30% weight)
    const experienceMatch = this.calculateExperienceMatch(jobPosting, resume);

    // Education match score (15% weight)
    const educationMatch = this.calculateEducationMatch(jobReqs, resume);

    // Seniority match score (10% weight)
    const seniorityMatch = this.calculateSeniorityMatch(jobReqs, resume);

    // Location match score (5% weight)
    const locationMatch = this.calculateLocationMatch(jobPosting, resume);

    // Weighted overall fit
    const overallFit = Math.round(
      skillsMatch * 0.40 +
      experienceMatch * 0.30 +
      educationMatch * 0.15 +
      seniorityMatch * 0.10 +
      locationMatch * 0.05
    );

    return {
      skillsMatch,
      experienceMatch,
      educationMatch,
      seniorityMatch,
      locationMatch,
      overallFit,
    };
  }

  /**
   * Calculate experience match
   */
  private calculateExperienceMatch(jobPosting: JobPosting, resume: StructuredResume): number {
    const requiredYears = jobPosting.experienceYears || 0;

    // Calculate total years of experience
    const totalYears = resume.experience.reduce((sum, exp) => {
      if (!exp.startDate.year) return sum;

      const endYear = exp.endDate?.year || new Date().getFullYear();
      const years = endYear - exp.startDate.year;
      return sum + years;
    }, 0);

    if (requiredYears === 0) return 100; // No requirement
    if (totalYears >= requiredYears) return 100; // Meets or exceeds

    // Partial credit if close
    const ratio = totalYears / requiredYears;
    return Math.round(ratio * 100);
  }

  /**
   * Calculate education match
   */
  private calculateEducationMatch(jobReqs: JobRequirements, resume: StructuredResume): number {
    if (jobReqs.requiredEducation.length === 0) return 100; // No requirement

    const highestDegree = this.getHighestDegree(resume.education);
    const requiredDegree = jobReqs.requiredEducation[0].toLowerCase();

    const degreeRanks: Record<string, number> = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5,
      'doctorate': 5,
    };

    const userRank = degreeRanks[highestDegree] || 0;
    const requiredRank = Object.entries(degreeRanks).find(([key]) =>
      requiredDegree.includes(key)
    )?.[1] || 3;

    if (userRank >= requiredRank) return 100;
    if (userRank === requiredRank - 1) return 75; // One level below
    return 50; // Significantly below
  }

  /**
   * Get highest degree from education
   */
  private getHighestDegree(education: Education[]): string {
    const degrees = education.map(edu => edu.degree.toLowerCase());

    if (degrees.some(d => d.includes('phd') || d.includes('doctorate'))) return 'phd';
    if (degrees.some(d => d.includes('master') || d.includes('ms') || d.includes('mba'))) return 'master';
    if (degrees.some(d => d.includes('bachelor') || d.includes('bs') || d.includes('ba'))) return 'bachelor';
    if (degrees.some(d => d.includes('associate'))) return 'associate';

    return 'high school';
  }

  /**
   * Calculate seniority match
   */
  private calculateSeniorityMatch(jobReqs: JobRequirements, resume: StructuredResume): number {
    const seniorityRanks: Record<string, number> = {
      'entry': 1,
      'mid': 2,
      'senior': 3,
      'lead': 4,
      'executive': 5,
    };

    const requiredRank = seniorityRanks[jobReqs.seniorityLevel];

    // Infer user seniority from experience
    const totalYears = resume.experience.reduce((sum, exp) => {
      if (!exp.startDate.year) return sum;
      const endYear = exp.endDate?.year || new Date().getFullYear();
      return sum + (endYear - exp.startDate.year);
    }, 0);

    let userSeniority: keyof typeof seniorityRanks;
    if (totalYears < 2) userSeniority = 'entry';
    else if (totalYears < 5) userSeniority = 'mid';
    else if (totalYears < 10) userSeniority = 'senior';
    else if (totalYears < 15) userSeniority = 'lead';
    else userSeniority = 'executive';

    const userRank = seniorityRanks[userSeniority];

    if (userRank === requiredRank) return 100;
    if (Math.abs(userRank - requiredRank) === 1) return 75;
    return 50;
  }

  /**
   * Calculate location match
   */
  private calculateLocationMatch(jobPosting: JobPosting, resume: StructuredResume): number {
    // If remote, location doesn't matter
    if (jobPosting.remote || jobPosting.remoteType === 'REMOTE') return 100;

    // If no location specified, assume match
    if (!jobPosting.city && !jobPosting.state && !resume.contact.location) return 100;

    // Compare locations
    const jobCity = jobPosting.city?.toLowerCase();
    const jobState = jobPosting.state?.toLowerCase();
    const resumeCity = resume.contact.location?.city?.toLowerCase();
    const resumeState = resume.contact.location?.state?.toLowerCase();

    if (jobCity && resumeCity && jobCity === resumeCity) return 100;
    if (jobState && resumeState && jobState === resumeState) return 75;

    return 50; // Different location
  }

  /**
   * Calculate overall match score (simplified method for API)
   */
  async calculateMatchScore(jobPosting: JobPosting, resume: StructuredResume): Promise<number> {
    const jobReqs = this.extractJobRequirements(jobPosting);
    const skillMatch = await this.performAISkillMatching(jobReqs, resume);
    const scores = this.calculateDetailedScores(jobPosting, jobReqs, resume, skillMatch);

    return scores.overallFit;
  }

  // ===========================================================================
  // SKILL GAP IDENTIFICATION
  // ===========================================================================

  /**
   * Identify skill gaps
   */
  private identifySkillGaps(
    jobReqs: JobRequirements,
    skillMatch: SkillMatchResult,
    resume: StructuredResume
  ): SkillGap[] {
    const gaps: SkillGap[] = [];
    const resumeSkills = this.getAllResumeSkills(resume);

    // Required skill gaps (critical severity)
    jobReqs.requiredSkills.forEach(skill => {
      if (!skillMatch.directMatches.includes(skill) &&
          !skillMatch.semanticMatches.some(m => m.jobSkill === skill)) {
        gaps.push({
          skill,
          category: 'required',
          severity: 'critical',
          alternativeMatch: this.findAlternativeSkill(skill, resumeSkills),
          learningCurve: this.estimateLearningCurve(skill),
        });
      }
    });

    // Preferred skill gaps (medium/low severity)
    jobReqs.preferredSkills.forEach(skill => {
      if (!skillMatch.directMatches.includes(skill) &&
          !skillMatch.semanticMatches.some(m => m.jobSkill === skill)) {
        gaps.push({
          skill,
          category: 'preferred',
          severity: 'medium',
          alternativeMatch: this.findAlternativeSkill(skill, resumeSkills),
          learningCurve: this.estimateLearningCurve(skill),
        });
      }
    });

    // Sort by severity
    return gaps.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Find alternative skill user has that's similar
   */
  private findAlternativeSkill(missingSkill: string, resumeSkills: string[]): string | undefined {
    const skillFamilies: Record<string, string[]> = {
      'frontend': ['react', 'vue', 'angular', 'svelte', 'ember'],
      'backend': ['node.js', 'express', 'fastify', 'django', 'flask', 'spring'],
      'database': ['postgresql', 'mysql', 'mongodb', 'redis', 'cassandra'],
      'cloud': ['aws', 'azure', 'gcp', 'digitalocean', 'heroku'],
      'containerization': ['docker', 'kubernetes', 'podman', 'containerd'],
    };

    const missingLower = missingSkill.toLowerCase();

    // Find which family the missing skill belongs to
    for (const [family, skills] of Object.entries(skillFamilies)) {
      if (skills.some(s => missingLower.includes(s))) {
        // Check if user has another skill in same family
        for (const resumeSkill of resumeSkills) {
          if (skills.some(s => resumeSkill.toLowerCase().includes(s)) &&
              !resumeSkill.toLowerCase().includes(missingLower)) {
            return resumeSkill;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Estimate learning curve for a skill
   */
  private estimateLearningCurve(skill: string): 'easy' | 'moderate' | 'steep' {
    const skillLower = skill.toLowerCase();

    // Easy to learn (similar tools, syntax, concepts)
    const easySkills = ['git', 'jira', 'slack', 'confluence', 'postman'];
    if (easySkills.some(s => skillLower.includes(s))) return 'easy';

    // Steep learning curve (complex systems, paradigm shifts)
    const steepSkills = ['kubernetes', 'terraform', 'machine learning', 'blockchain', 'rust'];
    if (steepSkills.some(s => skillLower.includes(s))) return 'steep';

    return 'moderate'; // Default
  }

  // ===========================================================================
  // HIDDEN SKILLS DETECTION
  // ===========================================================================

  /**
   * Find skills user has but didn't emphasize
   */
  async findHiddenSkills(jobSkills: string[], resume: StructuredResume): Promise<HiddenSkill[]> {
    const hidden: HiddenSkill[] = [];
    const explicitSkills = this.getAllResumeSkills(resume);

    // Search experience highlights for mentions of job skills
    jobSkills.forEach(jobSkill => {
      const jobSkillLower = jobSkill.toLowerCase();

      // Check if skill is already in explicit skills
      const isExplicit = explicitSkills.some(s => s.toLowerCase().includes(jobSkillLower));
      if (isExplicit) return;

      // Search in experience
      resume.experience.forEach(exp => {
        const expText = `${exp.description} ${exp.highlights?.join(' ') || ''}`.toLowerCase();
        if (expText.includes(jobSkillLower)) {
          hidden.push({
            skill: jobSkill,
            foundIn: 'experience',
            context: `${exp.role} at ${exp.company}`,
            relevance: 'high',
            recommendedPlacement: 'top_skills',
          });
        }
      });

      // Search in projects
      resume.projects?.forEach(project => {
        const projectText = `${project.name} ${project.description} ${project.technologies?.join(' ') || ''}`.toLowerCase();
        if (projectText.includes(jobSkillLower)) {
          hidden.push({
            skill: jobSkill,
            foundIn: 'projects',
            context: project.name,
            relevance: 'medium',
            recommendedPlacement: 'top_skills',
          });
        }
      });

      // Search in certifications
      resume.certifications?.forEach(cert => {
        const certText = `${cert.name} ${cert.issuer}`.toLowerCase();
        if (certText.includes(jobSkillLower)) {
          hidden.push({
            skill: jobSkill,
            foundIn: 'certifications',
            context: cert.name,
            relevance: 'high',
            recommendedPlacement: 'certifications',
          });
        }
      });
    });

    return hidden;
  }

  // ===========================================================================
  // RECOMMENDATIONS GENERATION
  // ===========================================================================

  /**
   * Generate actionable recommendations
   */
  private generateRecommendations(
    skillGaps: SkillGap[],
    hiddenSkills: HiddenSkill[],
    jobReqs: JobRequirements,
    resume: StructuredResume
  ): Enhancement[] {
    const recommendations: Enhancement[] = [];

    // Recommendation 1: Add hidden skills to top of skills section
    hiddenSkills.forEach(hidden => {
      if (hidden.relevance === 'high') {
        recommendations.push({
          type: 'add_skill',
          priority: 'high',
          skill: hidden.skill,
          reasoning: `You used ${hidden.skill} in your ${hidden.foundIn} (${hidden.context}), but it's not in your skills section. Adding it will improve your match score.`,
          impact: 15,
        });
      }
    });

    // Recommendation 2: Emphasize skills that match job requirements
    const resumeSkills = this.getAllResumeSkills(resume);
    jobReqs.requiredSkills.forEach(jobSkill => {
      const hasSkill = resumeSkills.some(s => s.toLowerCase().includes(jobSkill.toLowerCase()));
      if (hasSkill) {
        // Find where it's mentioned
        const exp = resume.experience.find(e =>
          e.highlights?.some(h => h.toLowerCase().includes(jobSkill.toLowerCase()))
        );

        if (exp) {
          recommendations.push({
            type: 'emphasize_skill',
            priority: 'high',
            skill: jobSkill,
            reasoning: `The job requires ${jobSkill}. You mentioned it at ${exp.company}, but consider highlighting it more prominently.`,
            impact: 10,
          });
        }
      }
    });

    // Recommendation 3: Address critical skill gaps with alternative skills
    skillGaps.filter(gap => gap.severity === 'critical').forEach(gap => {
      if (gap.alternativeMatch) {
        recommendations.push({
          type: 'reword_bullet',
          priority: 'critical',
          skill: gap.skill,
          currentText: gap.alternativeMatch,
          suggestedText: `Reframe your experience with ${gap.alternativeMatch} to highlight transferable skills to ${gap.skill}`,
          reasoning: `You have ${gap.alternativeMatch} which is related to ${gap.skill}. Emphasizing transferable skills can help bridge the gap.`,
          impact: 12,
        });
      } else if (gap.learningCurve === 'easy') {
        recommendations.push({
          type: 'add_certification',
          priority: 'medium',
          skill: gap.skill,
          reasoning: `${gap.skill} is a required skill with an easy learning curve. Consider getting certified or adding it to your learning goals.`,
          impact: 8,
        });
      }
    });

    // Sort by impact
    return recommendations.sort((a, b) => b.impact - a.impact);
  }

  // ===========================================================================
  // UTILITY METHODS
  // ===========================================================================

  /**
   * Calculate confidence level in the analysis
   */
  private calculateConfidenceLevel(jobPosting: JobPosting, resume: StructuredResume): number {
    let confidence = 100;

    // Reduce confidence if job description is too short
    if (jobPosting.description.length < 200) confidence -= 20;

    // Reduce confidence if requirements are missing
    if (!jobPosting.requirements) confidence -= 15;

    // Reduce confidence if resume has very little data
    if (resume.experience.length === 0) confidence -= 30;
    if (!resume.skills.technical || resume.skills.technical.length === 0) confidence -= 20;

    // Reduce confidence if skills array is empty
    if (jobPosting.skills.length === 0) confidence -= 25;

    return Math.max(confidence, 0);
  }

  /**
   * Find missing keywords between job and resume
   */
  private findMissingKeywords(jobKeywords: string[], resume: StructuredResume): string[] {
    const resumeText = JSON.stringify(resume).toLowerCase();
    return jobKeywords.filter(keyword => !resumeText.includes(keyword.toLowerCase()));
  }

  /**
   * Extract JSON from AI response (handles markdown code blocks)
   */
  private extractJSON(text: string): string {
    // Remove markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return jsonMatch[1].trim();
    }

    // Try to find JSON object directly
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return objectMatch[0];
    }

    return text.trim();
  }
}

// =============================================================================
// SINGLETON EXPORT
// =============================================================================

let jobMatchingService: JobMatchingService | null = null;

export function getJobMatchingService(): JobMatchingService {
  if (!jobMatchingService) {
    jobMatchingService = new JobMatchingService();
  }
  return jobMatchingService;
}

export default JobMatchingService;
