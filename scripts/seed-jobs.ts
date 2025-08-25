#!/usr/bin/env tsx
/**
 * JobSwipe Database Seeder
 * Creates realistic Italian job market data for development and testing
 */

import { PrismaClient } from '@jobswipe/database';
import { faker } from '@faker-js/faker';

const db = new PrismaClient();

// Italian cities and companies
const ITALIAN_CITIES = [
  { city: 'Milano', state: 'Lombardy', country: 'Italy' },
  { city: 'Roma', state: 'Lazio', country: 'Italy' },
  { city: 'Torino', state: 'Piedmont', country: 'Italy' },
  { city: 'Napoli', state: 'Campania', country: 'Italy' },
  { city: 'Bologna', state: 'Emilia-Romagna', country: 'Italy' },
  { city: 'Firenze', state: 'Tuscany', country: 'Italy' },
  { city: 'Venezia', state: 'Veneto', country: 'Italy' },
  { city: 'Genova', state: 'Liguria', country: 'Italy' },
  { city: 'Palermo', state: 'Sicily', country: 'Italy' },
  { city: 'Bari', state: 'Puglia', country: 'Italy' }
];

const ITALIAN_TECH_COMPANIES = [
  { name: 'Bending Spoons', industry: 'Mobile Apps', size: 'MEDIUM', website: 'https://bendingspoons.com' },
  { name: 'Facile.it', industry: 'Fintech', size: 'LARGE', website: 'https://facile.it' },
  { name: 'Yoox Net-A-Porter', industry: 'E-commerce', size: 'LARGE', website: 'https://yoox.com' },
  { name: 'Musixmatch', industry: 'Music Tech', size: 'MEDIUM', website: 'https://musixmatch.com' },
  { name: 'Prima Assicurazioni', industry: 'Insurance Tech', size: 'MEDIUM', website: 'https://prima.it' },
  { name: 'Satispay', industry: 'Payments', size: 'MEDIUM', website: 'https://satispay.com' },
  { name: 'Casavo', industry: 'PropTech', size: 'MEDIUM', website: 'https://casavo.com' },
  { name: 'Scalapay', industry: 'Fintech', size: 'MEDIUM', website: 'https://scalapay.com' },
  { name: 'Talent Garden', industry: 'EdTech', size: 'MEDIUM', website: 'https://talentgarden.org' },
  { name: 'Subito.it', industry: 'Marketplace', size: 'LARGE', website: 'https://subito.it' },
  { name: 'Engineering', industry: 'IT Services', size: 'ENTERPRISE', website: 'https://eng.it' },
  { name: 'Reply', industry: 'Digital Consulting', size: 'LARGE', website: 'https://reply.com' },
  { name: 'TXT e-solutions', industry: 'Software', size: 'MEDIUM', website: 'https://txt.group' },
  { name: 'TeamSystem', industry: 'Enterprise Software', size: 'LARGE', website: 'https://teamsystem.com' }
];

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'GraphQL', 'REST API', 'Microservices', 'DevOps',
  'Machine Learning', 'AI', 'Data Science', 'Blockchain'
];

const JOB_TITLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Software Engineer', 'Senior Software Engineer', 'Lead Developer',
  'DevOps Engineer', 'Cloud Engineer', 'Data Engineer',
  'Product Manager', 'UI/UX Designer', 'QA Engineer',
  'Mobile Developer', 'React Developer', 'Node.js Developer',
  'Python Developer', 'Java Developer', 'Data Scientist',
  'Machine Learning Engineer', 'Security Engineer', 'Site Reliability Engineer'
];

function getRandomSalary(level: string): { min: number; max: number } {
  switch (level) {
    case 'ENTRY':
      return { min: 25000, max: 35000 };
    case 'JUNIOR':
      return { min: 30000, max: 45000 };
    case 'MID':
      return { min: 40000, max: 65000 };
    case 'SENIOR':
      return { min: 55000, max: 85000 };
    case 'LEAD':
      return { min: 70000, max: 100000 };
    default:
      return { min: 35000, max: 60000 };
  }
}

