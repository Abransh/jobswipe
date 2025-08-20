/**
 * Enhanced Database Seeding Script
 * Creates comprehensive sample data for JobSwipe development and testing
 */

import { PrismaClient } from '../src/generated';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting enhanced database seeding...');

  // Create companies first
  const companies = await createTechCompanies();
  console.log(`✅ Created ${companies.length} tech companies`);

  // Create comprehensive job postings
  const jobPostings = await createComprehensiveJobPostings(companies);
  console.log(`✅ Created ${jobPostings.length} job postings`);

  // Create multiple demo users
  const users = await createDemoUsers();
  console.log(`✅ Created ${users.length} demo users`);

  // Create user interactions (swipes, saves, applications)
  await createUserInteractions(users, jobPostings);
  console.log(`✅ Created user interactions`);

  // Create resume templates
  const templates = await createResumeTemplates();
  console.log(`✅ Created ${templates.length} resume templates`);

  console.log('🎉 Enhanced database seeding completed!');
}

async function createTechCompanies() {
  const companies = [
    // Big Tech
    {
      name: 'Google',
      slug: 'google',
      description: 'Organizing the world\'s information and making it universally accessible',
      website: 'https://google.com',
      logo: 'https://logo.clearbit.com/google.com',
      industry: 'Technology',
      size: 'ENTERPRISE' as const,
      headquarters: 'Mountain View, CA',
      country: 'United States',
      foundedYear: 1998,
      employeeCount: 156000,
      isVerified: true,
      qualityScore: 98.5,
      linkedinUrl: 'https://linkedin.com/company/google',
      glassdoorUrl: 'https://glassdoor.com/Overview/Working-at-Google',
      keywords: ['search', 'cloud', 'ai', 'android', 'youtube'],
      tags: ['faang', 'big-tech', 'ai', 'cloud'],
    },
    {
      name: 'Microsoft',
      slug: 'microsoft', 
      description: 'Empowering every person and organization on the planet to achieve more',
      website: 'https://microsoft.com',
      logo: 'https://logo.clearbit.com/microsoft.com',
      industry: 'Technology',
      size: 'ENTERPRISE' as const,
      headquarters: 'Redmond, WA',
      country: 'United States',
      foundedYear: 1975,
      employeeCount: 221000,
      isVerified: true,
      qualityScore: 97.8,
      linkedinUrl: 'https://linkedin.com/company/microsoft',
      keywords: ['azure', 'office', 'windows', 'ai', 'cloud'],
      tags: ['faang', 'enterprise', 'cloud', 'productivity'],
    },
    {
      name: 'Meta',
      slug: 'meta',
      description: 'Connecting the world through social technology and virtual reality',
      website: 'https://meta.com',
      logo: 'https://logo.clearbit.com/meta.com',
      industry: 'Technology',
      size: 'ENTERPRISE' as const,
      headquarters: 'Menlo Park, CA',
      country: 'United States',
      foundedYear: 2004,
      employeeCount: 86687,
      isVerified: true,
      qualityScore: 95.2,
      linkedinUrl: 'https://linkedin.com/company/meta',
      keywords: ['social', 'vr', 'metaverse', 'ai', 'react'],
      tags: ['faang', 'social-media', 'vr', 'ar'],
    },
    // High-Growth Startups
    {
      name: 'Anthropic',
      slug: 'anthropic',
      description: 'AI safety company developing reliable, interpretable, and steerable AI systems',
      website: 'https://anthropic.com',
      logo: 'https://logo.clearbit.com/anthropic.com',
      industry: 'Artificial Intelligence',
      size: 'MEDIUM' as const,
      headquarters: 'San Francisco, CA',
      country: 'United States',
      foundedYear: 2021,
      employeeCount: 500,
      isVerified: true,
      qualityScore: 96.7,
      linkedinUrl: 'https://linkedin.com/company/anthropic',
      keywords: ['ai', 'safety', 'claude', 'research', 'llm'],
      tags: ['ai', 'safety', 'research', 'cutting-edge'],
    },
    {
      name: 'Stripe',
      slug: 'stripe',
      description: 'Financial infrastructure for the internet',
      website: 'https://stripe.com',
      logo: 'https://logo.clearbit.com/stripe.com',
      industry: 'Financial Technology',
      size: 'LARGE' as const,
      headquarters: 'San Francisco, CA',
      country: 'United States',
      foundedYear: 2010,
      employeeCount: 4000,
      isVerified: true,
      qualityScore: 94.8,
      linkedinUrl: 'https://linkedin.com/company/stripe',
      keywords: ['payments', 'fintech', 'api', 'developer-tools'],
      tags: ['fintech', 'payments', 'api', 'developer-friendly'],
    },
    {
      name: 'Figma',
      slug: 'figma',
      description: 'Collaborative design platform that brings teams together',
      website: 'https://figma.com',
      logo: 'https://logo.clearbit.com/figma.com',
      industry: 'Design Software',
      size: 'MEDIUM' as const,
      headquarters: 'San Francisco, CA',
      country: 'United States',
      foundedYear: 2012,
      employeeCount: 1000,
      isVerified: true,
      qualityScore: 93.5,
      linkedinUrl: 'https://linkedin.com/company/figma',
      keywords: ['design', 'collaboration', 'ui', 'prototyping'],
      tags: ['design', 'saas', 'collaboration', 'creative'],
    },
    // Scale-ups & Mid-size
    {
      name: 'Vercel',
      slug: 'vercel',
      description: 'Frontend cloud platform for modern web development',
      website: 'https://vercel.com',
      logo: 'https://logo.clearbit.com/vercel.com',
      industry: 'Developer Tools',
      size: 'MEDIUM' as const,
      headquarters: 'San Francisco, CA',
      country: 'United States',
      foundedYear: 2015,
      employeeCount: 400,
      isVerified: true,
      qualityScore: 92.1,
      linkedinUrl: 'https://linkedin.com/company/vercel',
      keywords: ['frontend', 'nextjs', 'deployment', 'edge', 'serverless'],
      tags: ['developer-tools', 'frontend', 'jamstack', 'edge-computing'],
    },
    {
      name: 'Linear',
      slug: 'linear',
      description: 'The issue tracking tool your team will actually love using',
      website: 'https://linear.app',
      logo: 'https://logo.clearbit.com/linear.app',
      industry: 'Productivity Software',
      size: 'SMALL' as const,
      headquarters: 'San Francisco, CA',
      country: 'United States',
      foundedYear: 2019,
      employeeCount: 50,
      isVerified: true,
      qualityScore: 91.3,
      linkedinUrl: 'https://linkedin.com/company/linear',
      keywords: ['productivity', 'project-management', 'issue-tracking'],
      tags: ['b2b', 'productivity', 'saas', 'dev-tools'],
    },
  ];

  return Promise.all(
    companies.map((company) =>
      prisma.company.upsert({
        where: { slug: company.slug },
        update: company,
        create: company,
      })
    )
  );
}

