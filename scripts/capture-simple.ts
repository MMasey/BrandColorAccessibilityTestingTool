/**
 * Simple screenshot capture script for historical milestones
 * Captures screenshots in light, dark, and high-contrast themes
 */
import { chromium, type Browser } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const THEMES = ['light', 'dark', 'high-contrast'] as const;

const COLORS_URL = '?colors=1a1a1a,ffffff,0066cc,dc2626&labels=Dark,White,Blue,Red';

async function captureForTheme(
  browser: Browser,
  outputDir: string,
  baseUrl: string,
  theme: typeof THEMES[number]
): Promise<void> {
  // Set up context based on theme
  const contextOptions: Parameters<Browser['newContext']>[0] = {};

  if (theme === 'light') {
    contextOptions.colorScheme = 'light';
  } else if (theme === 'dark') {
    contextOptions.colorScheme = 'dark';
  } else if (theme === 'high-contrast') {
    // High contrast uses forcedColors at context level
    contextOptions.colorScheme = 'light';
    contextOptions.forcedColors = 'active';
  }

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  // For high-contrast, also apply contrast media emulation
  if (theme === 'high-contrast') {
    await page.emulateMedia({ colorScheme: 'light', forcedColors: 'active' });
  }

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(viewport);

    // Empty state
    await page.goto(baseUrl);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, `${name}-${theme}-empty.png`),
      fullPage: true
    });
    console.log(`  ${name}-${theme}-empty.png`);

    // With colors
    await page.goto(baseUrl + COLORS_URL);
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(outputDir, `${name}-${theme}-colors.png`),
      fullPage: true
    });
    console.log(`  ${name}-${theme}-colors.png`);
  }

  await page.close();
  await context.close();
}

async function main() {
  const milestoneName = process.argv[2] || 'historical';
  const baseUrl = process.argv[3] || 'http://localhost:5173';

  const date = new Date().toISOString().split('T')[0];
  const outputDir = path.join(process.cwd(), 'docs', 'visual-history', `${date}_${milestoneName}`);

  if (fs.existsSync(outputDir)) {
    console.log(`Directory exists: ${outputDir}`);
    console.log('Delete it first or use a different name.');
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Capturing to: ${outputDir}`);

  const browser = await chromium.launch();

  for (const theme of THEMES) {
    console.log(`\nTheme: ${theme}`);
    await captureForTheme(browser, outputDir, baseUrl, theme);
  }

  // Metadata
  const screenshots = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify({
      milestone: milestoneName,
      capturedAt: new Date().toISOString(),
      themes: [...THEMES],
      viewports: Object.keys(VIEWPORTS),
      screenshots
    }, null, 2)
  );

  await browser.close();
  console.log(`\nDone! ${screenshots.length} screenshots captured.`);
}

main().catch(console.error);
