#!/bin/bash
# Git Flow Release Completion Script
# This script completes the push of an already-prepared Git Flow release

set -e

RELEASE_VERSION="0.3.0"
MAIN_COMMIT="975b617"
DEVELOP_COMMIT="975b617"

echo "================================================"
echo "Git Flow Release v${RELEASE_VERSION} - Push"  
echo "================================================"
echo ""
echo "This script will push the completed release to GitHub."
echo "The following has been prepared locally:"
echo "  • main branch at ${MAIN_COMMIT} (tagged v${RELEASE_VERSION})"
echo "  • develop branch at ${DEVELOP_COMMIT}"
echo "  • release/0.3.0 branch deleted (cleanup complete)"
echo ""

# Verify we're in the right repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if we have the expected commits locally
echo "Verifying local state..."
if ! git rev-parse --verify ${MAIN_COMMIT} >/dev/null 2>&1; then
    echo "❌ Error: Commit ${MAIN_COMMIT} not found locally"
    echo "   Make sure you have fetched all branches"
    exit 1
fi

# Show what will be pushed
echo ""
echo "The following will be pushed to origin:"
git log --graph --oneline --decorate ${MAIN_COMMIT}~3..${MAIN_COMMIT}

echo ""
echo "Tags to be pushed:"
git tag -l "v${RELEASE_VERSION}"

echo ""
read -p "Continue with push? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Push cancelled"
    exit 0
fi

# Push main
echo ""
echo "→ Pushing main branch..."
git push origin main || {
    echo "❌ Failed to push main. Check your permissions."
    exit 1
}

# Push develop  
echo "→ Pushing develop branch..."
git push origin develop || {
    echo "❌ Failed to push develop"
    exit 1
}

# Push tags
echo "→ Pushing tags..."
git push origin "v${RELEASE_VERSION}" || {
    echo "❌ Failed to push tag"
    exit 1
}

echo ""
echo "✅ Release v${RELEASE_VERSION} successfully pushed!"
echo ""
echo "Next steps:"
echo "  1. Verify on GitHub: https://github.com/MMasey/BrandColorAccessibilityTestingTool"
echo "  2. Create GitHub Release: https://github.com/MMasey/BrandColorAccessibilityTestingTool/releases/new?tag=v${RELEASE_VERSION}"
echo "  3. Continue development on develop branch"
echo ""
