# WCAG 2.1 → 2.2 Upgrade Plan

## Overview

Upgrade the Brand Color Accessibility Tool from WCAG 2.1 to WCAG 2.2 compliance across all themes, components, and documentation.

## Why Upgrade?

WCAG 2.2 (released October 2023) adds 9 new success criteria, several of which are relevant to our tool:

### Relevant WCAG 2.2 Additions

| Criterion | Level | Relevance | Current Status |
|-----------|-------|-----------|----------------|
| **2.4.11 Focus Not Obscured (Minimum)** | AA | Focus indicators not fully hidden | ✅ Likely compliant |
| **2.4.12 Focus Not Obscured (Enhanced)** | AAA | Focus fully visible | ⚠️ Needs verification |
| **2.4.13 Focus Appearance** | AAA | Enhanced focus indicator requirements | ⚠️ Needs verification |
| **2.5.7 Dragging Movements** | AA | Single-pointer alternative required | ❌ **Critical for Feature 101** |
| **2.5.8 Target Size (Minimum)** | AA | 24x24px minimum touch targets | ✅ Already compliant (44x44px) |
| **3.2.6 Consistent Help** | A | Help in consistent location | N/A (no help feature) |
| **3.3.7 Redundant Entry** | A | Don't require re-entering data | N/A (no forms) |
| **3.3.8 Accessible Authentication (Minimum)** | AA | No cognitive function tests | N/A (no auth) |
| **3.3.9 Accessible Authentication (Enhanced)** | AAA | Enhanced auth requirements | N/A (no auth) |

### Most Critical for Our Tool

1. **2.5.7 Dragging Movements (AA)** - Feature 101 (drag-and-drop reordering) MUST have keyboard alternative
2. **2.4.11-13 Focus Appearance** - Verify our focus indicators meet new requirements
3. **2.5.8 Target Size** - Already compliant with 44x44px minimum

## Files to Update

### Documentation Files
- [x] `CLAUDE.md` - Line 77: "WCAG 2.1 Level AA" → "WCAG 2.2 Level AA"
- [ ] `README.md` - Update accessibility compliance statement
- [ ] `CONTRIBUTING.md` - Update guidelines if mentioned
- [ ] `index.html` - Update any WCAG references

### Spec Files
- [x] `spec/PROJECT.md` - Updated vision statement
- [x] `spec/100-theme-contrast-testing/spec.md` - Updated constraints
- [ ] `spec/001-core-contrast-checker/spec.md` - Update WCAG references
- [ ] Other phase specs as needed

### CSS/Theme Files
- [ ] `src/styles/themes/light.css` - Update header comments
- [ ] `src/styles/themes/dark.css` - Update header comments
- [ ] `src/styles/themes/high-contrast.css` - Update header comments

### Component Files
- [ ] `src/components/app-shell.ts` - Update any WCAG comments
- [ ] Any components with accessibility documentation

### Test Files
- [ ] `e2e/design-validation.spec.ts` - Update test descriptions
- [ ] `e2e/app.spec.ts` - Update accessibility test tags

### Utility Files
- [ ] `src/utils/contrast.ts` - Update documentation if needed

## Implementation Steps

### Phase 1: Documentation Update (Low Risk)
1. Global search and replace "WCAG 2.1" → "WCAG 2.2" in all files
2. Update specific references to AA/AAA levels if criteria changed
3. Add note in CHANGELOG about WCAG 2.2 upgrade

### Phase 2: Focus Indicator Verification (Medium Risk)
1. Review current focus indicator implementation against 2.4.11-13
2. Verify focus is never fully obscured by other elements
3. Test in high-contrast mode, dark mode, light mode
4. Run axe-core with WCAG 2.2 rules enabled

### Phase 3: Feature 101 Compliance (High Priority)
1. Ensure drag-and-drop has keyboard alternative (2.5.7)
2. Add move up/down buttons
3. Implement arrow key navigation
4. Document keyboard shortcuts

### Phase 4: Testing & Validation
1. Update Playwright tests to use WCAG 2.2 tags
2. Run accessibility audits with 2.2 rules
3. Manual testing with keyboard-only navigation
4. Screen reader testing

## Rollout Strategy

**Recommended Approach**: Incremental

1. **Now**: Update documentation and spec files (this PR)
2. **Feature 101**: Implement 2.5.7 compliance as part of drag-drop feature
3. **Audit**: Run full WCAG 2.2 audit and address any gaps
4. **Marketing**: Update website/README to highlight WCAG 2.2 compliance

## Breaking Changes

**None expected**. WCAG 2.2 is fully backward compatible with 2.1. All 2.1 AA criteria remain in 2.2 AA. We're only adding new requirements, not changing existing ones.

## Resources

- [WCAG 2.2 Official W3C Recommendation](https://www.w3.org/TR/WCAG22/)
- [What's New in WCAG 2.2](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/)
- [Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/)

## Next Steps

1. ✅ Update spec files to reference WCAG 2.2
2. ✅ Create Feature 101 spec with 2.5.7 compliance
3. ⏳ Run global search/replace for remaining documentation
4. ⏳ Verify focus indicators meet 2.4.11-13
5. ⏳ Implement Feature 101 with keyboard alternatives
