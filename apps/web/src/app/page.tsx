import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your job application dashboard',
};

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold tracking-tight gradient-text sm:text-6xl">
          Welcome to JobSwipe
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl">
          Automate your job applications with AI-powered tools. Build better resumes, 
          track applications, and land your dream job faster.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button className="rounded-md gradient-bg px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Get Started
          </button>
          <button className="text-sm font-semibold leading-6 text-foreground hover:text-primary">
            Learn more <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-effect rounded-lg p-6">
          <div className="w-12 h-12 bg-jobswipe-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-jobswipe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">AI-Powered Applications</h3>
          <p className="text-muted-foreground text-sm">
            Automatically customize and submit job applications using advanced AI technology.
          </p>
        </div>
        
        <div className="glass-effect rounded-lg p-6">
          <div className="w-12 h-12 bg-jobswipe-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-jobswipe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Smart Resume Builder</h3>
          <p className="text-muted-foreground text-sm">
            Create tailored resumes for each job application with our intelligent template system.
          </p>
        </div>
        
        <div className="glass-effect rounded-lg p-6">
          <div className="w-12 h-12 bg-jobswipe-100 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-jobswipe-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Application Tracking</h3>
          <p className="text-muted-foreground text-sm">
            Keep track of all your applications, interviews, and follow-ups in one place.
          </p>
        </div>
      </div>
    </div>
  );
}