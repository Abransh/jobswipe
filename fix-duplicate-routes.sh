#!/bin/bash
# Fix script for duplicate route registration issue

echo "🔧 JobSwipe Route Registration Fix"
echo "===================================="
echo ""

cd /Users/abranshbaliyan/jobswipe/apps/api

echo "1️⃣  Checking for resume route references in index.ts..."
if grep -q -i "resume" src/index.ts; then
    echo "✅ Found resume route references:"
    echo ""
    grep -n -i "resume" src/index.ts | head -10
    echo ""
    echo "⚠️  These need to be commented out!"
else
    echo "✅ No resume route references found (good!)"
fi

echo ""
echo "2️⃣  Checking your local changes..."
if git diff --quiet src/index.ts; then
    echo "✅ No uncommitted changes in index.ts"
else
    echo "⚠️  You have uncommitted changes in index.ts:"
    echo ""
    git diff src/index.ts | head -30
    echo ""
fi

echo ""
echo "3️⃣  Checking for resumes.routes.ts file..."
if [ -f "src/routes/resumes.routes.ts" ]; then
    echo "✅ File exists"
    echo "📄 First 15 lines:"
    head -15 src/routes/resumes.routes.ts
    echo ""
    echo "⚠️  Check the export format - must be:"
    echo "    export default async function resumeRoutes(fastify) { ... }"
    echo "    OR"
    echo "    export async function registerResumeRoutes(fastify) { ... }"
else
    echo "❌ File does NOT exist (this is fine if you commented it out)"
fi

echo ""
echo "===================================="
echo "🎯 RECOMMENDED ACTIONS:"
echo ""
echo "If you see resume routes in index.ts:"
echo ""
echo "1. Comment out resume route import (in loadRoutes function):"
echo "   // const resumeRoutes = await import('./routes/resumes.routes');"
echo ""
echo "2. Comment out resume route in return statement:"
echo "   // resumeRoutes: resumeRoutes.default"
echo ""
echo "3. Comment out resume route registration:"
echo "   // await server.register(routes.resumeRoutes, ...);"
echo ""
echo "4. Restart server:"
echo "   npm run dev"
echo ""
echo "See ROUTE_REGISTRATION_FIX.md for detailed instructions!"
