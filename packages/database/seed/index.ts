import { PrismaClient } from '../src/generated';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create resume templates
  const templates = await createResumeTemplates();
  console.log(`✅ Created ${templates.length} resume templates`);

  // Create sample companies
  const companies = await createSampleCompanies();
  console.log(`✅ Created ${companies.length} companies`);

  // Create sample job postings
  const jobPostings = await createSampleJobPostings(companies);
  console.log(`✅ Created ${jobPostings.length} job postings`);

  // Create demo user
  const demoUser = await createDemoUser();
  console.log(`✅ Created demo user: ${demoUser.email}`);

  console.log('🎉 Database seeding completed!');
}

async function createResumeTemplates() {
  const templates = [
    {
      name: 'Professional',
      description: 'Clean and professional template suitable for most industries',
      category: 'Professional',
      content: {
        layout: 'single-column',
        sections: ['header', 'summary', 'experience', 'education', 'skills'],
        colors: { primary: '#2563eb', secondary: '#64748b' },
        fonts: { heading: 'Inter', body: 'Inter' },
      },
      isPremium: false,
      tags: ['professional', 'clean', 'corporate'],
    },
    {
      name: 'Creative',
      description: 'Modern and creative template for design and creative roles',
      category: 'Creative',
      content: {
        layout: 'two-column',
        sections: ['header', 'portfolio', 'experience', 'skills', 'education'],
        colors: { primary: '#7c3aed', secondary: '#a855f7' },
        fonts: { heading: 'Poppins', body: 'Inter' },
      },
      isPremium: true,
      tags: ['creative', 'modern', 'design'],
    },
    {
      name: 'Technical',
      description: 'Developer-focused template with emphasis on technical skills',
      category: 'Technical',
      content: {
        layout: 'single-column',
        sections: ['header', 'summary', 'skills', 'experience', 'projects', 'education'],
        colors: { primary: '#059669', secondary: '#10b981' },
        fonts: { heading: 'JetBrains Mono', body: 'Inter' },
      },
      isPremium: false,
      tags: ['technical', 'developer', 'programming'],
    },
  ];

  // return Promise.all(
  //   templates.map((template) =>
  //     prisma.resumeTemplate.create({
  //       data: template,
  //     })
  //   )
  // );
}

async function createSampleCompanies() {
  const companies = [
    {
      name: 'TechCorp Inc.',
      slug: 'techcorp',
      description: 'Leading technology company specializing in cloud solutions',
      website: 'https://techcorp.com',
      industry: 'Technology',
      size: '1000-5000',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/company/techcorp',
    },
    {
      name: 'StartupXYZ',
      slug: 'startupxyz',
      description: 'Fast-growing fintech startup revolutionizing payments',
      website: 'https://startupxyz.com',
      industry: 'Financial Technology',
      size: '50-200',
      location: 'New York, NY',
      linkedinUrl: 'https://linkedin.com/company/startupxyz',
    },
    {
      name: 'Global Consulting',
      slug: 'global-consulting',
      description: 'International consulting firm serving Fortune 500 companies',
      website: 'https://globalconsulting.com',
      industry: 'Consulting',
      size: '10000+',
      location: 'Chicago, IL',
      linkedinUrl: 'https://linkedin.com/company/global-consulting',
    },
    {
      name: 'Design Studio Pro',
      slug: 'design-studio-pro',
      description: 'Creative agency specializing in brand design and digital experiences',
      website: 'https://designstudiopro.com',
      industry: 'Design & Creative',
      size: '10-50',
      location: 'Austin, TX',
      linkedinUrl: 'https://linkedin.com/company/design-studio-pro',
    },
  ];

  return Promise.all(
    companies.map((company) =>
      prisma.company.create({
        data: company,
      })
    )
  );
}

async function createSampleJobPostings(companies: any[]) {
  const jobPostings = [
    {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for a senior full stack developer to join our growing team...',
      requirements: 'Bachelor\'s degree in Computer Science, 5+ years of experience with React and Node.js',
      benefits: 'Competitive salary, health insurance, 401k matching, remote work options',
      type: 'FULL_TIME',
      level: 'SENIOR',
      department: 'Engineering',
      remote: true,
      location: 'San Francisco, CA',
      salaryMin: 120000,
      salaryMax: 180000,
      currency: 'USD',
      companyId: companies[0].id,
      isActive: true,
      postedAt: new Date(),
    },
    {
      title: 'Product Designer',
      description: 'Join our design team to create beautiful and intuitive user experiences...',
      requirements: 'Bachelor\'s degree in Design, 3+ years of experience with Figma and prototyping',
      benefits: 'Equity package, flexible hours, professional development budget',
      type: 'FULL_TIME',
      level: 'MID',
      department: 'Design',
      remote: false,
      location: 'New York, NY',
      salaryMin: 90000,
      salaryMax: 130000,
      currency: 'USD',
      companyId: companies[1].id,
      isActive: true,
      postedAt: new Date(),
    },
    {
      title: 'Management Consultant',
      description: 'Work with top-tier clients to solve complex business challenges...',
      requirements: 'MBA preferred, 2+ years of consulting experience, excellent analytical skills',
      benefits: 'Travel opportunities, performance bonuses, extensive training programs',
      type: 'FULL_TIME',
      level: 'MID',
      department: 'Consulting',
      remote: false,
      location: 'Chicago, IL',
      salaryMin: 100000,
      salaryMax: 150000,
      currency: 'USD',
      companyId: companies[2].id,
      isActive: true,
      postedAt: new Date(),
    },
    {
      title: 'Junior Frontend Developer',
      description: 'Great opportunity for a junior developer to grow in a supportive environment...',
      requirements: '1-2 years of experience with JavaScript, HTML, CSS. Knowledge of React is a plus',
      benefits: 'Mentorship program, learning budget, flexible schedule',
      type: 'FULL_TIME',
      level: 'JUNIOR',
      department: 'Engineering',
      remote: true,
      location: 'Austin, TX',
      salaryMin: 60000,
      salaryMax: 80000,
      currency: 'USD',
      companyId: companies[3].id,
      isActive: true,
      postedAt: new Date(),
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

async function createDemoUser() {
  const passwordHash = await hash('demo123', 12);

  return prisma.user.create({
    data: {
      email: 'demo@jobswipe.io',
      passwordHash,
      name: 'Demo User',
      emailVerified: new Date(),
      profile: {
        create: {
          firstName: 'Demo',
          lastName: 'User',
          title: 'Software Engineer',
          location: 'San Francisco, CA',
          bio: 'Experienced software engineer passionate about building great products.',
          skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PostgreSQL'],
          experience: '5+ years',
          linkedin: 'https://linkedin.com/in/demouser',
          github: 'https://github.com/demouser',
        },
      },
      subscription: {
        create: {
          plan: 'PRO',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        },
      },
    },
    include: {
      profile: true,
      subscription: true,
    },
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });