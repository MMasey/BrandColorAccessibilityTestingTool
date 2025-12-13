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
