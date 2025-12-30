# APCA & Code Exports

## Intent

Add APCA (Accessible Perceptual Contrast Algorithm) support and code export functionality for integrating accessible color palettes into projects.

## Inputs

- Existing color palette from Phase 1
- Algorithm selection (WCAG 2.1, APCA, or both)
- Export format selection

## Outputs

- **APCA contrast ratios** alongside WCAG values
- **CSS export**: Custom properties with utility classes
- **SCSS export**: Variables with utility classes
- **Sass export**: Variables with utility classes

## Constraints

- Must maintain WCAG 2.1 as default/fallback
- Exports should be copy-paste ready
- APCA thresholds per WCAG 3.0 draft

## Boundaries

- No image exports → Phase 3
- No PDF exports → Phase 3
- No AI generation → Phase 4

## Dependencies

- Phase 1 complete (core contrast checker)

## Status

Not started
