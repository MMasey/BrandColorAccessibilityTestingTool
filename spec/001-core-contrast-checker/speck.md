# Core Contrast Checker

## Intent

Build a web-based tool that validates brand color palettes against WCAG 2.1 accessibility standards. Users enter colors and see a contrast grid showing all foreground/background combinations with pass/fail indicators.

## Inputs

- **Colors**: Hex (#RRGGBB, #RGB), RGB, HSL formats
- **Labels**: Optional names for each color
- **Text size**: Toggle between normal and large text thresholds
- **Theme**: Light, dark, or high-contrast mode
- **Font scale**: User-adjustable for accessibility

## Outputs

- **Contrast grid**: Matrix of all color pair combinations
- **WCAG badges**: AAA, AA, AA 18pt+, or DNP (Does Not Pass)
- **Contrast ratios**: Numeric values for each pair
- **Shareable URL**: Colors encoded in URL parameters
- **Grid filters**: Show/hide by compliance level

## Constraints

- Tool itself must meet WCAG AA compliance
- WCAG 2.1 contrast formula: (L1 + 0.05) / (L2 + 0.05)
- Thresholds: AA (4.5:1 normal, 3:1 large), AAA (7:1 normal, 4.5:1 large)
- No backend required - all client-side
- Responsive: 375px mobile to 1920px desktop
- Progressive enhancement: meaningful content before JS loads

## Boundaries (Out of Scope)

- **No APCA algorithm** → Phase 2
- **No CSS/SCSS exports** → Phase 2
- **No image/PDF exports** → Phase 3
- **No AI color generation** → Phase 4
- **No visual color picker** → Deferred (was planned, deprioritized)
- **No bulk paste** → Deferred

## Done When

- User can input colors in hex, RGB, or HSL
- User sees contrast grid with all combinations
- User sees WCAG AA/AAA pass/fail badges
- Shareable URLs work correctly
- Tool passes WCAG AA audit
