# Copilot Instructions

This document provides context and guidelines for working with the Brand Color Accessibility Testing Tool codebase.

> **Note**: This repository also contains `CLAUDE.md` which provides a high-level overview of the architecture, roadmap, and design values. Both documents complement each other - this file focuses on detailed coding guidelines while `CLAUDE.md` provides strategic context.

## Project Overview

A web-based tool for testing and validating brand color palettes against WCAG 2.1 accessibility standards. The tool helps designers and developers ensure their color combinations meet contrast requirements for text readability.

## Tech Stack

- **Lit 3.2+** - Lightweight web components framework
- **TypeScript 5.6+** - Strict mode enabled with comprehensive type checking
- **Vite** - Build tool and development server
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing with axe-core accessibility checks

## Development Commands

```bash
# Start development server (localhost:5173)
npm run dev

# Build for production (includes TypeScript type checking)
npm run build

# Preview production build
npm run preview

# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with Playwright UI
npm run test:e2e:ui
```

## Project Structure

```
src/
├── components/     # Lit web components (*.ts files)
│   ├── app-shell.ts        # Main application container
│   ├── color-palette.ts    # Color input and palette management
│   ├── contrast-grid.ts    # Contrast matrix display
│   └── ...                 # Other web components
├── state/          # State management modules
│   ├── color-store.ts      # Color palette state
│   ├── theme-store.ts      # Theme state
│   └── url-sync.ts         # URL state synchronization
├── utils/          # Core utilities and algorithms
│   ├── color-parser.ts     # Parse hex, RGB, HSL formats
│   ├── color-converter.ts  # Color space conversions
│   ├── contrast.ts         # WCAG contrast calculations
│   └── ...                 # Other utilities
├── styles/         # Global styles
│   └── global.css          # CSS custom properties and design tokens
└── main.ts         # Application entry point
```

## Coding Conventions

### TypeScript

- **Strict mode enabled** - All strict TypeScript checks are active
- Use `noUncheckedIndexedAccess: true` - Always check array/object access
- Use `noUnusedLocals` and `noUnusedParameters` - No unused variables
- **Use type imports** - `import type { ... }` for types
- **Prefer interfaces over types** for object shapes
- Use JSDoc comments for public APIs and complex functions
- Target ES2022 with DOM libraries

### Lit Components

- Use **decorators** for component definitions: `@customElement`, `@property`, `@state`
- Define `static styles` using `css` tagged template literal
- Use **kebab-case** for custom element names (e.g., `contrast-cell`)
- Use **camelCase** for properties and methods
- Include JSDoc comments explaining component purpose
- Follow shadow DOM best practices
- Use CSS custom properties for theming

### File Naming

- **kebab-case** for all files: `contrast-cell.ts`, `color-parser.ts`
- Test files: `*.test.ts` (e.g., `color-parser.test.ts`)
- E2E tests: `*.spec.ts` in `/e2e` directory

### Code Style

- Use **single quotes** for strings
- Include trailing commas in multi-line objects/arrays
- Use `const` by default, `let` only when reassignment needed
- Avoid `any` type - use `unknown` or proper types
- Use template literals for string interpolation
- Export utility functions explicitly (no default exports for utilities)
- Use named exports for components

### Comments

- Use JSDoc for public APIs and exported functions
- Include `@param` and `@returns` tags
- Inline comments should explain "why", not "what"
- Keep comments concise and up-to-date with code

## Git Workflow

This project uses **Git Flow** branching strategy:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (branch from develop)
- `bugfix/*` - Bug fixes (branch from develop)
- `release/*` - Release preparation
- `hotfix/*` - Urgent production fixes (branch from main)

## Commit Message Conventions

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Formatting, no code change
- `refactor` - Code restructuring, no feature/fix
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Build, config, tooling

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

## Accessibility Requirements

This tool is built with accessibility as a core feature:

- **Full keyboard navigation** - All interactive elements must be keyboard accessible
- **Screen reader support** - Use proper ARIA labels and semantic HTML
- **Visible focus states** - All focusable elements need clear focus indicators
- **Minimum touch targets** - 44x44px minimum for interactive elements
- **Motion sensitivity** - Respect `prefers-reduced-motion` media query
- **Color scheme** - Respect `prefers-color-scheme` media query
- **WCAG AA compliance** - The tool itself must meet WCAG 2.1 AA standards

## Testing Guidelines

### Unit Tests (Vitest)

- Place test files next to source files: `color-parser.test.ts`
- Use descriptive test names: `describe()` and `it()` blocks
- Test edge cases and error conditions
- Aim for high coverage of utility functions and algorithms
- Use `expect()` assertions from Vitest

### E2E Tests (Playwright)

- Place in `/e2e` directory with `*.spec.ts` extension
- Include accessibility checks using `@axe-core/playwright`
- Test user workflows and component interactions
- Test responsive behavior and keyboard navigation
- Use page object pattern for complex pages

## WCAG Contrast Standards

When working with color contrast calculations:

| Level | Normal Text | Large Text |
|-------|-------------|------------|
| AAA   | 7:1         | 4.5:1      |
| AA    | 4.5:1       | 3:1        |

Large text: 18pt (24px) or 14pt (18.5px) bold

## Color Formats Supported

- **Hex**: `#RRGGBB`, `#RGB` (with or without #)
- **RGB**: `rgb(R, G, B)` or `rgb(R G B)` (spaces or commas)
- **HSL**: `hsl(H, S%, L%)` or `hsl(H S% L%)` (spaces or commas)

## Build Configuration

- **TypeScript**: See `tsconfig.json` - strict mode with decorator support
- **Vite**: See `vite.config.ts` - ES modules, bundler mode
- **Vitest**: See `vitest.config.ts` - unit test configuration
- **Playwright**: See `playwright.config.ts` - E2E test configuration

## Key Dependencies

- `lit` - Web components library (only production dependency)
- `typescript` - Type checking
- `vite` - Build and dev server
- `vitest` - Unit testing
- `@playwright/test` - E2E testing
- `@axe-core/playwright` - Accessibility testing

## Additional Notes

- The application uses URL parameters for sharing color palettes
- State is managed through custom stores (see `/src/state`)
- CSS custom properties are used extensively for theming
- Components use shadow DOM for style encapsulation
- The tool itself is a single-page application (SPA)

## Validation Checklist

Before committing changes, ensure:

1. **Type Check**: Run `npm run build` to verify TypeScript compilation
2. **Unit Tests**: Run `npm run test:run` to ensure all unit tests pass
3. **E2E Tests**: Run `npm run test:e2e` to verify end-to-end functionality
4. **Code Style**: Follow the coding conventions outlined above
5. **Accessibility**: New UI features must meet WCAG 2.1 AA standards minimum
6. **Documentation**: Update relevant documentation for significant changes

## Custom Agents and Instructions

This repository includes specialized configurations:

- **Custom Agents**: See `.github/agents/` for specialized agents (e.g., test-specialist)
- **Path-Specific Instructions**: See `.github/instructions/` for file-type specific guidelines
- **Setup Steps**: See `.github/copilot-setup-steps.yml` for environment setup automation

When assigned tasks, Copilot coding agent will automatically use these configurations to provide better results.
