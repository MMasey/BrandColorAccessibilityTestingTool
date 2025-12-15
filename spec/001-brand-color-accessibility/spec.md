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
- Brand colors via:
  - Manual text input (hex, RGB, HSL formats)
  - **Bulk paste** - paste list of colors with optional labels (see format below)
  - Visual color picker (native `<input type="color">` with Alwan enhancement)
  - EyeDropper API for screen color sampling (Chromium browsers only, progressive enhancement)
- AI prompt describing brand personality/feel (future phase)
- Algorithm toggle (WCAG 2.1, APCA, or both)
- Target compliance level (AA or AAA)
- Text size context (normal or large text)

## Bulk Paste Format
Support pasting color lists with optional labels in various formats:

```
#2F1560, Dark Purple
#FEF26B, Yellow
#FC53AF, Pink
```

or without labels:
```
#2F1560
#FEF26B
#FC53AF
```

or mixed hex formats:
```
2F1560, Dark Purple
FEF26B
#FC53AF, Pink
```

**Parsing Rules:**
- Each line is treated as a color entry
- Comma separates color from optional label
- Hex codes with or without `#` prefix
- Empty lines ignored
- Invalid color codes skipped with user notification

## Color Picker Strategy
Layered approach following progressive enhancement:

| Layer | Solution | Description |
|-------|----------|-------------|
| **Baseline** | Text input | Paste hex/RGB/HSL - works without JS |
| **Native** | `<input type="color">` | Browser's built-in picker, accessible |
| **Enhanced** | Alwan | Chrome DevTools-style picker, keyboard accessible |
| **Optional** | EyeDropper API | Pick color from anywhere on screen (Chromium only) |

**Why Alwan?**
- Vanilla JavaScript, zero framework dependencies
- Explicitly designed for accessibility (full keyboard support)
- UI inspired by Chrome DevTools color picker
- Lightweight and performant
- Supports hex, RGB, HSL output formats
- MIT licensed

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
- **Progressive Enhancement**: Core functionality must degrade gracefully without JavaScript

# Progressive Enhancement Principles

The tool follows progressive enhancement - building from a solid HTML foundation, enhanced by CSS, then JavaScript. This ensures maximum accessibility and resilience.

## Core Principle
> "Make the core functionality work for everyone, then enhance for those with more capable browsers."

## Enhancement Layers

### Layer 1: HTML Baseline (No JavaScript)
The tool must provide meaningful functionality without JavaScript:
- **Shareable URLs**: Color palette encoded in URL query parameters (`?colors=FF5733,3498DB,2ECC71&labels=Orange,Blue,Green`)
- **Server-side fallback option**: URL structure supports future server-rendered output
- **Noscript content**: Clear message explaining JS requirement with link to alternative tools (WebAIM)
- **Semantic HTML**: Forms, tables, and landmarks that convey structure without styling

### Layer 2: CSS Enhancement
Visual presentation and some interactivity via CSS-only techniques:
- **Theme switching**: Use `prefers-color-scheme` media query as default
- **CSS-only theme toggle**: Hidden radio inputs with sibling selectors (`:checked ~ .content`)
- **Print styles**: Contrast grid prints cleanly without JS
- **Reduced motion**: Respect `prefers-reduced-motion` via CSS

### Layer 3: JavaScript Enhancement
Rich interactivity for capable browsers:
- Real-time color validation and preview
- Dynamic contrast calculations as colors are entered
- Instant grid updates without page reload
- Enhanced state management and undo/redo
- ARIA live region announcements

## URL State Architecture
Colors are persisted in URL for bookmarking, sharing, and progressive enhancement:

```
?colors=FF5733,3498DB,2ECC71&labels=Orange,Blue,Green&text=normal&theme=dark
```

