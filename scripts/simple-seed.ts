#!/usr/bin/env tsx
/**
 * Simple Job Seeder without external dependencies
 * Creates realistic Italian job data for development
 */

import { PrismaClient } from '@jobswipe/database';

const db = new PrismaClient();

const ITALIAN_COMPANIES = [
  { name: 'Bending Spoons', industry: 'Mobile Apps', size: 'MEDIUM', city: 'Milano' },
  { name: 'Facile.it', industry: 'Fintech', size: 'LARGE', city: 'Milano' },
  { name: 'Musixmatch', industry: 'Music Tech', size: 'MEDIUM', city: 'Bologna' },
  { name: 'Prima Assicurazioni', industry: 'Insurance Tech', size: 'MEDIUM', city: 'Milano' },
  { name: 'Satispay', industry: 'Payments', size: 'MEDIUM', city: 'Milano' },
  { name: 'Engineering', industry: 'IT Services', size: 'ENTERPRISE', city: 'Roma' },
  { name: 'Reply', industry: 'Digital Consulting', size: 'LARGE', city: 'Torino' }
];

const JOB_TITLES = [
  'Full Stack Developer', 'Frontend Developer', 'Backend Developer',
  'Software Engineer', 'Senior Software Engineer', 'Lead Developer',
  'DevOps Engineer', 'Product Manager', 'UI/UX Designer',
  'React Developer', 'Node.js Developer', 'Data Scientist'
];

const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js', 'Python',
  'Java', 'Docker', 'AWS', 'PostgreSQL', 'MongoDB', 'GraphQL'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createCompanies() {
  console.log('🏢 Creating companies...');
  
  for (const companyData of ITALIAN_COMPANIES) {
    await db.company.upsert({
      where: { slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: {
        name: companyData.name,
        slug: companyData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: `${companyData.name} is a leading ${companyData.industry} company based in Italy.`,
        industry: companyData.industry,
        size: companyData.size as any,
        headquarters: `${companyData.city}, Italy`,
        country: 'Italy',
        foundedYear: getRandomInt(2000, 2020),
        employeeCount: getRandomInt(50, 5000),
        isVerified: true,
        qualityScore: 8.0 + Math.random() * 1.5
      }
    });
  }
  
  console.log(`✅ Created ${ITALIAN_COMPANIES.length} companies`);
}

async function createJobs() {
  console.log('💼 Creating job postings...');
  
  const companies = await db.company.findMany();
  let jobsCreated = 0;
  
  for (const company of companies) {
    const jobCount = getRandomInt(3, 6);
    
    for (let i = 0; i < jobCount; i++) {
      const title = getRandomElement(JOB_TITLES);
      const level = getRandomElement(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']);
      const remoteType = getRandomElement(['ONSITE', 'HYBRID', 'REMOTE', 'FLEXIBLE']);
      const skills = getRandomElements(TECH_SKILLS, getRandomInt(3, 6));
      
      const salaryMin = getRandomInt(25000, 60000);
      const salaryMax = salaryMin + getRandomInt(10000, 40000);
      
      await db.jobPosting.create({
        data: {
          title: `${title}`,
          description: `We are looking for a talented ${title} to join our team at ${company.name}. 

Responsibilities:
• Develop and maintain high-quality software applications
• Collaborate with cross-functional teams
• Write clean, maintainable code
• Participate in code reviews

Requirements:
• Strong experience with ${skills.slice(0, 2).join(' and ')}
• Excellent problem-solving skills
• Bachelor's degree or equivalent experience

We offer competitive salary, flexible working, and growth opportunities.`,
          
          requirements: `• ${getRandomInt(1, 5)} years of professional experience
• Proficiency in ${skills.slice(0, 2).join(' and ')}
• Experience with ${skills.slice(2, 4).join(' and ')}
• Strong communication skills`,
          
          benefits: '• Competitive salary\n• Flexible working hours\n• Health insurance\n• Professional development budget',
          
          type: getRandomElement(['FULL_TIME', 'PART_TIME', 'CONTRACT']) as any,
          level: level as any,
          category: 'ENGINEERING' as any,
          
          remote: remoteType === 'REMOTE',
          remoteType: remoteType as any,
          location: `${company.headquarters}`,
          city: company.headquarters?.split(',')[0],
          state: 'Italy',
          country: 'Italy',
          
          salaryMin,
          salaryMax,
          currency: 'EUR',
          salaryType: 'ANNUAL' as any,
          
          experienceYears: level === 'ENTRY' ? 0 : 
                          level === 'JUNIOR' ? 2 :
                          level === 'MID' ? 4 : 6,
          skills,
          education: 'Bachelor\'s degree in Computer Science or related field',
          languages: ['Italian', 'English'],
          
          companyId: company.id,
          
          source: 'MANUAL' as any,
          applyUrl: `https://${company.slug}.com/careers`,
          
          qualityScore: 7.0 + Math.random() * 2.5,
          isVerified: Math.random() > 0.3,
          
          status: 'ACTIVE' as any,
          isActive: true,
          isFeatured: Math.random() > 0.9,
          isUrgent: Math.random() > 0.95,
          
          postedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
          
          viewCount: getRandomInt(10, 300),
          applicationCount: getRandomInt(0, 25),
          rightSwipeCount: getRandomInt(5, 50),
          leftSwipeCount: getRandomInt(2, 30)
        }
      });
      
      jobsCreated++;
    }
  }
  
  console.log(`✅ Created ${jobsCreated} job postings`);
}

async function createTestUser() {
  console.log('👤 Creating test user...');
  
  const testUser = await db.user.upsert({
    where: { email: 'test@jobswipe.dev' },
    update: {},
    create: {
      email: 'test@jobswipe.dev',
      passwordHash: '$2b$12$LQv3c1yqBwfHXXCKRHjHCOZhDUy1tK8WOjKgxF8KxgxqF2qY8tJAC',
      name: 'Test User',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'User',
          city: 'Milano',
          country: 'Italy'
        }
      }
    }
  });
  
  console.log(`✅ Created test user: ${testUser.email}`);
}

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    await createCompanies();
    await createJobs();
    await createTestUser();
    
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
  } finally {
    await db.$disconnect();
  }
}

main().catch(console.error);