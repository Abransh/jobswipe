export default function JobsPage() {
  const mockJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      salary: "$120k - $150k",
      type: "Full-time",
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      salary: "$100k - $130k",
      type: "Full-time",
      posted: "1 day ago"
    },
    {
      id: 3,
      title: "React Developer",
      company: "WebSolutions",
      location: "New York, NY",
      salary: "$90k - $120k",
      type: "Contract",
      posted: "3 days ago"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Job Opportunities</h1>
          <p className="text-muted-foreground">Swipe right to apply, left to skip</p>
        </div>
        
        <div className="grid gap-4 max-w-md mx-auto">
          {mockJobs.map((job) => (
            <div
              key={job.id}
              className="glass-effect p-6 rounded-xl border border-border/50 hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{job.title}</h3>
                  <p className="text-primary font-medium">{job.company}</p>
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {job.type}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>📍 {job.location}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>💰 {job.salary}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>🕒 {job.posted}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors">
                  Skip
                </button>
                <button className="flex-1 px-4 py-2 gradient-bg text-white rounded-lg hover:opacity-90 transition-opacity">
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <button className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Load More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}