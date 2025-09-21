// 'use client';

// import React, { useState } from 'react';
// import { JobCard, JobCardSkeleton } from '@/components/jobs/JobCard';
// import type { JobData } from '@/components/jobs/types/job';

// export default function JobCardDemoPage() {
//   const [loading, setLoading] = useState(false);
//   const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());

//   // Mock job data for demonstration
//   const mockJobs: JobData[] = [
//     {
//       id: '1',
//       title: 'Senior Frontend Engineer',
//       company: {
//         id: 'company-1',
//         name: 'TechCorp',
//         logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=100&h=100&fit=crop&crop=center',
//         industry: 'Technology',
//         size: 'MEDIUM',
//         headquarters: 'San Francisco, CA',
//         isVerified: true
//       },
//       description: 'Join our team building next-generation web applications using React, TypeScript, and modern tools. We\'re looking for someone passionate about creating exceptional user experiences and writing clean, maintainable code.',
//       location: 'San Francisco, CA',
//       salaryMin: 120000,
//       salaryMax: 180000,
//       currency: 'USD',
//       salaryType: 'ANNUAL',
//       equity: true,
//       remote: true,
//       remoteType: 'HYBRID',
//       type: 'FULL_TIME',
//       level: 'SENIOR',
//       skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
//       benefits: 'Health insurance, 401k matching, flexible PTO, remote work stipend, professional development budget',
//       postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
//       applicationCount: 23,
//       viewCount: 156,
//       isUrgent: false,
//       isFeatured: true,
//       isVerified: true
//     },
//     {
//       id: '2',
//       title: 'Product Designer',
//       company: {
//         id: 'company-2',
//         name: 'DesignCo',
//         logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop&crop=center',
//         industry: 'Design',
//         size: 'SMALL',
//         headquarters: 'New York, NY',
//         isVerified: false
//       },
//       description: 'We\'re seeking a creative Product Designer to help shape the future of our digital products. You\'ll work closely with our product and engineering teams to create intuitive, user-centered designs.',
//       location: 'New York, NY',
//       salaryMin: 90000,
//       salaryMax: 130000,
//       currency: 'USD',
//       salaryType: 'ANNUAL',
//       remote: true,
//       remoteType: 'REMOTE',
//       type: 'FULL_TIME',
//       level: 'MID',
//       skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
//       benefits: 'Health insurance, flexible schedule, unlimited PTO',
//       postedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
//       applicationCount: 8,
//       viewCount: 45,
//       isUrgent: true,
//       isFeatured: false,
//       isVerified: false
//     },
//     {
//       id: '3',
//       title: 'Full Stack Developer',
//       company: {
//         id: 'company-3',
//         name: 'StartupXYZ',
//         logo: null, // Will show initials fallback
//         industry: 'Fintech',
//         size: 'STARTUP',
//         headquarters: 'Austin, TX',
//         isVerified: true
//       },
//       description: 'Join our fast-growing fintech startup! We\'re building revolutionary financial tools and need a versatile full-stack developer who can work across our entire technology stack.',
//       location: 'Austin, TX',
//       salaryMin: 80000,
//       salaryMax: 120000,
//       currency: 'USD',
//       salaryType: 'ANNUAL',
//       equity: true,
//       remote: false,
//       remoteType: 'ONSITE',
//       type: 'FULL_TIME',
//       level: 'MID',
//       skills: ['Python', 'Django', 'PostgreSQL', 'React', 'Docker'],
//       benefits: 'Equity package, health insurance, catered lunches, gym membership',
//       postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
//       applicationCount: 42,
//       viewCount: 203,
//       isUrgent: false,
//       isFeatured: false,
//       isVerified: true
//     }
//   ];

//   // Mock match scores
//   const matchScores = [87, 92, 78];

//   // Event handlers
//   const handleSwipeLeft = (jobId: string) => {
//     console.log('👈 Swiped left (passed) on job:', jobId);
//     // In real app, this would update the user's preferences
//   };

//   const handleSwipeRight = (jobId: string) => {
//     console.log('👉 Swiped right (applied) to job:', jobId);
//     // In real app, this would start the application process
//   };

//   const handleSave = (jobId: string) => {
//     console.log('💾 Saved job:', jobId);
//     setSavedJobs(prev => {
//       const newSet = new Set(prev);
//       if (newSet.has(jobId)) {
//         newSet.delete(jobId);
//       } else {
//         newSet.add(jobId);
//       }
//       return newSet;
//     });
//   };