async function createComprehensiveJobPostings(companies: any[]) {
  const jobPostings = [
    // Google Jobs
    {
      title: 'Senior Software Engineer - AI/ML',
      description: `Join Google's AI team to build the next generation of intelligent systems that impact billions of users worldwide.

**What you'll do:**
- Design and implement large-scale machine learning systems
- Collaborate with researchers to productionize cutting-edge AI research
- Build infrastructure for training and serving ML models at Google scale
- Work on products like Search, Assistant, and Cloud AI

**What we're looking for:**
- Strong background in machine learning and deep learning
- Experience with large-scale distributed systems
- Proficiency in Python, C++, or Java
- PhD in Computer Science or equivalent experience`,
      requirements: 'PhD in Computer Science, Machine Learning, or related field. 5+ years experience in ML systems. Experience with TensorFlow or PyTorch.',
      benefits: 'Competitive salary, equity, comprehensive health benefits, free meals, 20% time for personal projects, world-class facilities',
      type: 'FULL_TIME' as const,
      level: 'SENIOR' as const,
      department: 'AI Research',
      category: 'TECHNOLOGY' as const,
      remote: false,
      remoteType: 'HYBRID' as const,
      location: 'Mountain View, CA',
      city: 'Mountain View',
      state: 'California',
      country: 'United States',
      salaryMin: 180000,
      salaryMax: 300000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      equity: '0.1-0.5%',
      experienceYears: 5,
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Distributed Systems', 'C++'],
      education: 'PhD in Computer Science or related field',
      languages: ['English'],
      company: {
        connect: { slug: 'google' }
      },
      source: 'COMPANY_WEBSITE' as const,
      sourceUrl: 'https://careers.google.com/jobs/senior-ai-engineer',
      applyUrl: 'https://careers.google.com/jobs/senior-ai-engineer/apply',
      keywords: ['ai', 'machine-learning', 'tensorflow', 'python', 'distributed-systems'],
      tags: ['ai', 'ml', 'research', 'scale'],
      qualityScore: 96.5,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: true,
      isUrgent: false,
      postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      viewCount: 1247,
      applicationCount: 23,
      rightSwipeCount: 156,
      leftSwipeCount: 34,
    },
    {
      title: 'Frontend Engineer - React',
      description: `Join Google's Chrome team to build web experiences that serve billions of users.

**What you'll do:**
- Build and maintain large-scale React applications
- Optimize web performance and accessibility
- Collaborate with UX designers and product managers
- Contribute to open-source web standards

**Requirements:**
- 3+ years of React development experience
- Strong JavaScript/TypeScript skills
- Experience with modern web technologies
- Understanding of web performance optimization`,
      requirements: 'Bachelor\'s degree in Computer Science. 3+ years React experience. Strong JavaScript/TypeScript skills.',
      benefits: 'Competitive compensation, stock options, health benefits, learning and development budget',
      type: 'FULL_TIME' as const,
      level: 'MID' as const,
      department: 'Engineering',
      category: 'TECHNOLOGY' as const,
      remote: true,
      remoteType: 'HYBRID' as const,
      location: 'San Francisco, CA (Remote OK)',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      salaryMin: 140000,
      salaryMax: 220000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      experienceYears: 3,
      skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Web Performance'],
      education: 'Bachelor\'s degree preferred',
      languages: ['English'],
      company: {
        connect: { slug: 'google' }
      },
      source: 'COMPANY_WEBSITE' as const,
      qualityScore: 94.2,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      viewCount: 892,
      applicationCount: 67,
      rightSwipeCount: 234,
      leftSwipeCount: 45,
    },
    // Anthropic Jobs
    {
      title: 'AI Safety Researcher',
      description: `Join Anthropic's mission to develop AI systems that are safe, beneficial, and understandable.

**What you'll do:**
- Conduct cutting-edge research in AI alignment and safety
- Develop techniques for making AI systems more interpretable
- Collaborate with top researchers in the field
- Publish findings in top-tier conferences and journals

**What we're looking for:**
- PhD in Machine Learning, Computer Science, or related field
- Strong research background in AI safety, interpretability, or alignment
- Experience with large language models
- Track record of publications in top venues`,
      requirements: 'PhD in ML/CS/related field. Research experience in AI safety. Publications in top venues. Experience with LLMs.',
      benefits: 'Top-tier compensation, equity, comprehensive benefits, research freedom, conference travel budget',
      type: 'FULL_TIME' as const,
      level: 'SENIOR' as const,
      department: 'Research',
      category: 'DATA_SCIENCE' as const,
      remote: true,
      remoteType: 'HYBRID' as const,
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      salaryMin: 200000,
      salaryMax: 350000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      equity: '0.5-2.0%',
      experienceYears: 3,
      skills: ['Machine Learning', 'AI Safety', 'Python', 'Research', 'Large Language Models'],
      education: 'PhD in Machine Learning or related field',
      languages: ['English'],
      company: {
        connect: { slug: 'anthropic' }
      },
      source: 'COMPANY_WEBSITE' as const,
      qualityScore: 97.8,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      isFeatured: true,
      isUrgent: true,
      postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      viewCount: 567,
      applicationCount: 12,
      rightSwipeCount: 89,
      leftSwipeCount: 8,
    },
    // Stripe Jobs
    {
      title: 'Full Stack Engineer - Payments',
      description: `Help build the economic infrastructure for the internet at Stripe.

**What you'll do:**
- Build and scale payment processing systems
- Work on APIs used by millions of businesses
- Develop internal tools and dashboards
- Collaborate across engineering, product, and design

**Requirements:**
- 4+ years of full-stack development experience
- Experience with distributed systems
- Strong problem-solving skills
- Interest in financial technology`,
      requirements: 'Bachelor\'s degree. 4+ years full-stack experience. Experience with distributed systems and APIs.',
      benefits: 'Competitive salary, meaningful equity, health/dental/vision, unlimited PTO, learning stipend',
      type: 'FULL_TIME' as const,
      level: 'MID' as const,
      department: 'Engineering',
      category: 'TECHNOLOGY' as const,
      remote: true,
      remoteType: 'REMOTE' as const,
      location: 'Remote (US/EU timezones)',
      salaryMin: 150000,
      salaryMax: 250000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      equity: '0.2-0.8%',
      experienceYears: 4,
      skills: ['Ruby', 'JavaScript', 'React', 'PostgreSQL', 'API Design', 'Distributed Systems'],
      education: 'Bachelor\'s degree preferred',
      languages: ['English'],
      company: {
        connect: { slug: 'stripe' }
      },
      source: 'COMPANY_WEBSITE' as const,
      qualityScore: 93.7,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      viewCount: 1156,
      applicationCount: 45,
      rightSwipeCount: 178,
      leftSwipeCount: 23,
    },
    // Figma Jobs
    {
      title: 'Senior Product Designer',
      description: `Shape the future of design at Figma, the collaborative design platform used by millions.

**What you'll do:**
- Design intuitive user experiences for design professionals
- Collaborate with engineering and product teams
- Conduct user research and usability testing
- Contribute to Figma's design system

**Requirements:**
- 5+ years of product design experience
- Strong portfolio demonstrating design thinking
- Experience with design systems
- Proficiency in Figma (obviously!)`,
      requirements: '5+ years product design experience. Strong portfolio. Experience with design systems. Figma proficiency.',
      benefits: 'Competitive compensation, equity, health benefits, design conference budget, flexible schedule',
      type: 'FULL_TIME' as const,
      level: 'SENIOR' as const,
      department: 'Design',
      category: 'DESIGN' as const,
      remote: true,
      remoteType: 'HYBRID' as const,
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      salaryMin: 160000,
      salaryMax: 240000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      equity: '0.3-1.0%',
      experienceYears: 5,
      skills: ['Product Design', 'Figma', 'Design Systems', 'User Research', 'Prototyping'],
      education: 'Bachelor\'s in Design or related field',
      languages: ['English'],
      company: {
        connect: { slug: 'figma' }
      },
      source: 'COMPANY_WEBSITE' as const,
      qualityScore: 95.1,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      viewCount: 743,
      applicationCount: 34,
      rightSwipeCount: 123,
      leftSwipeCount: 19,
    },
    // Entry Level / Junior Positions
    {
      title: 'Software Engineer - New Grad',
      description: `Join Microsoft as a new graduate and help empower every person and organization on the planet to achieve more.

**What you'll do:**
- Work on Azure, Office 365, or Windows products
- Learn from senior engineers and mentors
- Participate in Microsoft's comprehensive onboarding program
- Contribute to products used by billions of people

**Requirements:**
- Recent graduate with Bachelor's or Master's degree
- Strong programming fundamentals
- Internship experience preferred
- Passion for technology and learning`,
      requirements: 'Recent CS graduate. Strong programming fundamentals. Internship experience preferred.',
      benefits: 'Competitive starting salary, stock awards, comprehensive benefits, mentorship program, career development',
      type: 'FULL_TIME' as const,
      level: 'ENTRY' as const,
      department: 'Engineering',
      category: 'TECHNOLOGY' as const,
      remote: false,
      remoteType: 'HYBRID' as const,
      location: 'Redmond, WA',
      city: 'Redmond',
      state: 'Washington',
      country: 'United States',
      salaryMin: 120000,
      salaryMax: 160000,
      currency: 'USD',
      salaryType: 'ANNUAL' as const,
      equity: '0.05-0.2%',
      experienceYears: 0,
      skills: ['C#', 'Java', 'Python', 'JavaScript', 'Algorithms', 'Data Structures'],
      education: 'Bachelor\'s degree in Computer Science',
      languages: ['English'],
      company: {
        connect: { slug: 'microsoft' }
      },
      source: 'COMPANY_WEBSITE' as const,
      qualityScore: 91.4,
      isVerified: true,
      status: 'ACTIVE' as const,
      isActive: true,
      postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      viewCount: 2341,
      applicationCount: 156,
      rightSwipeCount: 567,
      leftSwipeCount: 89,
    },
  ];

  return Promise.all(
    jobPostings.map((job) =>
      prisma.jobPosting.create({
        data: job,
      })
    )
  );
}