| Parameter | Description | Example |
|-----------|-------------|---------|
| `colors` | Comma-separated hex values (no #) | `FF5733,3498DB` |
| `labels` | Comma-separated labels (URL-encoded) | `Primary,Secondary` |
| `text` | Text size mode | `normal` or `large` |
| `theme` | Color theme | `light`, `dark`, or `high-contrast` |

Benefits:
- Page can render initial state from URL before JS loads
- Shareable links work immediately
- Browser back/forward navigation works naturally
- Bookmarkable states

## Implementation Requirements

### Minimum Viable No-JS Experience
1. Display a meaningful landing page with tool description
2. Show a form for entering colors (submits to update URL)
3. If colors exist in URL, display static contrast grid (pre-rendered or noscript table)
4. Provide fallback links to WebAIM contrast checker

### JavaScript-Enhanced Experience
1. Intercept form submission, update URL without reload
2. Calculate contrast ratios client-side in real-time
3. Render dynamic grid with live updates
4. Add keyboard shortcuts and enhanced interactions

## What Progressive Enhancement is NOT
- It's not about supporting ancient browsers
- It's not about building everything twice
- It's about **layered experiences** where each layer adds value
- JavaScript failures (network issues, CDN outages, corporate firewalls) shouldn't break the core experience

# Design Requirements
- **Responsive**: Mobile-first, fully functional across mobile, tablet, and desktop
- **Theme modes**: Light, dark, and high contrast options (based on branding)
- **Font scaling**: User-configurable font size adjustment
- **Touch-friendly**: Adequate tap targets on mobile (minimum 44x44px)
- **Keyboard navigation**: Full keyboard accessibility with visible focus states
- **Screen reader optimized**: Proper ARIA labels, live regions for dynamic updates
- **Reduced motion**: Respect prefers-reduced-motion for animations

## UI/UX Refinements

### Contrast Grid
- **Diagonal cells (same-color pairs)**: Display as blank/empty or "—" rather than showing "1:1 FAIL" — these comparisons are meaningless and add visual clutter
- **Badge clarity**: Consider tooltips or help text explaining what "AA 18+" means ("Passes AA for large text only, fails for normal text")
- **Visual hierarchy**: Use subtle borders or gaps to help users track rows/columns

### Display Preferences Placement
- **DOM order**: Display preferences (theme, font size) should appear **early in the DOM** for accessibility
- **Rationale**: Users who need to adjust contrast or font size should be able to do so before navigating through main content
- **Options**:
  1. Move to header (always visible)
  2. Place at top of sidebar (before color palette)
  3. Add a quick-access button in header that reveals preferences

### Theme Switcher
- **Overflow handling**: Ensure button labels don't overflow at any viewport width
- **Label abbreviations**: Consider "Hi-Con" or just icon-only for high-contrast on narrow screens
- **Consistent sizing**: All theme buttons should have equal width to prevent layout shifts

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
- **Visual color picker:**
  - Native `<input type="color">` as baseline
  - Alwan picker for enhanced Chrome DevTools-style experience
  - EyeDropper API integration (Chromium browsers, graceful fallback)
- Relative luminance calculator with sRGB gamma correction
- WCAG 2.1 contrast ratio calculator
- Contrast grid UI showing all foreground/background combinations
- Pass/fail indicators for AA and AAA levels (AAA, AA, AA18/Large, DNP)
- Toggle between normal and large text thresholds
- Grid view mode: Equal grid (all combinations same size)
- **Progressive Enhancement baseline:**
  - URL state persistence (colors, labels, settings encoded in URL params)
  - Semantic HTML form for color input (works without JS via URL update)
  - Static HTML fallback content with tool description
  - Noscript message with alternative tool links
  - CSS-only theme switching via `prefers-color-scheme` default
  - Print stylesheet for contrast grid

## Phase 2: APCA & Export Options
- APCA contrast calculator
- Algorithm toggle (WCAG only, APCA only, both side-by-side)
- CSS/SCSS/Sass export with utility classes
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
- **Phase 1**: Alwan color picker (vanilla JS, MIT license, ~8kb gzipped)
- **Phase 1-3**: Client-side only, no backend required
- **Phase 4-5**: AI API integration (OpenAI/Anthropic)
- **Phase 5**: Backend for payments (Stripe or similar)

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
- **Progressive Enhancement:**
  - Page displays meaningful content before JavaScript loads
  - Colors can be shared via URL parameters
  - Theme respects system preference without JavaScript
  - Noscript users see helpful fallback content
  - Contrast grid prints correctly

## Phase 2 Complete When:
- User can toggle between WCAG and APCA algorithms
- User can export colors as CSS/SCSS/Sass with utility classes
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
