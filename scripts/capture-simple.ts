/**
 * Simple screenshot capture script for historical milestones
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
};

const COLORS_URL = '?colors=1a1a1a,ffffff,0066cc,dc2626&labels=Dark,White,Blue,Red';

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
  const page = await browser.newPage();

  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    await page.setViewportSize(viewport);

    // Empty state
    await page.goto(baseUrl);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, `${name}-empty.png`), fullPage: true });
    console.log(`  ${name}-empty.png`);

    // With colors
    await page.goto(baseUrl + COLORS_URL);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, `${name}-colors.png`), fullPage: true });
    console.log(`  ${name}-colors.png`);
  }

  // Metadata
  fs.writeFileSync(
    path.join(outputDir, 'metadata.json'),
    JSON.stringify({ milestone: milestoneName, capturedAt: new Date().toISOString() }, null, 2)
  );

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
