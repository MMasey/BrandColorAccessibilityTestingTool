# Brand Color Accessibility Tool

# Goal
Provide an accessible, easy-to-use web app for designers and developers to validate brand color palettes against WCAG 2.1 and APCA accessibility standards, with multiple export options for integration into projects.

# Quality Bar
- **Award-winning, senior-level UX and design** - this must be best-in-class
- Premium feel while remaining free to use
- Every interaction should feel polished and intentional
- Accessibility is not just compliance but a core differentiator

# Business Model
- **Free tier**: Core contrast checker with ethical, non-intrusive ads on landing page
- **Tool-only page**: Ad-free for embedding/sharing
- **Paid features**: AI mock-up generation (small fee based on actual generation cost, competitively priced)

# Deployment Modes
1. **Landing Page**: Full branded experience with ads, marketing content
2. **Tool-Only Page**: Stripped-back, embeddable version for sharing/whitelabeling (potential future)

# Inputs
- Brand colors via manual input (hex, RGB, HSL formats)
- AI prompt describing brand personality/feel (future phase)
- Algorithm toggle (WCAG 2.1, APCA, or both)
- Target compliance level (AA or AAA)
- Text size context (normal or large text)

# Outputs
- Contrast grid displaying all color pair combinations with ratios
- Pass/fail status per WCAG level and/or APCA threshold
- Export formats:
  - CSS custom properties with utility classes
  - SCSS variables with utility classes
  - Sass variables with utility classes
  - Image of contrast grid with labels
  - Accessible PDF of contrast grid with labels
  - Simple HTML page of contrast grid with labels
  - Shareable URL (colors encoded in URL params)

# Constraints
- Platform: Browser-based web app
- Must be accessible (WCAG AA compliant itself)
- WCAG 2.1 contrast formula: (L1 + 0.05) / (L2 + 0.05)
- APCA (Accessible Perceptual Contrast Algorithm) for WCAG 3.0 future-proofing
- No backend required - share links use URL-encoded data
- Contrast thresholds (WCAG 2.1):
  - AA: 4.5:1 normal text, 3:1 large text
  - AAA: 7:1 normal text, 4.5:1 large text
  - UI components: 3:1 minimum

# Design Requirements
- **Responsive**: Mobile-first, fully functional across mobile, tablet, and desktop
- **Theme modes**: Light, dark, and high contrast options (based on branding)
- **Font scaling**: User-configurable font size adjustment
- **Touch-friendly**: Adequate tap targets on mobile (minimum 44x44px)
- **Keyboard navigation**: Full keyboard accessibility with visible focus states
- **Screen reader optimized**: Proper ARIA labels, live regions for dynamic updates
- **Reduced motion**: Respect prefers-reduced-motion for animations

# Tech Stack
- **Language**: Vanilla TypeScript
- **Components**: Lit (lightweight web components)
- **Styling**: Modern pure CSS in Shadow DOM (encapsulated per component)
- **Build**: Vite
- **Preprocessing**: Only if needed (Vite supports Sass/PostCSS natively)
- **Architecture**: Web Components with Shadow DOM for style encapsulation and branding isolation

# Requirements

## Phase 1: Core Contrast Checker
- Color input parser (hex #RRGGBB/#RGB, RGB, HSL)
- Color labels (optional names for each color)
- Relative luminance calculator with sRGB gamma correction
- WCAG 2.1 contrast ratio calculator
- Contrast grid UI showing all foreground/background combinations
- Pass/fail indicators for AA and AAA levels (AAA, AA, AA18/Large, DNP)
- Toggle between normal and large text thresholds
- Grid view mode: Equal grid (all combinations same size)

## Phase 2: APCA & Export Options
- APCA contrast calculator
- Algorithm toggle (WCAG only, APCA only, both side-by-side)
- CSS/SCSS/Sass export with utility classes
- Shareable URL with encoded color data
- Grid view mode: Smart/Brand Guidelines view (highlights optimal pairings based on color theory + accessibility)

## Phase 3: Visual Exports
- Export contrast grid as image (PNG/SVG)
- Export accessible PDF with labels
- Export standalone HTML page

## Phase 4: AI Color Generation
- Text prompt input for brand personality description
- Guided prompt builder for users who need help describing their brand
- AI-generated accessible color palette based on prompt
- Integration to feed generated colors into contrast checker

## Phase 5: AI Mock-up Generation (Paid Feature)
- Generate example website landing page mockup using brand colors
- Generate example merchandise mockups (t-shirts, mugs, business cards, etc.)
- Pricing: Small fee based on actual AI generation cost (competitive)
- **Critical disclaimer**: Clearly state this is NOT a finished design, but a high-level prototype
- Recommendation to consult a real human designer for proper brand guidelines
- Requires backend for payment processing and AI API calls

# Competitive Research

## EightShapes Contrast Grid (https://contrast-grid.eightshapes.com/)
**Strengths:**
- Clean grid showing all foreground/background combos
- Line-by-line color entry with optional labels
- WCAG compliance categories (AAA, AA, AA18, DNP)
- Tile size options (small/medium/large)
- Export: HTML/CSS copy, shareable URL

**Gaps we can fill:**
- No APCA support
- No code export (CSS/SCSS variables with utilities)
- No visual exports (image/PDF)
- Single grid view mode only
- Basic UX, not mobile-optimized

## Accessibility Insights for Windows
- Desktop app with professional-grade color contrast checking
- Reference for accuracy standards

## WebAIM Contrast Checker
- Simple two-color comparison only
- No multi-color grid view

# Dependencies
- None for Phase 1-3 (greenfield, client-side only)
- Phase 4-5: AI API integration (OpenAI/Anthropic)
- Phase 5: Backend for payments (Stripe or similar)

# Out of Scope
- Color blindness simulation
- Integration with design tools (Figma, Sketch plugins)
- User accounts/authentication (may revisit for Phase 5)

# Done

## Phase 1 Complete When:
- User can input brand colors manually in hex, RGB, or HSL
- User sees a contrast grid of all color combinations
- User sees contrast ratios and pass/fail for WCAG AA/AAA
- Tool itself meets WCAG AA accessibility

## Phase 2 Complete When:
- User can toggle between WCAG and APCA algorithms
- User can export colors as CSS/SCSS/Sass with utility classes
- User can generate a shareable URL
- User can switch between Equal Grid and Smart/Brand Guidelines views

## Phase 3 Complete When:
- User can export grid as image with labels
- User can export accessible PDF
- User can export standalone HTML page

## Phase 4 Complete When:
- User can describe brand personality via prompt
- User can use guided prompt builder if unsure what to write
- AI generates accessible color palette from description
- Generated colors automatically populate the contrast checker

## Phase 5 Complete When:
- User can pay to generate website landing page mockup with their brand colors
- User can pay to generate merchandise mockups with their brand colors
- Clear disclaimer displayed: "This is a prototype, not a finished design"
- Recommendation shown to consult a human designer for brand guidelines
- Payment flow works smoothly with competitive, transparent pricing
