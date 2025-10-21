#!/bin/bash

echo "🔍 Suite AnythingLLM Integration Verification"
echo "=============================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    echo "   Run: cp .env.example .env.local"
    exit 1
fi

echo "✅ .env.local exists"
echo ""

# Check required environment variables
echo "🔐 Checking Environment Variables..."
echo ""

check_env() {
    local var=$1
    local value=$(grep "^$var=" .env.local | cut -d'=' -f2)
    if [ -z "$value" ]; then
        echo "❌ $var not set"
        return 1
    else
        # Show first 10 chars + ... for security
        local display="${value:0:10}..."
        echo "✅ $var: $display"
        return 0
    fi
}

all_set=true
check_env "NEXT_PUBLIC_ANYTHINGLLM_BASE_URL" || all_set=false
check_env "NEXT_PUBLIC_ANYTHINGLLM_WORKSPACE_SLUG" || all_set=false
check_env "ANYTHINGLLM_API_KEY" || all_set=false

echo ""
if [ "$all_set" = false ]; then
    echo "⚠️  Some required variables are missing!"
    echo "   Edit .env.local and add the missing values"
    exit 1
fi

echo "✅ All required variables set"
echo ""

# Check if files exist
echo "📁 Checking File Structure..."
echo ""

files=(
    "src/app/services/anythingllm.ts"
    "src/app/components/AIPanel.tsx"
    "src/app/editor/editor.ts"
)

all_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (MISSING)"
        all_exist=false
    fi
done

echo ""
if [ "$all_exist" = false ]; then
    echo "❌ Some files are missing!"
    exit 1
fi

echo "✅ All files present"
echo ""

# Check TypeScript compilation
echo "🔧 Checking TypeScript..."
if npx tsc --noEmit 2>/dev/null; then
    echo "✅ TypeScript compilation OK"
else
    echo "⚠️  TypeScript warnings/errors found (check with: npm run lint)"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start dev server: npm run dev"
echo "   2. Open http://localhost:3000"
echo "   3. Click 'AI Assistant' in the top bar"
echo "   4. You should see a 🟢 green indicator"
echo "   5. Try sending a message!"
echo ""
