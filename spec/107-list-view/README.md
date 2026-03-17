# Feature 107: Contrast Results List View

## Origin

Identified during a live accessibility testing session (16 Mar 2026) with Florian Beijers,
a blind screen reader user and accessibility consultant. The existing intersection table
is difficult for screen reader users who navigate one cell at a time, and for users who
find two-dimensional tables cognitively demanding.

## Request

Add a toggle in the grid controls area to switch the contrast results between two views:

1. **Table view** — the existing contrast grid (unchanged)
2. **List view** — groups all colour-pair combinations under WCAG level headings
   (AAA, AA, Large Text Only, Fail), with each pair listed as a readable line

The list view should use semantic HTML list elements so the content can be read
sequentially by screen readers and copy-pasted into other documents as plain text.

The active view should persist to the URL so shared links open in the correct view.
