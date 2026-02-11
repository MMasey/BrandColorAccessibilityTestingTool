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

# Requirements
- APCA contrast calculation implementation
- Algorithm toggle in UI
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
- User can toggle between WCAG and APCA algorithms
- User sees APCA values in contrast grid
- User can export palette as CSS/SCSS/Sass
- Exports copy correctly to clipboard
