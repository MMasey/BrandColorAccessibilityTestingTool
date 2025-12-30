/**
 * Shared CSS styles for Lit components
 * Import and use with: static styles = [sharedStyles, css`...`]
 */

import { css } from 'lit';

/**
 * Screen reader only - visually hidden but accessible
 * Use class="sr-only" on elements that should be announced but not visible
 */
export const srOnlyStyles = css`
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

/**
 * Focus ring styles for interactive elements
 * Apply with :focus-visible selector
 */
export const focusRingStyles = css`
  .focus-ring:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
    outline-offset: var(--focus-ring-offset, 2px);
  }
`;

/**
 * Common button base styles
 */
export const buttonBaseStyles = css`
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-xs, 0.25rem);
    padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
    min-height: var(--touch-target-min, 44px);
    border: none;
    border-radius: var(--radius-md, 0.5rem);
    font-size: var(--font-size-md, 1rem);
    font-weight: var(--font-weight-medium, 500);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms ease);
  }

  .btn:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, #0066cc);
    outline-offset: var(--focus-ring-offset, 2px);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: var(--color-accent-primary, #0066cc);
    color: var(--color-text-inverse, #ffffff);
  }

  .btn-primary:hover:not(:disabled) {
    background: var(--color-accent-primary-hover, #0052a3);
  }

  .btn-secondary {
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid var(--color-border-default, #d4d4d4);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--color-surface-secondary, #f5f5f5);
  }
`;

/**
 * Combined shared styles - import this for all common utilities
 */
export const sharedStyles = css`
  ${srOnlyStyles}
`;
