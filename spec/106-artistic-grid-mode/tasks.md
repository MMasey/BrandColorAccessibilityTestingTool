# Artistic Grid Mode: Implementation Tasks

**1. URL State Extensions**
- [ ] 1.1 Extend URLState interface with fgColors, bgColors, artMode, blendMode fields
- [ ] 1.2 Update parseURLState to parse fg/bg params into color arrays
- [ ] 1.3 Update parseURLState to parse art/blend params as booleans
- [ ] 1.4 Implement fallback logic for missing fg/bg params (backward compatibility)
- [ ] 1.5 Update serializeURLState to serialize fgColors/bgColors as fg/bg params
- [ ] 1.6 Update serializeURLState to serialize artMode/blendMode (only when true)

**2. Color Store Extensions**
- [ ] 2.1 Extend ColorStoreState interface with fgColors, bgColors, artMode, blendMode fields
- [ ] 2.2 Add setForegroundColors and setBackgroundColors methods to colorStore
- [ ] 2.3 Add getForegroundColors and getBackgroundColors methods (with fallback to colors)
- [ ] 2.4 Add setArtMode and setBlendMode methods to colorStore
- [ ] 2.5 Add art-mode-changed and blend-mode-changed event types to ColorStoreEvent union
- [ ] 2.6 Update store initialization to include new default values

**3. Color Blending Utility**
- [ ] 3.1 Create src/utils/color-blending.ts with blendColors function
- [ ] 3.2 Implement RGB channel blending with configurable ratio (default 0.5)
- [ ] 3.3 Add hex-to-RGB and RGB-to-hex conversion within blendColors
- [ ] 3.4 Create src/utils/color-blending.test.ts with unit tests
- [ ] 3.5 Test blendColors with various color combinations and ratios

**4. Contrast Grid Updates**
- [ ] 4.1 Update contrast-grid to read fgColors and bgColors from store
- [ ] 4.2 Implement asymmetric matrix generation when fg/bg differ
- [ ] 4.3 Maintain symmetric behavior when only one palette is set
- [ ] 4.4 Add art mode rendering: hide text, headers, and legend visually
- [ ] 4.5 Ensure art mode preserves ARIA structure and labels
- [ ] 4.6 Add blend mode rendering: show blended colors instead of contrast cells
- [ ] 4.7 Create CSS styles for art-mode class (hide borders, headers, legend)
- [ ] 4.8 Update grid-wrapper, header-cell, and legend styles for art mode

**5. Contrast Cell Updates**
- [ ] 5.1 Add blend-mode property to contrast-cell component
- [ ] 5.2 Implement blended color rendering when blend-mode is true
- [ ] 5.3 Hide text content in blend mode while preserving aria-label
- [ ] 5.4 Calculate blended color using color-blending utility

**6. Integration & State Sync**
- [ ] 6.1 Connect URL state to color store on app initialization
- [ ] 6.2 Update URL when art/blend modes change in store
- [ ] 6.3 Update URL when fg/bg palettes change in store
- [ ] 6.4 Ensure backward compatibility with existing colors param URLs

**7. Validation**
- [ ] 7.1 Verify asymmetric grid rendering with different fg/bg palettes
- [ ] 7.2 Verify art mode hides visual labels while maintaining accessibility
- [ ] 7.3 Verify blend mode displays correct blended colors
- [ ] 7.4 Verify backward compatibility with existing URLs
- [ ] 7.5 Verify keyboard navigation works in all modes
- [ ] 7.6 Verify screen reader announcements in art and blend modes
- [ ] 7.7 Test performance with large grids (up to 50×50 cells)