//   const handleShare = (jobId: string) => {
//     console.log('🔗 Shared job:', jobId);
//     // In real app, this would open share dialog
//     if (navigator.share) {
//       navigator.share({
//         title: 'Check out this job opportunity',
//         url: `https://jobswipe.com/jobs/${jobId}`
//       });
//     } else {
//       navigator.clipboard.writeText(`https://jobswipe.com/jobs/${jobId}`);
//       alert('Job link copied to clipboard!');
//     }
//   };

//   const handleMoreInfo = (jobId: string) => {
//     console.log('ℹ️ More info for job:', jobId);
//     // In real app, this would navigate to job details page
//     alert(`This would open detailed view for job ${jobId}`);
//   };

//   const toggleLoading = () => {
//     setLoading(!loading);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-2xl mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">
//             JobCard Component Demo
//           </h1>
//           <p className="text-gray-600 mb-4">
//             Experience the sophisticated JobCard component with psychological UX patterns
//           </p>
          
//           {/* Controls */}
//           <div className="flex justify-center space-x-4 mb-8">
//             <button
//               onClick={toggleLoading}
//               className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
//             >
//               {loading ? 'Show Cards' : 'Show Loading'}
//             </button>
//           </div>
//         </div>

//         {/* Demo Cards */}
//         <div className="space-y-8">
//           {loading ? (
//             // Loading state demonstration
//             <div className="space-y-6">
//               <JobCardSkeleton count={3} />
//             </div>
//           ) : (
//             // Actual job cards
//             mockJobs.map((job, index) => (
//               <div key={job.id} className="transform transition-all hover:scale-[1.02]">
//                 <JobCard
//                   job={job}
//                   matchScore={matchScores[index]}
//                   onSwipeLeft={handleSwipeLeft}
//                   onSwipeRight={handleSwipeRight}
//                   onSave={handleSave}
//                   onShare={handleShare}
//                   onMoreInfo={handleMoreInfo}
//                 />
//               </div>
//             ))
//           )}
//         </div>

//         {/* Instructions */}
//         <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//           <h2 className="text-lg font-semibold text-gray-900 mb-4">
//             🎯 How to Test the JobCard
//           </h2>
          
//           <div className="space-y-3 text-sm text-gray-600">
//             <div className="flex items-start space-x-2">
//               <span className="text-green-500">✓</span>
//               <span><strong>Hover:</strong> Watch micro-animations and see action buttons appear</span>
//             </div>
//             <div className="flex items-start space-x-2">
//               <span className="text-green-500">✓</span>
//               <span><strong>Click Actions:</strong> Try the save, share, and info buttons</span>
//             </div>
//             <div className="flex items-start space-x-2">
//               <span className="text-green-500">✓</span>
//               <span><strong>Keyboard:</strong> Tab to focus, Enter to apply, Escape to pass</span>
//             </div>
//             <div className="flex items-start space-x-2">
//               <span className="text-green-500">✓</span>
//               <span><strong>Responsive:</strong> Resize window to see mobile optimizations</span>
//             </div>
//             <div className="flex items-start space-x-2">
//               <span className="text-green-500">✓</span>
//               <span><strong>Loading:</strong> Toggle loading state to see skeleton animations</span>
//             </div>
//           </div>

//           <div className="mt-4 p-3 bg-gray-50 rounded-md">
//             <p className="text-xs text-gray-500">
//               <strong>Console:</strong> Open browser dev tools to see interaction logs and analytics
//             </p>
//           </div>
//         </div>

//         {/* Features Showcase */}
//         <div className="mt-8 grid md:grid-cols-2 gap-6">
//           <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3">🧠 Psychology Features</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Fitts' Law: Optimal touch targets</li>
//               <li>• Miller's Law: Information chunking</li>
//               <li>• Von Restorff: Badge highlighting</li>
//               <li>• Variable rewards: Micro-animations</li>
//             </ul>
//           </div>

//           <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
//             <h3 className="font-semibold text-gray-900 mb-3">⚡ Performance</h3>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• 60fps smooth animations</li>
//               <li>• Memoized components</li>
//               <li>• Progressive image loading</li>
//               <li>• Swipe gesture ready</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }