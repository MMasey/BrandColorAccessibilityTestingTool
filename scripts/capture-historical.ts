/**
 * Historical Visual Capture Script
 *
 * Captures screenshots from historical commits using URL state.
 * This script is simpler and works with different UI versions.
 *
 * Run with: npx tsx scripts/capture-historical.ts
 */

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// Configuration
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

// URL with preset colors (works for commits after dc191f9)
const COLORS_URL = '?colors=1a1a1a,ffffff,0066cc,dc2626&labels=Dark,White,Blue,Red';

interface HistoricalMilestone {
  commit: string;
  name: string;
  date: string;
  description: string;
  supportsUrlState: boolean;
}

// Key milestones to capture
const MILESTONES: HistoricalMilestone[] = [
  {
    commit: 'd9ddff5',
    name: 'responsive-layouts',
    date: '2025-01-initial',
    description: 'Initial responsive layouts',
    supportsUrlState: false,
  },
  {
    commit: 'dc191f9',
    name: 'progressive-enhancement',
    date: '2025-01-progressive',
    description: 'URL state management added',
    supportsUrlState: true,
  },
  {
    commit: '961bf48',
    name: 'ux-improvements',
    date: '2025-01-ux',
    description: 'Comprehensive UX improvements and grid cell size',
    supportsUrlState: true,
  },
  {
    commit: '596f4b6',
    name: 'display-preferences',
    date: '2025-01-display',
    description: 'Display preferences UX (PR #5)',
    supportsUrlState: true,
  },
  {
    commit: '928fd26',
    name: 'filter-url-sync',
    date: '2025-01-filter',
    description: 'Filter URL sync (PR #6)',
    supportsUrlState: true,
  },
];

async function captureCommit(
  milestone: HistoricalMilestone,
  baseUrl: string
): Promise<string[]> {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const screenshots: string[] = [];

  const outputDir = path.join(
    process.cwd(),
    'docs',
    'visual-history',
    `${milestone.date}_${milestone.name}`
  );

  if (fs.existsSync(outputDir)) {
    console.log(`  Skipping ${milestone.name} - already exists`);
    await browser.close();
    return [];
  }

  fs.mkdirSync(outputDir, { recursive: true });

  try {
    for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
      await page.setViewportSize(viewport);

      // Empty state
      await page.goto(baseUrl);
      await page.waitForTimeout(1000);

      const emptyPath = path.join(outputDir, `${viewportName}-empty.png`);
      await page.screenshot({ path: emptyPath, fullPage: true });
      screenshots.push(emptyPath);
      console.log(`    Captured: ${viewportName}-empty.png`);

      // With colors (if URL state is supported)
      if (milestone.supportsUrlState) {
        await page.goto(baseUrl + COLORS_URL);
        await page.waitForTimeout(1000);

        const colorsPath = path.join(outputDir, `${viewportName}-colors.png`);
        await page.screenshot({ path: colorsPath, fullPage: true });
        screenshots.push(colorsPath);
        console.log(`    Captured: ${viewportName}-colors.png`);
      }
    }

    // Save metadata
    const metadata = {
      milestone: milestone.name,
      commit: milestone.commit,
      description: milestone.description,
      capturedAt: new Date().toISOString(),
      screenshots: screenshots.map(s => path.basename(s)),
    };

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

  } finally {
    await browser.close();
  }

  return screenshots;
}

async function main(): Promise<void> {
  console.log('\n=== Historical Visual Capture ===\n');
  console.log('This will checkout historical commits and capture screenshots.');
  console.log('Make sure you have no uncommitted changes.\n');

  // Check for uncommitted changes
  try {
    execSync('git diff --quiet && git diff --staged --quiet', { stdio: 'pipe' });
  } catch {
    console.error('Error: You have uncommitted changes. Commit or stash them first.');
    process.exit(1);
  }

  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
  console.log(`Current branch: ${currentBranch}\n`);

  const baseUrl = 'http://localhost:5173';

  for (const milestone of MILESTONES) {
    console.log(`\nProcessing: ${milestone.name} (${milestone.commit})`);
    console.log(`  ${milestone.description}`);

    // Check if already captured
    const outputDir = path.join(
      process.cwd(),
      'docs',
      'visual-history',
      `${milestone.date}_${milestone.name}`
    );

    if (fs.existsSync(outputDir)) {
      console.log(`  Skipping - already captured`);
      continue;
    }

    // Checkout commit
    console.log(`  Checking out ${milestone.commit}...`);
    try {
      execSync(`git checkout ${milestone.commit}`, { stdio: 'pipe' });
    } catch (error) {
      console.error(`  Failed to checkout ${milestone.commit}`);
      continue;
    }

    // Install dependencies (in case they changed)
    console.log('  Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'pipe', timeout: 60000 });
    } catch {
      console.log('  npm install failed, continuing anyway...');
    }

    // Start dev server
    console.log('  Starting dev server...');
    const server = execSync('npm run dev &', { stdio: 'pipe' });

    // Wait for server
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Capture screenshots
    console.log('  Capturing screenshots...');
    try {
      await captureCommit(milestone, baseUrl);
      console.log(`  Done: ${milestone.name}`);
    } catch (error) {
      console.error(`  Failed to capture ${milestone.name}:`, error);
    }

    // Kill dev server (best effort)
    try {
      if (process.platform === 'win32') {
        execSync('taskkill /F /IM node.exe /T', { stdio: 'pipe' });
      } else {
        execSync('pkill -f "vite"', { stdio: 'pipe' });
      }
    } catch {
      // Ignore errors
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Return to original branch
  console.log(`\nReturning to ${currentBranch}...`);
  execSync(`git checkout ${currentBranch}`, { stdio: 'pipe' });
  execSync('npm install', { stdio: 'pipe' });

  console.log('\n=== Historical capture complete ===\n');
  console.log('Screenshots saved to docs/visual-history/');
  console.log('Remember to commit these files!');
}

main().catch(console.error);
