/**
 * Visual History Capture Script
 *
 * Captures a standard set of screenshots for documenting UI evolution.
 * Run with: npx tsx scripts/capture-visual-milestone.ts "milestone-name"
 *
 * Output: docs/visual-history/YYYY-MM-DD_milestone-name/
 */

import { chromium, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

const THEMES = ['light', 'dark', 'high-contrast'] as const;

const SAMPLE_COLORS = [
  { hex: '#1a1a1a', label: 'Dark' },
  { hex: '#ffffff', label: 'White' },
  { hex: '#0066cc', label: 'Blue' },
  { hex: '#dc2626', label: 'Red' },
];

async function waitForApp(page: Page): Promise<void> {
  await page.waitForFunction(() => customElements.get('app-shell') !== undefined);
  await page.waitForTimeout(300);
}

async function setTheme(page: Page, theme: string): Promise<void> {
  const themeButton = page.locator(`theme-switcher button[title="${theme === 'high-contrast' ? 'High' : theme.charAt(0).toUpperCase() + theme.slice(1)}"]`);
  await themeButton.click();
  await page.waitForTimeout(200);
}

async function addColors(page: Page): Promise<void> {
  const colorInput = page.locator('color-palette').locator('color-input');
  const textInput = colorInput.locator('input[type="text"]').first();
  const addButton = page.locator('color-palette color-input .add-btn');

  for (const color of SAMPLE_COLORS) {
    await textInput.fill(color.hex);
    await addButton.click();
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);
}

async function captureScreenshot(
  page: Page,
  outputDir: string,
  viewport: keyof typeof VIEWPORTS,
  theme: string,
  state: 'empty' | 'colors'
): Promise<void> {
  const filename = `${viewport}-${theme}-${state}.png`;
  const filepath = path.join(outputDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  console.log(`  Captured: ${filename}`);
}

async function captureAllVariants(page: Page, outputDir: string, baseUrl: string): Promise<void> {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\nViewport: ${viewportName} (${viewport.width}x${viewport.height})`);
    await page.setViewportSize(viewport);

    for (const theme of THEMES) {
      // Empty state
      await page.goto(baseUrl);
      await waitForApp(page);
      await setTheme(page, theme);
      await captureScreenshot(page, outputDir, viewportName as keyof typeof VIEWPORTS, theme, 'empty');

      // With colors
      await page.goto(baseUrl);
      await waitForApp(page);
      await setTheme(page, theme);
      await addColors(page);
      await captureScreenshot(page, outputDir, viewportName as keyof typeof VIEWPORTS, theme, 'colors');
    }
  }
}

async function main(): Promise<void> {
  const milestoneName = process.argv[2];

  if (!milestoneName) {
    console.error('Usage: npx tsx scripts/capture-visual-milestone.ts "milestone-name"');
    console.error('Example: npx tsx scripts/capture-visual-milestone.ts "initial-release"');
    process.exit(1);
  }

  // Create output directory
  // In CI: Use date + branch name for chronological ordering (overwrites same-day pushes)
  // Locally: Use date + time for more granular historical tracking
  const isCI = process.env.CI === 'true';
  const sanitizedName = milestoneName.replace(/\s+/g, '-').toLowerCase();
  const now = new Date();
  const date = now.toISOString().split('T')[0];

  let folderName: string;
  if (isCI) {
    // CI: Date + branch name (same-day pushes overwrite, maintains date ordering)
    folderName = `${date}_${sanitizedName}`;
  } else {
    // Local: Date + time for more granular historical tracking
    const time = now.toISOString().split('T')[1].slice(0, 5).replace(':', '');
    folderName = `${date}_${time}_${sanitizedName}`;
  }

  const outputDir = path.join(process.cwd(), 'docs', 'visual-history', folderName);

  // In CI, overwrite existing folder; locally, error to prevent accidental overwrites
  if (fs.existsSync(outputDir)) {
    if (isCI) {
      fs.rmSync(outputDir, { recursive: true });
      console.log(`Overwriting existing snapshot: ${folderName}`);
    } else {
      console.error(`Error: Directory already exists: ${outputDir}`);
      console.error('Choose a different milestone name or delete the existing directory.');
      process.exit(1);
    }
  }

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`\nCapturing visual milestone: ${milestoneName}`);
  console.log(`Output directory: ${outputDir}\n`);

  // Start dev server check
  const baseUrl = process.env.BASE_URL || 'http://localhost:5173';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test if server is running
    try {
      await page.goto(baseUrl, { timeout: 5000 });
    } catch {
      console.error(`Error: Could not connect to ${baseUrl}`);
      console.error('Make sure the dev server is running: npm run dev');
      process.exit(1);
    }

    await captureAllVariants(page, outputDir, baseUrl);

    // Create metadata file
    const metadata = {
      milestone: milestoneName,
      capturedAt: new Date().toISOString(),
      viewports: VIEWPORTS,
      themes: THEMES,
      sampleColors: SAMPLE_COLORS,
      screenshots: fs.readdirSync(outputDir).filter(f => f.endsWith('.png')),
    };

    fs.writeFileSync(
      path.join(outputDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );

    console.log(`\nCapture complete! ${metadata.screenshots.length} screenshots saved.`);
    console.log(`View them at: ${outputDir}`);

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
