# APCA & Code Exports

# Goal
Add APCA (Accessible Perceptual Contrast Algorithm) support and code export functionality for integrating accessible color palettes into projects.

# Inputs
- Existing color palette from color store
- Algorithm selection (WCAG 2.2, APCA, or both)
- Export format selection

# Outputs
- **APCA contrast ratios** alongside WCAG values
- **CSS export**: Custom properties with utility classes
- **SCSS export**: Variables with utility classes
- **Sass export**: Variables with utility classes

# Constraints
- Must maintain WCAG 2.2 as default/fallback
- Exports should be copy-paste ready
- APCA thresholds per WCAG 3.0 draft
- The algorithm selector must be **extensible** — model it as a list of algorithms, not a
  hard-coded WCAG/APCA binary, so future algorithms can be added without reworking the UI
  or store shape.
- The UI must make unambiguously clear **which algorithm is the one that determines legal /
  WCAG 2.2 conformance** (WCAG contrast ratio) versus which are informational/perceptual
  (APCA is a WCAG 3.0 *draft* and is not a conformance standard today). Users must never be
  led to believe an APCA pass equals WCAG compliance.

# Requirements
- APCA contrast calculation implementation
- Algorithm selector in UI (choose the active algorithm; not limited to two options)
- Each algorithm option is labelled with its status — e.g. WCAG 2.2 marked as the
  conformance/"official compliance" algorithm; APCA marked as perceptual / WCAG 3.0 draft.
- An explainer link next to the selector: "What is APCA?" (and ideally per-algorithm info)
  pointing to a short explanation of the algorithm and how it differs from WCAG contrast.
  Decide whether this is an in-app page/modal or an external link during `/spkl:tasks`.
- Export panel with format selection
- Copy-to-clipboard functionality
- Preview of export output

# Dependencies
- Phase 1 complete (core contrast checker)
- `src/utils/contrast.ts` - Extend with APCA algorithm

# Out of Scope
- No image exports → Feature 103
- No PDF exports → Feature 103
- No AI generation → Feature 104

# Done
- User can choose the active contrast algorithm from a selector (WCAG 2.2 default)
- The selector clearly marks WCAG 2.2 as the compliance algorithm and APCA as
  perceptual / WCAG 3.0 draft (not a conformance measure)
- A "What is APCA?" explainer link is available next to the selector
- Adding a future algorithm requires no change to the selector UI structure
- User sees APCA values in contrast grid
- User can export palette as CSS/SCSS/Sass
- Exports copy correctly to clipboard
