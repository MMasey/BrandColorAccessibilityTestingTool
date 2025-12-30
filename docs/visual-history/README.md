# Visual History

This directory contains visual milestones documenting the UI evolution of the Brand Color Accessibility Tool.

## Structure

Each milestone is stored in a timestamped folder for proper chronological ordering:
```
docs/visual-history/
├── YYYY-MM-DD_HHMM_milestone-name/
│   ├── desktop-empty.png
│   ├── desktop-colors.png
│   ├── tablet-empty.png
│   ├── tablet-colors.png
│   ├── mobile-empty.png
│   ├── mobile-colors.png
│   └── metadata.json
```

The naming format `YYYY-MM-DD_HHMM` ensures folders sort chronologically even when multiple captures occur on the same day.

## Capturing a Milestone

When making UI changes, capture a visual milestone before creating a PR:

```bash
# Start the dev server
npm run dev

# In another terminal, capture the milestone
npm run capture-milestone -- "feature-name"
```

## Screenshot Set

Each milestone captures:
- **3 viewports**: desktop (1440x900), tablet (768x1024), mobile (375x667)
- **2 states**: empty, with 4 sample colors

Total: 6 screenshots per milestone

## History

| Folder | PR | Description |
|--------|----|-------------|
| 2025-12-14_1128_pr2-initial-setup | PR #2 | Initial project setup with basic UI |
| 2025-12-15_0627_pr3-progressive-enhancement | PR #3 | URL state management and progressive enhancement |
| 2025-12-30_1355_pr5-display-preferences-ux | PR #5 | Display preferences and grid controls |
| 2025-12-30_1510_pr6-filter-url-sync | PR #6 | Grid filter state in URL parameters |

## Historical Captures

For capturing historical commits using git worktree:
```bash
# Create worktree for historical commit
git worktree add ../historical-capture <commit-hash>

# Install dependencies and start server
cd ../historical-capture && npm install && npm run dev

# Capture from main repo using simple script (with timestamp prefix)
cd <main-repo> && npx tsx scripts/capture-simple.ts "HHMM_milestone-name"

# Clean up worktree when done
git worktree remove ../historical-capture
```

## Usage in PRs

Visual milestones are automatically captured by the CI workflow when a PR is created. They are:
1. Attached as artifacts to the PR
2. Committed back to the PR branch
3. Used for visual review of changes

## Performance History

See also `docs/performance-history/` for Lighthouse performance audits tracked alongside visual milestones.
