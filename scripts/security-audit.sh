#!/bin/bash

FIX=false

for arg in "$@"
do
    if [ "$arg" == "--fix" ]; then
        FIX=true
    fi
done

TARGET_DIR="../cypress/cypressAllure"

if [ ! -d "$TARGET_DIR" ]; then
    echo "❌ Target directory not found: $TARGET_DIR"
    exit 1
fi

cd "$TARGET_DIR"

echo "🔍 Starting OWASP Security Audit in $TARGET_DIR..."

# Run npm audit
if npm audit; then
    echo "✅ No vulnerabilities found!"
else
    echo "⚠️ Vulnerabilities found!"
    
    if [ "$FIX" = true ]; then
        echo "🛠️ Attempting to fix vulnerabilities..."
        npm audit fix
        echo "Run 'npm audit' again to verify fixes."
    else
        echo "💡 Run this script with --fix to attempt automatic repairs."
    fi
fi
cd -
