#!/bin/bash
# Diagnostic script for AWS SDK issue

echo "🔍 JobSwipe AWS SDK Diagnostic"
echo "=============================="
echo ""

echo "1️⃣  Checking if resumes.routes.ts exists..."
if [ -f "/Users/abranshbaliyan/jobswipe/apps/api/src/routes/resumes.routes.ts" ]; then
    echo "✅ File EXISTS on your machine"
    echo "📄 First 20 lines:"
    head -20 "/Users/abranshbaliyan/jobswipe/apps/api/src/routes/resumes.routes.ts"
else
    echo "❌ File does NOT exist (this is strange - check the error path)"
fi

echo ""
echo "2️⃣  Checking git status..."
cd /Users/abranshbaliyan/jobswipe
git status --short apps/api/src/routes/

echo ""
echo "3️⃣  Checking package.json for AWS SDK..."
if grep -q "@aws-sdk" apps/api/package.json; then
    echo "✅ AWS SDK found in package.json"
    grep "@aws-sdk" apps/api/package.json
else
    echo "❌ AWS SDK NOT in package.json"
fi

echo ""
echo "4️⃣  Checking if AWS SDK is installed..."
if [ -d "node_modules/@aws-sdk/client-s3" ]; then
    echo "✅ @aws-sdk/client-s3 IS installed"
else
    echo "❌ @aws-sdk/client-s3 is NOT installed"
fi

echo ""
echo "5️⃣  Checking which routes are being imported in index.ts..."
grep "import.*routes" apps/api/src/index.ts | grep -v "^//"

echo ""
echo "=============================="
echo "🎯 RECOMMENDED FIX:"
echo ""
echo "If resumes.routes.ts exists and you need it:"
echo "  cd apps/api && npm install @aws-sdk/client-s3 @aws-sdk/lib-storage"
echo ""
echo "If you DON'T need resume upload yet:"
echo "  mv apps/api/src/routes/resumes.routes.ts apps/api/src/routes/resumes.routes.ts.backup"
echo ""
echo "Then restart the server:"
echo "  npm run dev"
