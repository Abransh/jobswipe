export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">
            🚀 JobSwipe Desktop
          </h1>
          <p className="text-xl text-muted-foreground">
            AI-Powered Job Application Automation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🎯 Queue Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Jobs:</span>
                <span className="font-mono">0</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span>
                <span className="font-mono text-green-600">0</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="font-mono text-red-600">0</span>
              </div>
            </div>
          </div>
          
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">🤖 Automation</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Services Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Browser Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Queue Connected</span>
              </div>
            </div>
          </div>
          
          <div className="glass-effect p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">📊 Statistics</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Time:</span>
                <span className="font-mono">--</span>
              </div>
              <div className="flex justify-between">
                <span>Total Apps:</span>
                <span className="font-mono">0</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button className="gradient-bg text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
            Start Job Queue
          </button>
          <a 
            href="/jobs"
            className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/80 transition-colors"
          >
            Browse Jobs
          </a>
        </div>
      </div>
    </div>
  )
}