function generateJobDescription(title: string, company: string, skills: string[]): string {
  return `We are looking for a talented ${title} to join our team at ${company}. 

Responsibilities:
• Develop and maintain high-quality software applications
• Collaborate with cross-functional teams to deliver innovative solutions
• Write clean, maintainable, and well-documented code
• Participate in code reviews and technical discussions
• Stay updated with latest technology trends and best practices

Requirements:
• Strong experience with ${skills.slice(0, 3).join(', ')}
• Excellent problem-solving and communication skills
• Experience with agile development methodologies
• Bachelor's degree in Computer Science or related field (or equivalent experience)

Nice to have:
• Experience with ${skills.slice(3, 5).join(', ')}
• Knowledge of cloud platforms and DevOps practices
• Open source contributions

We offer competitive salary, flexible working arrangements, and opportunities for professional growth.`;
}

function generateJobRequirements(skills: string[], level: string): string {
  const experience = level === 'ENTRY' ? '0-2 years' : 
                    level === 'JUNIOR' ? '1-3 years' :
                    level === 'MID' ? '3-5 years' :
                    level === 'SENIOR' ? '5+ years' :
                    level === 'LEAD' ? '7+ years' : '2+ years';

  return `• ${experience} of professional experience
• Proficiency in ${skills.slice(0, 2).join(' and ')}
• Experience with ${skills.slice(2, 4).join(' and ')}
• Strong understanding of software development principles
• Excellent communication skills in Italian and English`;
}

function generateJobBenefits(): string {
  const benefits = [
    'Competitive salary and performance bonuses',
    'Flexible working hours and remote work options',
    'Health insurance and wellness programs',
    'Professional development budget',
    'Modern office with latest equipment',
    'Free lunch and coffee',
    'Team building activities and events',
    'Stock options (for eligible positions)',
    'Parental leave and family support',
    'Learning and conference budget'
  ];
  
  return faker.helpers.arrayElements(benefits, { min: 4, max: 7 }).map(b => `• ${b}`).join('\n');
}

async function createCompanies() {
  console.log('🏢 Creating companies...');
  
  for (const companyData of ITALIAN_TECH_COMPANIES) {
    const location = faker.helpers.arrayElement(ITALIAN_CITIES);
    
    await db.company.upsert({
      where: { slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        name: companyData.name,
        slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `${companyData.name} is a leading ${companyData.industry} company based in Italy, focused on delivering innovative technology solutions.`,
        website: companyData.website,
        logo: `https://logo.clearbit.com/${new URL(companyData.website).hostname}`,
        industry: companyData.industry,
        size: companyData.size as any,
        headquarters: `${location.city}, ${location.country}`,
        country: location.country,
        foundedYear: faker.date.between({ from: '2000-01-01', to: '2020-12-31' }).getFullYear(),
        employeeCount: companyData.size === 'STARTUP' ? faker.number.int({ min: 10, max: 50 }) :
                      companyData.size === 'SMALL' ? faker.number.int({ min: 51, max: 200 }) :
                      companyData.size === 'MEDIUM' ? faker.number.int({ min: 201, max: 1000 }) :
                      companyData.size === 'LARGE' ? faker.number.int({ min: 1001, max: 5000 }) :
                      faker.number.int({ min: 5001, max: 50000 }),
        isVerified: true,
        qualityScore: faker.number.float({ min: 7.5, max: 9.8 })
      }
    });
  }
  
  console.log(`✅ Created ${ITALIAN_TECH_COMPANIES.length} companies`);
}

