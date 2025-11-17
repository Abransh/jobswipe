#!/bin/bash

# JobSwipe Automation System - Testing Setup Script
# This script sets up everything needed to test the automation system

set -e

echo "🚀 JobSwipe Automation System - Testing Setup"
echo "============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. You have $(node --version)"
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -f "package-lock.json" ]; then
    npm ci
else
    npm install
fi

# Install TypeScript and tsx for running test scripts
echo ""
echo "🔧 Installing development tools..."
npm install -g tsx typescript

# Install Playwright browsers for automation
echo ""
echo "🎭 Installing Playwright browsers..."
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# Check if Docker is installed for Redis
echo ""
if command -v docker &> /dev/null; then
    echo "🐳 Docker detected - setting up Redis..."
    
    # Start Redis container if not running
    if ! docker ps | grep -q redis; then
        echo "Starting Redis container..."
        docker run -d --name jobswipe-redis -p 6379:6379 redis:latest
        echo "✅ Redis started on port 6379"
    else
        echo "✅ Redis container is already running"
    fi
else
    echo "⚠️  Docker not found. Please install Redis manually or install Docker to run Redis in a container."
    echo "   macOS: brew install redis && brew services start redis"
    echo "   Ubuntu: sudo apt install redis-server"
    echo "   Or use Docker: docker run -d -p 6379:6379 redis:latest"
fi

# Set up environment variables
echo ""
echo "⚙️  Setting up environment..."
if [ ! -f ".env.local" ]; then
    cp .env.testing .env.local
    echo "✅ Created .env.local from .env.testing template"
    echo "   You can edit .env.local to add your API keys if needed"
else
    echo "✅ .env.local already exists"
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p temp
mkdir -p screenshots
mkdir -p test-results

# Check if all core dependencies are available
echo ""
echo "🔍 Checking system requirements..."

# Check Redis connectivity
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running and accessible"
    else
        echo "⚠️  Redis is installed but not responding"
    fi
fi

# Check if we can import the main modules
echo "🔍 Checking TypeScript compilation..."
npx tsc --noEmit --project apps/desktop/tsconfig.json
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "⚠️  TypeScript compilation has issues - tests may fail"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "You can now run tests with:"
echo ""
echo "  Basic automation test:"
echo "    npm run test:automation"
echo ""
echo "  Individual component tests:"
echo "    npm run test:strategy      # Test strategy registry"
echo "    npm run test:captcha       # Test captcha handler" 
echo "    npm run test:form          # Test form analyzer"
echo "    npm run test:queue         # Test queue manager"
echo ""
echo "  Manual testing:"
echo "    npx tsx apps/desktop/src/test-basic-automation.ts"
echo ""
echo "💡 Tips:"
echo "   - Set BROWSER_HEADLESS=false in .env.local to see automation in action"
echo "   - Add your API keys to .env.local for full AI features"
echo "   - Check TESTING_GUIDE.md for detailed testing instructions"
echo ""
echo "🏃 Ready to test! Try: npm run test:automation"