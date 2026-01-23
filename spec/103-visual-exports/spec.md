# Visual Exports

# Goal
Enable users to export the contrast grid as visual artifacts for documentation, presentations, and design handoffs.

# Inputs
- Current color palette and contrast grid
- Export format selection
- Optional: custom labels and branding

# Outputs
- **PNG/SVG image** of contrast grid with labels
- **Accessible PDF** of contrast grid
- **Standalone HTML page** (self-contained, shareable)

# Constraints
- Images must include color labels and ratios
- PDF must be screen-reader accessible
- HTML export must be self-contained (no external dependencies)

# Requirements
- Image export functionality (PNG/SVG)
- PDF generation with accessibility tags
- Self-contained HTML export
- Export preview before download

# Dependencies
- Phase 1 (core contrast checker)
- Feature 102 optional (APCA values in exports)

# Out of Scope
- No AI generation → Feature 104
- No paid features → Feature 105

# Done
- User can download contrast grid as PNG or SVG
- User can download accessible PDF
- User can download standalone HTML page
- Exports include all color labels and ratios
