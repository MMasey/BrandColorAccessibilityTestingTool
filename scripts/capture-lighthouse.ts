/**
 * Lighthouse Performance Audit Script
 *
 * Captures Lighthouse metrics for tracking performance over time.
 * Run with: npx tsx scripts/capture-lighthouse.ts "milestone-name"
 *
 * Output: docs/performance-history/YYYY-MM-DD_HHMM_milestone-name/
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import * as path from 'path';

interface LighthouseResult {
  categories: {
    performance: { score: number };
    accessibility: { score: number };
    'best-practices': { score: number };
    seo: { score: number };
  };
  audits: {
    'first-contentful-paint': { numericValue: number; displayValue: string };
    'largest-contentful-paint': { numericValue: number; displayValue: string };
    'total-blocking-time': { numericValue: number; displayValue: string };
    'cumulative-layout-shift': { numericValue: number; displayValue: string };
    'speed-index': { numericValue: number; displayValue: string };
    'interactive': { numericValue: number; displayValue: string };
  };
}

interface MetricsSummary {
  milestone: string;
  capturedAt: string;
  url: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    firstContentfulPaint: { value: number; display: string };
    largestContentfulPaint: { value: number; display: string };
    totalBlockingTime: { value: number; display: string };
    cumulativeLayoutShift: { value: number; display: string };
    speedIndex: { value: number; display: string };
    timeToInteractive: { value: number; display: string };
  };
}

async function runLighthouse(url: string): Promise<LighthouseResult> {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });

  try {
    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const result = await lighthouse(url, options);
    if (!result) {
      throw new Error('Lighthouse returned no result');
    }

    return result.lhr as unknown as LighthouseResult;
  } finally {
    await chrome.kill();
  }
}

function formatScore(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 90) return `${percentage} (Good)`;
  if (percentage >= 50) return `${percentage} (Needs Improvement)`;
  return `${percentage} (Poor)`;
}

function generateMarkdownReport(summary: MetricsSummary): string {
  return `# Lighthouse Performance Report

**Milestone:** ${summary.milestone}
**Captured:** ${summary.capturedAt}
**URL:** ${summary.url}

## Scores

| Category | Score |
|----------|-------|
| Performance | ${formatScore(summary.scores.performance)} |
| Accessibility | ${formatScore(summary.scores.accessibility)} |
| Best Practices | ${formatScore(summary.scores.bestPractices)} |
| SEO | ${formatScore(summary.scores.seo)} |

## Core Web Vitals

| Metric | Value |
|--------|-------|
| First Contentful Paint (FCP) | ${summary.metrics.firstContentfulPaint.display} |
| Largest Contentful Paint (LCP) | ${summary.metrics.largestContentfulPaint.display} |
| Total Blocking Time (TBT) | ${summary.metrics.totalBlockingTime.display} |
| Cumulative Layout Shift (CLS) | ${summary.metrics.cumulativeLayoutShift.display} |
| Speed Index | ${summary.metrics.speedIndex.display} |
| Time to Interactive | ${summary.metrics.timeToInteractive.display} |

## Performance Goals

- Performance: ${summary.scores.performance >= 0.9 ? '✅' : '❌'} Target ≥ 90
- Accessibility: ${summary.scores.accessibility >= 1.0 ? '✅' : '❌'} Target = 100
- Best Practices: ${summary.scores.bestPractices >= 0.9 ? '✅' : '❌'} Target ≥ 90
- SEO: ${summary.scores.seo >= 0.9 ? '✅' : '❌'} Target ≥ 90
`;
}

async function main(): Promise<void> {
  const milestoneName = process.argv[2];

  if (!milestoneName) {
    console.error('Usage: npx tsx scripts/capture-lighthouse.ts "milestone-name"');
    console.error('Example: npx tsx scripts/capture-lighthouse.ts "initial-release"');
    process.exit(1);
  }

  // Create output directory
  // In CI, use just the milestone name so each push overwrites the previous snapshot
  // Locally, use timestamp prefix for historical tracking
  const isCI = process.env.CI === 'true';
  const sanitizedName = milestoneName.replace(/\s+/g, '-').toLowerCase();

  let folderName: string;
  if (isCI) {
    // CI: Use just milestone name (overwrites on each push to same PR)
    folderName = sanitizedName;
  } else {
    // Local: Use timestamp prefix for historical tracking
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM format
    folderName = `${date}_${time}_${sanitizedName}`;
  }

  const outputDir = path.join(process.cwd(), 'docs', 'performance-history', folderName);

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

  const baseUrl = process.env.BASE_URL || 'http://localhost:4173';

  console.log(`\nRunning Lighthouse audit: ${milestoneName}`);
  console.log(`URL: ${baseUrl}`);
  console.log(`Output: ${outputDir}\n`);

  try {
    console.log('Running Lighthouse (this may take a minute)...');
    const result = await runLighthouse(baseUrl);

    const summary: MetricsSummary = {
      milestone: milestoneName,
      capturedAt: new Date().toISOString(),
      url: baseUrl,
      scores: {
        performance: result.categories.performance.score,
        accessibility: result.categories.accessibility.score,
        bestPractices: result.categories['best-practices'].score,
        seo: result.categories.seo.score,
      },
      metrics: {
        firstContentfulPaint: {
          value: result.audits['first-contentful-paint'].numericValue,
          display: result.audits['first-contentful-paint'].displayValue,
        },
        largestContentfulPaint: {
          value: result.audits['largest-contentful-paint'].numericValue,
          display: result.audits['largest-contentful-paint'].displayValue,
        },
        totalBlockingTime: {
          value: result.audits['total-blocking-time'].numericValue,
          display: result.audits['total-blocking-time'].displayValue,
        },
        cumulativeLayoutShift: {
          value: result.audits['cumulative-layout-shift'].numericValue,
          display: result.audits['cumulative-layout-shift'].displayValue,
        },
        speedIndex: {
          value: result.audits['speed-index'].numericValue,
          display: result.audits['speed-index'].displayValue,
        },
        timeToInteractive: {
          value: result.audits['interactive'].numericValue,
          display: result.audits['interactive'].displayValue,
        },
      },
    };

    // Save JSON summary
    fs.writeFileSync(
      path.join(outputDir, 'metrics.json'),
      JSON.stringify(summary, null, 2)
    );

    // Save markdown report
    fs.writeFileSync(
      path.join(outputDir, 'report.md'),
      generateMarkdownReport(summary)
    );

    // Print summary
    console.log('\n=== Lighthouse Results ===\n');
    console.log(`Performance:    ${formatScore(summary.scores.performance)}`);
    console.log(`Accessibility:  ${formatScore(summary.scores.accessibility)}`);
    console.log(`Best Practices: ${formatScore(summary.scores.bestPractices)}`);
    console.log(`SEO:            ${formatScore(summary.scores.seo)}`);
    console.log('\n=== Core Web Vitals ===\n');
    console.log(`FCP: ${summary.metrics.firstContentfulPaint.display}`);
    console.log(`LCP: ${summary.metrics.largestContentfulPaint.display}`);
    console.log(`TBT: ${summary.metrics.totalBlockingTime.display}`);
    console.log(`CLS: ${summary.metrics.cumulativeLayoutShift.display}`);
    console.log(`\nFull report saved to: ${outputDir}/report.md`);

  } catch (error) {
    console.error('Error running Lighthouse:', error);
    console.error('\nMake sure the preview server is running: npm run preview');
    process.exit(1);
  }
}

main().catch(console.error);
