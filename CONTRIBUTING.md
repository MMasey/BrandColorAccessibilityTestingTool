# Contributing

## Git Workflow

This project uses **Git Flow** branching strategy.

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/*` | New features |
| `bugfix/*` | Bug fixes (from develop) |
| `release/*` | Release preparation |
| `hotfix/*` | Urgent production fixes |

### Starting Work

```bash
# New feature
git flow feature start feature-name

# Bug fix
git flow bugfix start bugfix-name

# When done
git flow feature finish feature-name
```

## Commit Messages

This project enforces **Conventional Commits**.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build, config, tooling |

### Scope (optional)

Component or area affected, e.g.:
- `color-utils`
- `contrast-grid`
- `theme`
- `a11y`

### Rules

- Subject in imperative mood, lowercase, no period
- Keep subject under 50 characters
- Body explains **what** and **why**, not how
- Reference issues in footer: `Closes #123`

### Examples

```
feat(color-utils): add HSL color parsing

Add support for HSL format input alongside hex and RGB.
Includes validation for hue (0-360), saturation and
lightness (0-100%).

Closes #12
```

```
fix(contrast-grid): correct ratio calculation for dark colors

The luminance formula was not applying gamma correction
correctly for very dark colors (luminance < 0.03928).
```

```
chore: configure vite for production build
```

```
docs: add setup instructions to README
```

## Pull Request Requirements

Before creating a PR, ensure you have completed the following:

### 1. Run All Tests

```bash
# Unit tests
npm test

# E2E tests (ensure dev server is running)
npm run dev &
npm run test:e2e
```

### 2. Capture Visual Milestone

Every PR that includes UI changes **must** capture a visual milestone for the project's visual history.

```bash
# Start the dev server
npm run dev

# In another terminal, capture the milestone
npm run capture-milestone -- "your-feature-name"
```

This creates screenshots in `docs/visual-history/YYYY-MM-DD_your-feature-name/` including:
- 3 viewports: desktop (1440×900), tablet (768×1024), mobile (375×667)
- 3 themes: light, dark, high-contrast
- 2 states: empty, with sample colors

**Include these screenshots in your PR** - they become part of our visual changelog.

### 3. Run Performance Audit

Every PR should include a Lighthouse performance audit:

```bash
# Build the production version
npm run build

# Run Lighthouse audit (saves to docs/performance-history/)
npm run lighthouse -- "your-feature-name"
```

This captures:
- Performance score and metrics (FCP, LCP, TBT, CLS)
- Accessibility score
- Best practices score
- SEO score
- Bundle size

**Review the results** to ensure no regressions in performance or accessibility.

### 4. PR Checklist

- [ ] All unit tests pass (`npm test`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Visual milestone captured (for UI changes)
- [ ] Lighthouse audit shows no regressions
- [ ] Commits follow conventional commit format
- [ ] PR targets `develop` branch (not `main`)

## Quality Tracking

### Visual History

We maintain a visual history of the UI in `docs/visual-history/`. This allows us to:
- Track UI evolution over time
- Review visual changes in PRs
- Maintain a record of design decisions

### Performance History

We track performance metrics in `docs/performance-history/`. This helps us:
- Monitor performance over time
- Catch regressions early
- Maintain our commitment to efficiency and environmental responsibility

### Performance Goals

This project aims to be:
- **Performant**: Lighthouse Performance score ≥ 90
- **Accessible**: Lighthouse Accessibility score = 100
- **Efficient**: Minimal bundle size, no unnecessary dependencies
- **Environmentally conscious**: Fast load times = less energy consumption
