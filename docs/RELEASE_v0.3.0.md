# Release Process - v0.3.0

**Date:** 2026-02-17  
**Release Type:** Feature Release  
**Git Flow Status:** ✅ Complete (awaiting push)

## Overview

This document records the Git Flow release process for v0.3.0, which adds color palette sorting and drag-drop reordering functionality (Feature #101).

## Process Completed

### 1. Pre-Release Preparation
- [x] Switched to develop branch
- [x] Ensured develop was up-to-date with origin
- [x] Installed dependencies
- [x] Ran build successfully
- [x] Ran all unit tests (123 passed)
- [x] Ran all E2E tests (104 passed)

### 2. Release Branch Creation
- [x] Created `release/0.3.0` branch from `develop`
- [x] Updated `package.json` version: `0.0.1` → `0.3.0`
- [x] Updated `CHANGELOG.md` with release notes
- [x] Committed changes: `0130f8f - chore: bump version to 0.3.0 for release`

### 3. Release Validation
- [x] Re-ran unit tests on release branch (123 passed)
- [x] Re-ran build on release branch (successful)
- [x] Verified version bump in package.json

### 4. Merge to Main
- [x] Switched to `main` branch
- [x] Merged `release/0.3.0` into `main` with `--no-ff`
- [x] Merge commit: `975b617 - Merge release/0.3.0 into main`

### 5. Tagging
- [x] Created annotated tag `v0.3.0` on main
- [x] Tag message includes release notes
- [x] Tag points to commit `975b617`

### 6. Merge Back to Develop
- [x] Switched to `develop` branch  
- [x] Merged `main` into `develop` (fast-forward)
- [x] Both branches now at commit `975b617`

### 7. Cleanup
- [x] Deleted local `release/0.3.0` branch

## Final State

```
Branches:
  main:    975b617  (tagged v0.3.0)
  develop: 975b617  (same as main)

Tags:
  v0.1.0, v0.2.0, v0.2.1, v0.3.0

Deleted:
  release/0.3.0 branch
```

## Release Contents

### Version
**0.3.0** (from 0.2.1)

### Changes
See CHANGELOG.md for full details:
- **Added**: Color palette sorting and drag-drop reordering (Feature #101)
- **Fixed**: Up/down arrow buttons now correctly move cards after drag-and-drop

### Test Results
- Unit Tests: 123/123 passed ✅
- E2E Tests: 104/104 passed ✅  
- Build: Success ✅

## Push Instructions

The release is complete locally. To publish to GitHub, execute:

```bash
# Push main branch
git push origin main

# Push develop branch
git push origin develop

# Push the v0.3.0 tag
git push origin v0.3.0

# Or all at once:
git push origin main develop --tags
```

## Verification

After pushing, verify:

1. **Tag exists on GitHub:**
   ```bash
   git ls-remote --tags origin | grep v0.3.0
   ```

2. **Branches are synced:**
   ```bash
   git fetch origin
   git log origin/main --oneline -1
   git log origin/develop --oneline -1
   # Both should show: 975b617 Merge release/0.3.0 into main
   ```

3. **GitHub Release** (optional):
   - Navigate to https://github.com/MMasey/BrandColorAccessibilityTestingTool/releases
   - Create new release from tag v0.3.0
   - Add release notes from CHANGELOG.md

## Notes

- All Git Flow conventions were followed
- Both main and develop are synchronized at the release commit
- Release branch was properly cleaned up
- Next development can begin on develop branch
