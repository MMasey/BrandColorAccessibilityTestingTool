# Brand Colour Accessibility Tool

A web-based tool for testing and validating brand colour palettes against WCAG 2.2 accessibility standards. Helps designers and developers ensure their colour combinations meet contrast requirements for text readability.

🚀 **[Try it live](https://mmasey.github.io/BrandColorAccessibilityTestingTool/)**

## Features

- **Colour Input**: Enter colours in hex (#RRGGBB, #RGB), RGB, or HSL formats
- **Contrast Grid**: Visual matrix showing all foreground/background combinations
- **WCAG Compliance**: Pass/fail indicators for AA and AAA levels
- **Text Size Toggle**: Switch between normal and large text thresholds
- **Theme Modes**: Light, dark, and high contrast options
- **Shareable URLs**: Colours encoded in URL parameters for easy sharing
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessible**: The tool itself meets WCAG 2.2 AA compliance

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd BrandColorAccessibilityTestingTool

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building

```bash
# Type check and build for production
npm run build

# Preview production build
npm run preview
```

## Testing

```bash
# Run unit tests in watch mode
npm test

# Run unit tests once
npm run test:run

# Run with coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run E2E tests with Playwright UI
npm run test:e2e:ui
```

## Project Structure

```
src/
├── components/     # Lit web components
│   ├── app-shell.ts        # Main application container
│   ├── color-palette.ts    # Colour input and palette management
│   ├── color-input.ts      # Individual colour input
│   ├── color-swatch.ts     # Visual colour display
│   ├── contrast-grid.ts    # Contrast matrix display
│   ├── contrast-cell.ts    # Individual grid cell
│   ├── grid-filters.ts     # Filter and view controls
│   ├── text-size-toggle.ts # Normal/large text toggle
│   └── theme-switcher.ts   # Theme mode selector
├── state/          # State management
│   ├── color-store.ts      # Colour palette store
│   ├── theme-store.ts      # Theme state
│   └── url-sync.ts         # URL state synchronisation
├── utils/          # Core utilities
│   ├── color-parser.ts     # Parse hex, RGB, HSL formats
│   ├── color-converter.ts  # Colour space conversions
│   └── contrast.ts         # WCAG contrast calculations
├── styles/         # Global styles
│   └── global.css          # Theme tokens and design system
└── main.ts         # Application entry point
```

## Tech Stack

- **[Lit](https://lit.dev/)** - Lightweight web components
- **TypeScript** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Build tool and dev server
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[Playwright](https://playwright.dev/)** - End-to-end testing

## Contrast Algorithm

The tool uses the **WCAG 2.2 relative luminance formula** — the same algorithm that underpins all W3C contrast guidance and is the current industry standard for web accessibility.

### Why this algorithm?

The W3C contrast ratio formula was chosen because:

- It is the normative definition used by WCAG 2.2 Success Criteria 1.4.3 and 1.4.6
- It is universally understood by designers, developers, and auditors
- Results are directly comparable to every major accessibility checker (axe, Lighthouse, browser DevTools, etc.)
- It is a well-specified, reproducible calculation with no tooling variation

> **Note on APCA:** The newer APCA (Advanced Perceptual Contrast Algorithm) proposed for WCAG 3.0 is *not* implemented. WCAG 3.0 is still a working draft and APCA is not yet a normative requirement. We may add APCA as a secondary metric in a future release — see the [roadmap](spec/PROJECT.md).

### How it works

1. **Linearise** each sRGB channel using gamma correction (per IEC 61966-2-1)
2. **Compute relative luminance**: `L = 0.2126R + 0.7152G + 0.0722B`
3. **Compute contrast ratio**: `(L_lighter + 0.05) / (L_darker + 0.05)`

The result is a value from 1:1 (no contrast) to 21:1 (black on white).

### Thresholds

Covers **SC 1.4.3 Contrast (Minimum)** and **SC 1.4.6 Contrast (Enhanced)**:

| Badge | Ratio (normal text) | Ratio (large text) | Success Criterion          |
|-------|--------------------|--------------------|----------------------------|
| AAA   | ≥ 7:1              | ≥ 4.5:1            | 1.4.6 Contrast (Enhanced)  |
| AA    | ≥ 4.5:1            | ≥ 3:1              | 1.4.3 Contrast (Minimum)   |
| AA 18+| —                  | ≥ 3:1              | 1.4.3 Contrast (Minimum)   |
| Fail  | < 3:1              | < 3:1              | —                          |

Large text is defined as **18pt (24px) regular** or **14pt (18.5px) bold** and above.

## Accessibility

This tool is built with accessibility as a core feature:

- Full keyboard navigation
- Screen reader optimised with ARIA labels
- Visible focus states
- Minimum 44x44px touch targets
- Respects `prefers-reduced-motion`
- Respects `prefers-color-scheme`

## Documentation

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | Project context for AI assistants |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Development workflow and commit conventions |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architectural Decision Records (ADRs) |
| [spec/PROJECT.md](spec/PROJECT.md) | Product roadmap and specifications |

### Docs Folder

```
docs/
  DECISIONS.md       # Architectural decisions (Lit, pub/sub, etc.)
  visual-history/    # Visual milestone screenshots
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and commit conventions.

## License

MIT
