/**
 * Lighthouse Performance Audit Script
 *
 * Runs Lighthouse LIGHTHOUSE_RUNS times (default 3) and reports the median
 * run selected by Total Blocking Time — the most variable metric. This
 * approach follows the Lighthouse team's recommendation for stable CI results
 * on shared runners where a single run can be skewed by transient CPU load.
 *
 * Run with: npx tsx scripts/capture-lighthouse.ts "milestone-name"
 *
 * Output: docs/performance-history/YYYY-MM-DD_HHMM_milestone-name/
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import * as fs from 'fs';
import * as path from 'path';

const RUNS = parseInt(process.env.LIGHTHOUSE_RUNS ?? '3', 10);

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
  runs: number;
  medianRunIndex: number;
  tbtRange: { min: number; max: number };
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

/**
 * Run Lighthouse N times and return the median run selected by TBT.
 * Using the median-by-TBT run (rather than per-metric medians) gives a
 * self-consistent set of metrics from a single real measurement.
 */
async function runMultiple(url: string, runs: number): Promise<{
  medianResult: LighthouseResult;
  medianRunIndex: number;
  tbtRange: { min: number; max: number };
}> {
  const results: LighthouseResult[] = [];

  for (let i = 1; i <= runs; i++) {
    console.log(`  Run ${i}/${runs}...`);
    results.push(await runLighthouse(url));
  }

  // Sort by TBT ascending, pick the middle run
  const sorted = [...results].sort(
    (a, b) =>
      a.audits['total-blocking-time'].numericValue -
      b.audits['total-blocking-time'].numericValue
  );
  const medianIdx = Math.floor(runs / 2);
  const medianResult = sorted[medianIdx];

  const tbts = sorted.map(r => r.audits['total-blocking-time'].numericValue);
  const tbtRange = { min: tbts[0], max: tbts[tbts.length - 1] };

  // Report the 1-based index of the chosen run in the original order
  const medianRunIndex = results.indexOf(medianResult) + 1;

  return { medianResult, medianRunIndex, tbtRange };
}

function formatScore(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 90) return `${percentage} (Good)`;
  if (percentage >= 50) return `${percentage} (Needs Improvement)`;
  return `${percentage} (Poor)`;
}

function formatMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`;
}

function generateMarkdownReport(summary: MetricsSummary): string {
  return `# Lighthouse Performance Report

**Milestone:** ${summary.milestone}
**Captured:** ${summary.capturedAt}
**URL:** ${summary.url}
**Methodology:** Median of ${summary.runs} runs (selected by TBT — run ${summary.medianRunIndex}). TBT range across runs: ${formatMs(summary.tbtRange.min)}–${formatMs(summary.tbtRange.max)}.

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
  // In CI: Use date + branch name for chronological ordering (overwrites same-day pushes)
  // Locally: Use date + time for more granular historical tracking
  const isCI = process.env.CI === 'true';
  const sanitizedName = milestoneName.replace(/\s+/g, '-').toLowerCase();
  const now = new Date();
  const date = now.toISOString().split('T')[0];

  let folderName: string;
  if (isCI) {
    folderName = `${date}_${sanitizedName}`;
  } else {
    const time = now.toTimeString().slice(0, 5).replace(':', ''); // HHMM format
    folderName = `${date}_${time}_${sanitizedName}`;
  }

  const outputDir = path.join(process.cwd(), 'docs', 'performance-history', folderName);

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
  console.log(`Runs: ${RUNS} (reporting median by TBT)`);
  console.log(`Output: ${outputDir}\n`);

  try {
    const { medianResult: result, medianRunIndex, tbtRange } = await runMultiple(baseUrl, RUNS);

    const summary: MetricsSummary = {
      milestone: milestoneName,
      capturedAt: new Date().toISOString(),
      url: baseUrl,
      runs: RUNS,
      medianRunIndex,
      tbtRange,
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
    console.log('\n=== Lighthouse Results (median run) ===\n');
    console.log(`Performance:    ${formatScore(summary.scores.performance)}`);
    console.log(`Accessibility:  ${formatScore(summary.scores.accessibility)}`);
    console.log(`Best Practices: ${formatScore(summary.scores.bestPractices)}`);
    console.log(`SEO:            ${formatScore(summary.scores.seo)}`);
    console.log('\n=== Core Web Vitals ===\n');
    console.log(`FCP: ${summary.metrics.firstContentfulPaint.display}`);
    console.log(`LCP: ${summary.metrics.largestContentfulPaint.display}`);
    console.log(`TBT: ${summary.metrics.totalBlockingTime.display}  (range: ${formatMs(tbtRange.min)}–${formatMs(tbtRange.max)})`);
    console.log(`CLS: ${summary.metrics.cumulativeLayoutShift.display}`);
    console.log(`\nFull report saved to: ${outputDir}/report.md`);

  } catch (error) {
    console.error('Error running Lighthouse:', error);
    console.error('\nMake sure the preview server is running: npm run preview');
    process.exit(1);
  }
}

main().catch(console.error);
