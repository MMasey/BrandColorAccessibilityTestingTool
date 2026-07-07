# Brand Color Accessibility Tool

## Vision

Provide an accessible, easy-to-use web app for designers and developers to validate brand color palettes against WCAG 2.2 and APCA accessibility standards, with multiple export options for integration into projects.

## Quality Bar

- Award-winning, senior-level UX and design
- Premium feel while remaining free to use
- Every interaction should feel polished and intentional
- Accessibility is not just compliance but a core differentiator

## Business Model

- **Free tier**: Core contrast checker with ethical, non-intrusive ads
- **Paid features**: AI mock-up generation (Feature 105)

## Tech Stack

- **Language**: TypeScript
- **Components**: Lit (lightweight web components)
- **Build**: Vite
- **Testing**: Vitest + Playwright
- **Architecture**: Web Components with Shadow DOM

## Development Phases

| Phase | Name | Description | Status |
|-------|------|-------------|--------|
| 1 | [Core Contrast Checker](001-core-contrast-checker/spec.md) | Color input, contrast grid, WCAG badges | ✅ Complete |

**Note**: The original "phases" 2-5 have been restructured as **independent features (102-105)** below, as they have no sequential dependencies on each other - all depend only on Phase 1.

## Feature Roadmap

All features are independent and can be implemented in any order. They share a common dependency on Phase 1 (Core Contrast Checker) but have no interdependencies.

The table below is ordered by **priority**, not numeric ID. Feature 107 is the current top priority (requested by Florian Beijers) and will be picked up next once the post-launch accessibility fixes land.

### Core Features (100s)

| ID | Name | Status | Dependencies |
|----|------|--------|--------------|
| 107 | [Contrast Results List View](107-list-view/spec.md) | 🔺 **Priority — Next up** (Planned) | Phase 1 |
| 100 | [Theme Contrast Testing](100-theme-contrast-testing/spec.md) | Planned | Phase 1 |
| 101 | [Color Palette Sorting & Reordering](101-color-sorting/spec.md) | ✅ Complete | Phase 1 |
| 102 | [APCA & Code Exports](102-apca-exports/spec.md) | Planned | Phase 1 |
| 103 | [Visual Exports](103-visual-exports/spec.md) | Planned | Phase 1, optionally 102 |
| 104 | [AI Color Generation](104-ai-color-gen/spec.md) | Planned | Phase 1 |
| 105 | [AI Mockup Generation (Paid)](105-ai-mockups/spec.md) | Planned | Phase 1, optionally 104 |
| 106 | [Artistic Grid Mode](106-artistic-grid-mode/spec.md) | Planned | Phase 1 |
| 108 | [Embeddable Widget](108-embeddable-widget/spec.md) | Planned | Phase 1 |

## Current Status

**Completed**: Phase 1 - Core Contrast Checker ✅ (Lighthouse 100/100), Feature 101 - Color Sorting & Reordering ✅
**In progress**: Post-launch accessibility fixes (Florian Beijers review, 16 Mar 2026) — see [001-core-contrast-checker/ACCESSIBILITY-FIXES.md](001-core-contrast-checker/ACCESSIBILITY-FIXES.md)
**Next after fixes**: Feature 107 - Contrast Results List View (requested by Florian)

**See**: [001-core-contrast-checker/tasks.md](001-core-contrast-checker/tasks.md) for Phase 1 details and pending accessibility fix tasks
