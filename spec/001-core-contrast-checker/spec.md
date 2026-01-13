# Core Contrast Checker

# Goal
Build a web-based tool that validates brand color palettes against WCAG 2.1 accessibility standards. Users enter colors and see a contrast grid showing all foreground/background combinations with pass/fail indicators.

# Inputs
- **Colors**: Hex (#RRGGBB, #RGB), RGB, HSL formats
- **Labels**: Optional names for each color
- **Text size**: Toggle between normal and large text thresholds
- **Theme**: Light, dark, or high-contrast mode

# Outputs
- **Contrast grid**: Matrix of all color pair combinations
- **WCAG badges**: AAA, AA, AA 18pt+, or DNP (Does Not Pass)
- **Contrast ratios**: Numeric values for each pair
- **Shareable URL**: Colors encoded in URL parameters
- **Grid filters**: Show/hide by compliance level

# Constraints
- Tool itself must meet WCAG AA compliance
- WCAG 2.1 contrast formula: (L1 + 0.05) / (L2 + 0.05)
- Thresholds: AA (4.5:1 normal, 3:1 large), AAA (7:1 normal, 4.5:1 large)
- No backend required - all client-side
- Responsive: 375px mobile to 1920px desktop
- Progressive enhancement: meaningful content before JS loads

# Requirements
- Color input component accepting hex, RGB, HSL formats
- Color palette management with add/remove/edit
- Contrast grid displaying all color pair combinations
- WCAG compliance badges for each cell
- URL state encoding for shareability
- Grid filtering by compliance level
- Theme switching (light/dark/high-contrast)

# Dependencies
- `src/utils/contrast.ts` - WCAG contrast calculation
- `src/utils/color-parser.ts` - Color format parsing
- `src/state/color-store.ts` - Color palette state
- `src/state/url-state.ts` - URL synchronization

# Out of Scope
- **No APCA algorithm** → Phase 2
- **No CSS/SCSS exports** → Phase 2
- **No image/PDF exports** → Phase 3
- **No AI color generation** → Phase 4
- **No visual color picker** → Deferred
- **No bulk paste** → Deferred

# UX Improvements (Deferred)
- **Add button always enabled**: Allow clicking add button with invalid color, show validation message instead of disabling
- **Remove button focus ring**: Focus indicator shows as line to left of button instead of around button - needs CSS fix
- **Focus states with overflow:hidden**: Containers like swatch-container have overflow:hidden which clips child focus outlines - need alternative focus indicator approach
- **ARIA audit**: Review all ARIA usage - remove where native HTML semantics suffice, document remaining usage with justification

# Done
- User can input colors in hex, RGB, or HSL
- User sees contrast grid with all combinations
- User sees WCAG AA/AAA pass/fail badges
- Shareable URLs work correctly
- Tool passes WCAG AA audit
