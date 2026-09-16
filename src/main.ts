// Main entry point
import { initializeFromURL, initTheme } from './state';
import './components/app-shell';

// Before URL init so a ?theme= param still overrides the stored preference
initTheme();

// Initialize state from URL parameters (for shareable links)
initializeFromURL();