async function createJobs() {
  console.log('💼 Creating job postings...');
  
  const companies = await db.company.findMany();
  let jobsCreated = 0;
  
  // Create 3-8 jobs per company
  for (const company of companies) {
    const jobCount = faker.number.int({ min: 3, max: 8 });
    
    for (let i = 0; i < jobCount; i++) {
      const location = faker.helpers.arrayElement(ITALIAN_CITIES);
      const title = faker.helpers.arrayElement(JOB_TITLES);
      const level = faker.helpers.arrayElement(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']);
      const type = faker.helpers.arrayElement(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE']);
      const remoteType = faker.helpers.weightedArrayElement([
        { weight: 3, value: 'ONSITE' },
        { weight: 4, value: 'HYBRID' },
        { weight: 2, value: 'REMOTE' },
        { weight: 1, value: 'FLEXIBLE' }
      ]);
      
      const jobSkills = faker.helpers.arrayElements(TECH_SKILLS, { min: 4, max: 8 });
      const salary = getRandomSalary(level);
      const category = faker.helpers.arrayElement(['ENGINEERING', 'DESIGN', 'PRODUCT', 'DATA', 'DEVOPS', 'SECURITY']);
      
      await db.jobPosting.create({
        data: {
          title: `${title} - ${company.name}`,
          description: generateJobDescription(title, company.name, jobSkills),
          requirements: generateJobRequirements(jobSkills, level),
          benefits: generateJobBenefits(),
          
          // Job Classification
          type: type as any,
          level: level as any,
          department: faker.helpers.arrayElement(['Engineering', 'Product', 'Design', 'Data', 'DevOps']),
          category: category as any,
          
          // Work Arrangement
          remote: remoteType === 'REMOTE',
          remoteType: remoteType as any,
          location: `${location.city}, ${location.state}, ${location.country}`,
          timeZone: 'Europe/Rome',
          
          // Location Details
          city: location.city,
          state: location.state,
          country: location.country,
          
          // Compensation
          salaryMin: salary.min,
          salaryMax: salary.max,
          currency: 'EUR',
          salaryType: 'ANNUAL',
          equity: faker.helpers.maybe(() => '0.1% - 0.5%', { probability: 0.3 }),
          bonus: faker.helpers.maybe(() => '5% - 15% annual bonus', { probability: 0.4 }),
          
          // Job Requirements
          experienceYears: level === 'ENTRY' ? 0 : 
                          level === 'JUNIOR' ? 2 :
                          level === 'MID' ? 4 :
                          level === 'SENIOR' ? 6 : 8,
          skills: jobSkills,
          education: faker.helpers.arrayElement([
            'Bachelor\'s degree in Computer Science or related field',
            'Master\'s degree preferred',
            'Degree or equivalent practical experience',
            'Technical degree or equivalent experience'
          ]),
          languages: ['Italian', 'English'],
          
          // Company Context
          companyId: company.id,
          
          // External Integration
          sourceUrl: faker.internet.url(),
          applyUrl: `${company.website}/careers/${faker.string.alphanumeric(8)}`,
          
          // Quality & Verification
          qualityScore: faker.number.float({ min: 6.0, max: 9.5 }),
          isVerified: faker.datatype.boolean({ probability: 0.7 }),
          
          // Status & Lifecycle
          status: 'ACTIVE',
          isActive: true,
          isFeatured: faker.datatype.boolean({ probability: 0.1 }),
          isUrgent: faker.datatype.boolean({ probability: 0.05 }),
          
          // Dates
          postedAt: faker.date.recent({ days: 30 }),
          expiresAt: faker.date.future({ days: 60 }),
          
          // Analytics (simulate some activity)
          viewCount: faker.number.int({ min: 10, max: 500 }),
          applicationCount: faker.number.int({ min: 0, max: 50 }),
          rightSwipeCount: faker.number.int({ min: 5, max: 100 }),
          leftSwipeCount: faker.number.int({ min: 2, max: 80 }),
        }
      });
      
      jobsCreated++;
    }
  }
  
  console.log(`✅ Created ${jobsCreated} job postings`);
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  // Create a test user for development
  const testUser = await db.user.upsert({
    where: { email: 'test@jobswipe.dev' },
    update: {},
    create: {
      email: 'test@jobswipe.dev',
      passwordHash: '$2b$12$LQv3c1yqBwfHXXCKRHjHCOZhDUy1tK8WOjKgxF8KxgxqF2qY8tJAC', // 'password123'
      name: 'Test User',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'User',
          timezone: 'Europe/Rome'
        }
      }
    }
  });
  
  console.log(`✅ Created test user: ${testUser.email}`);
  return testUser;
}

async function createSampleData() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await createCompanies();
    await createJobs();
    await createTestUser();
    
    // Get final counts
    const stats = await Promise.all([
      db.company.count(),
      db.jobPosting.count(),
      db.user.count()
    ]);
    
    console.log('\n📊 Seeding completed successfully!');
    console.log(`   Companies: ${stats[0]}`);
    console.log(`   Jobs: ${stats[1]}`);
    console.log(`   Users: ${stats[2]}`);
    console.log('\n🎉 Database is ready for development!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

// Run the seeder
if (require.main === module) {
  createSampleData()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}

export { createSampleData };