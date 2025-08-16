#!/bin/bash

# JobSwipe Screenshot Viewer
# Utility script to view and manage automation screenshots

SCREENSHOT_DIR="/tmp/jobswipe-screenshots"
DATA_SCREENSHOT_DIR="./data/screenshots"

echo "📸 JobSwipe Screenshot Viewer"
echo "==============================="

# Check primary screenshot directory
echo "🔍 Checking primary screenshot directory: $SCREENSHOT_DIR"
if [ -d "$SCREENSHOT_DIR" ]; then
    SCREENSHOT_COUNT=$(find "$SCREENSHOT_DIR" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "   Found $SCREENSHOT_COUNT screenshot(s)"
    
    if [ $SCREENSHOT_COUNT -gt 0 ]; then
        echo "📋 Recent screenshots:"
        find "$SCREENSHOT_DIR" -name "*.png" -type f -exec ls -la {} \; | head -10
        
        echo ""
        echo "🔗 Screenshot files:"
        find "$SCREENSHOT_DIR" -name "*.png" -type f | head -10
    else
        echo "   No screenshots found in primary directory"
    fi
else
    echo "   Directory does not exist"
fi

echo ""

# Check alternative screenshot directory
echo "🔍 Checking alternative screenshot directory: $DATA_SCREENSHOT_DIR"
if [ -d "$DATA_SCREENSHOT_DIR" ]; then
    SCREENSHOT_COUNT=$(find "$DATA_SCREENSHOT_DIR" -name "*.png" -type f 2>/dev/null | wc -l)
    echo "   Found $SCREENSHOT_COUNT screenshot(s)"
    
    if [ $SCREENSHOT_COUNT -gt 0 ]; then
        echo "📋 Recent screenshots:"
        find "$DATA_SCREENSHOT_DIR" -name "*.png" -type f -exec ls -la {} \; | head -10
    else
        echo "   No screenshots found in alternative directory"
    fi
else
    echo "   Directory does not exist"
fi

echo ""
echo "📝 Screenshot Usage:"
echo "   • Screenshots are automatically taken during job applications"
echo "   • Key moments: navigation, form filling, captcha, submission, confirmation"
echo "   • Naming pattern: {strategy}_{job_id}_{step}_{timestamp}.png"
echo "   • Used for debugging, audit trails, and manual verification"

echo ""
echo "🛠️  Commands to manage screenshots:"
echo "   View all:     find $SCREENSHOT_DIR -name '*.png' -type f"
echo "   Latest 5:     find $SCREENSHOT_DIR -name '*.png' -type f -exec ls -t {} + | head -5"
echo "   Clean old:    find $SCREENSHOT_DIR -name '*.png' -type f -mtime +7 -delete"
echo "   Open latest:  open \$(find $SCREENSHOT_DIR -name '*.png' -type f -exec ls -t {} + | head -1)"

echo ""
echo "✅ Screenshot viewer complete"