async function createDemoUsers() {
  const users = [
    {
      email: 'demo@jobswipe.io',
      name: 'Demo User',
      profile: {
        firstName: 'Demo',
        lastName: 'User',
        currentTitle: 'Full Stack Engineer',
        location: 'San Francisco, CA',
        bio: 'Passionate full-stack engineer with 5+ years of experience building scalable web applications.',
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
        experienceLevel: '5+ years',
        linkedin: 'https://linkedin.com/in/demo-user',
        github: 'https://github.com/demo-user',
      },
    },
    {
      email: 'sarah.engineer@example.com',
      name: 'Sarah Chen',
      profile: {
        firstName: 'Sarah',
        lastName: 'Chen',
        currentTitle: 'Senior Frontend Engineer',
        location: 'New York, NY',
        bio: 'Frontend specialist with expertise in React, TypeScript, and modern web technologies.',
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Next.js', 'GraphQL'],
        experienceLevel: '6+ years',
        linkedin: 'https://linkedin.com/in/sarah-chen',
        github: 'https://github.com/sarah-chen',
      },
    },
    {
      email: 'alex.designer@example.com',
      name: 'Alex Rivera',
      profile: {
        firstName: 'Alex',
        lastName: 'Rivera',
        currentTitle: 'Product Designer',
        location: 'Austin, TX',
        bio: 'Product designer focused on creating intuitive and accessible user experiences.',
        skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        experienceLevel: '4+ years',
        linkedin: 'https://linkedin.com/in/alex-rivera',
        portfolio: 'https://alexrivera.design',
      },
    },
  ];

  const hashedPassword = await hash('demo123', 12);

  return Promise.all(
    users.map((user) =>
      prisma.user.create({
        data: {
          email: user.email,
          passwordHash: hashedPassword,
          name: user.name,
          emailVerified: new Date(),
          profile: {
            create: user.profile,
          },
          subscription: {
            create: {
              plan: 'PRO',
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        },
        include: {
          profile: true,
          subscription: true,
        },
      })
    )
  );
}

async function createUserInteractions(users: any[], jobs: any[]) {
  // Create some swipes
  const swipes = [];
  for (const user of users) {
    for (let i = 0; i < Math.min(jobs.length, 5); i++) {
      const job = jobs[i];
      swipes.push({
        userId: user.id,
        jobPostingId: job.id,
        direction: Math.random() > 0.3 ? 'RIGHT' : 'LEFT', // 70% right swipes
      });
    }
  }

  await Promise.all(
    swipes.map((swipe) =>
      prisma.userJobSwipe.create({
        data: swipe,
      })
    )
  );

  // Create some saved jobs
  const savedJobs = [];
  for (const user of users) {
    for (let i = 0; i < 3; i++) {
      const job = jobs[i];
      savedJobs.push({
        userId: user.id,
        jobPostingId: job.id,
        priority: i === 0 ? 'HIGH' : 'MEDIUM',
        notes: `Interested in this ${job.title} position`,
      });
    }
  }

  await Promise.all(
    savedJobs.map((savedJob) =>
      prisma.savedJob.create({
        data: savedJob,
      })
    )
  );
}

async function createResumeTemplates() {
  const templates = [
    {
      name: 'Tech Professional',
      description: 'Clean template optimized for software engineers and tech professionals',
      category: 'TECHNOLOGY',
      content: {
        layout: 'single-column',
        template: 'tech-professional-v1',
      },
      sections: {
        available: ['header', 'summary', 'experience', 'skills', 'education', 'projects'],
        required: ['header', 'experience'],
        order: ['header', 'summary', 'experience', 'skills', 'education', 'projects'],
      },
      styling: {
        colors: { primary: '#2563eb', secondary: '#64748b', accent: '#10b981' },
        fonts: { heading: 'Inter', body: 'Inter', mono: 'JetBrains Mono' },
        spacing: { section: 24, item: 12 },
      },
      isPremium: false,
      tags: ['tech', 'engineering', 'clean', 'ats-friendly'],
    },
    {
      name: 'Creative Portfolio',
      description: 'Visual template perfect for designers and creative professionals',
      category: 'CREATIVE',
      content: {
        layout: 'two-column-asymmetric',
        template: 'creative-portfolio-v1',
      },
      sections: {
        available: ['header', 'portfolio', 'experience', 'skills', 'education'],
        required: ['header', 'portfolio'],
        order: ['header', 'portfolio', 'experience', 'skills', 'education'],
      },
      styling: {
        colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#f59e0b' },
        fonts: { heading: 'Poppins', body: 'Inter' },
        spacing: { section: 32, item: 16 },
      },
      isPremium: true,
      tags: ['creative', 'design', 'portfolio', 'visual'],
    },
    {
      name: 'Executive',
      description: 'Professional template for senior leadership and executive positions',
      category: 'EXECUTIVE',
      content: {
        layout: 'single-column',
        template: 'executive-v1',
      },
      sections: {
        available: ['header', 'executive-summary', 'leadership-experience', 'achievements', 'education'],
        required: ['header', 'executive-summary'],
        order: ['header', 'executive-summary', 'leadership-experience', 'achievements', 'education'],
      },
      styling: {
        colors: { primary: '#1f2937', secondary: '#6b7280', accent: '#dc2626' },
        fonts: { heading: 'Playfair Display', body: 'Inter' },
        spacing: { section: 28, item: 14 },
      },
      isPremium: true,
      tags: ['executive', 'leadership', 'senior', 'professional'],
    },
    {
      name: 'Minimalist',
      description: 'Ultra-clean minimalist design for maximum readability',
      category: 'GENERAL',
      content: {
        layout: 'single-column',
        template: 'minimalist-v1',
      },
      sections: {
        available: ['header', 'summary', 'experience', 'education', 'skills'],
        required: ['header', 'experience'],
        order: ['header', 'summary', 'experience', 'education', 'skills'],
      },
      styling: {
        colors: { primary: '#000000', secondary: '#666666', accent: '#ffffff' },
        fonts: { heading: 'Helvetica', body: 'Helvetica' },
        spacing: { section: 20, item: 10 },
      },
      isPremium: false,
      tags: ['minimal', 'clean', 'ats-friendly', 'simple'],
    },
  ];

  return Promise.all(
    templates.map((template) =>
      prisma.resumeTemplate.create({
        data: template,
      })
    )
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during enhanced seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });