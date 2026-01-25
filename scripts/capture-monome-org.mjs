import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, '..');
const OUT_ROOT = path.join(ROOT, 'artifacts', 'screenshots', 'monome-org');
const OUT_DOCS = path.join(OUT_ROOT, 'docs');
const OUT_PRODUCTS = path.join(OUT_ROOT, 'products');
const OUT_META = path.join(OUT_ROOT, 'meta');
const MANIFEST_PATH = path.join(OUT_META, 'manifest.md');

const VIEWPORTS = [
  {
    name: 'desktop',
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    name: 'mobile',
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

// Deterministic captures. Extra deep docs pages are auto-selected from indices.
const FIXED_CAPTURES = [
  // Docs landing + help
  { url: 'https://monome.org/docs/', slug: 'docs__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/', slug: 'docs__index__mid', mode: 'fraction', fraction: 0.45 },
  { url: 'https://monome.org/docs/help', slug: 'docs__help__top', mode: 'fullPage' },

  // Docs section indices (top)
  { url: 'https://monome.org/docs/norns/', slug: 'docs__norns__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/grid/', slug: 'docs__grid__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/arc/', slug: 'docs__arc__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/crow/', slug: 'docs__crow__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/teletype/', slug: 'docs__teletype__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/ansible/', slug: 'docs__ansible__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/serialosc/', slug: 'docs__serialosc__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/iii/', slug: 'docs__iii__index__top', mode: 'fullPage' },
  { url: 'https://monome.org/docs/legacy/', slug: 'docs__legacy__index__top', mode: 'fullPage' },

  // Product/commercial/top-level
  { url: 'https://monome.org/', slug: 'home__hero', mode: 'scrollY', scrollY: 0 },
  { url: 'https://monome.org/', slug: 'home__products', mode: 'fraction', fraction: 0.33 },
  { url: 'https://monome.org/', slug: 'home__lower', mode: 'bottom' },
  { url: 'https://monome.org/policy.html', slug: 'policy__top', mode: 'fullPage' },
  { url: 'https://monome.org/past.html', slug: 'past__top', mode: 'fullPage' },
  { url: 'https://monome.org/bstock.html', slug: 'bstock__top', mode: 'fullPage' },
  { url: 'https://monome.org/old.html', slug: 'old__top', mode: 'fullPage' },
];

const DEEP_DOCS_SEEDS = [
  'https://monome.org/docs/norns/',
  'https://monome.org/docs/grid/',
  'https://monome.org/docs/crow/',
  'https://monome.org/docs/serialosc/',
  'https://monome.org/docs/teletype/',
];

const DEEP_DOCS_LIMIT = 10;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeUrl(u) {
  try {
    const url = new URL(u);
    url.hash = '';
    // Keep trailing slash normalization stable.
    if (url.pathname !== '/' && url.pathname.endsWith('/')) return url.toString();
    return url.toString();
  } catch {
    return null;
  }
}

function slugFromUrl(urlStr) {
  const url = new URL(urlStr);
  let p = url.pathname;
  if (p === '/') return 'home';
  p = p.replace(/\.html$/i, '');
  p = p.replace(/^\/+/, '').replace(/\/+$/, '');
  const parts = p.split('/').filter(Boolean);
  const raw = parts.join('__');
  return raw
    .replace(/[^a-zA-Z0-9_]+/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

function outDirForUrl(urlStr) {
  const url = new URL(urlStr);
  if (url.pathname.startsWith('/docs/')) return OUT_DOCS;
  return OUT_PRODUCTS;
}

function filenameFor(captureSlug, viewportName) {
  return `${captureSlug}__${viewportName}.png`;
}

async function ensureDirs() {
  await fs.mkdir(OUT_DOCS, { recursive: true });
  await fs.mkdir(OUT_PRODUCTS, { recursive: true });
  await fs.mkdir(OUT_META, { recursive: true });
}

async function dismissCommonOverlays(page, notes) {
  const candidates = [
    '#onetrust-accept-btn-handler',
    'button:has-text("Accept")',
    'button:has-text("I accept")',
    'button:has-text("Agree")',
    'button:has-text("OK")',
    'button:has-text("Got it")',
    'button[aria-label="Close"]',
    'button:has-text("Close")',
  ];

  for (const sel of candidates) {
    try {
      const loc = page.locator(sel).first();
      if (await loc.isVisible({ timeout: 750 })) {
        await loc.click({ timeout: 1500 }).catch(() => {});
        notes.push(`dismissed overlay via ${sel}`);
        await sleep(400);
      }
    } catch {
      // ignore
    }
  }
}

async function scrollToMode(page, mode, data, viewport) {
  if (mode === 'scrollY') {
    const y = Math.max(0, Number(data.scrollY || 0));
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    return;
  }

  if (mode === 'fraction') {
    const f = Math.min(1, Math.max(0, Number(data.fraction ?? 0)));
    await page.evaluate(
      ({ fraction, vh }) => {
        const doc = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.offsetHeight
        );
        const maxScroll = Math.max(0, doc - vh);
        window.scrollTo(0, Math.floor(maxScroll * fraction));
      },
      { fraction: f, vh: viewport.height }
    );
    return;
  }

  if (mode === 'bottom') {
    await page.evaluate((vh) => {
      const doc = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      window.scrollTo(0, Math.max(0, doc - vh));
    }, viewport.height);
    return;
  }
}

async function collectDeepDocsUrls(browser, notes) {
  const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
  const urls = new Set();

  for (const seed of DEEP_DOCS_SEEDS) {
    try {
      await page.goto(seed, { waitUntil: 'networkidle', timeout: 60000 });
      await sleep(800);
      await dismissCommonOverlays(page, notes);
      const hrefs = await page.evaluate(() => {
        const as = Array.from(document.querySelectorAll('a[href]'));
        return as
          .map((a) => a.getAttribute('href'))
          .filter(Boolean)
          .slice(0, 2000);
      });

      for (const href of hrefs) {
        try {
          const abs = new URL(href, seed).toString();
          const n = normalizeUrl(abs);
          if (!n) continue;
          const u = new URL(n);
          if (u.hostname !== 'monome.org') continue;
          if (!u.pathname.startsWith('/docs/')) continue;
          if (u.pathname === '/docs/' || u.pathname === '/docs/help') continue;
          if (u.pathname.endsWith('/')) {
            // ok
          }
          urls.add(u.toString());
        } catch {
          // ignore
        }
      }
    } catch {
      notes.push(`seed crawl failed: ${seed}`);
    }
  }

  await page.close();

  const priority = [
    '/reference',
    '/install',
    '/setup',
    '/api',
    '/osc',
    '/protocol',
    '/dictionary',
    '/scripts',
    '/faq',
  ];

  const scored = Array.from(urls)
    .filter((u) => !u.includes('#'))
    .map((u) => {
      const p = new URL(u).pathname.toLowerCase();
      let score = 0;
      for (let i = 0; i < priority.length; i++) {
        if (p.includes(priority[i])) score += 50 - i;
      }
      score += Math.min(10, p.split('/').length);
      return { u, score };
    })
    .sort((a, b) => b.score - a.score || a.u.localeCompare(b.u));

  return scored.slice(0, DEEP_DOCS_LIMIT).map((x) => x.u);
}

async function captureOne(page, capture, viewport, notes) {
  const outDir = outDirForUrl(capture.url);
  const file = filenameFor(capture.slug, viewport.name);
  const outPath = path.join(outDir, file);

  const response = await page.goto(capture.url, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });

  const status = response?.status?.() ?? null;
  if (status && status >= 400) {
    notes.push(`HTTP ${status} at ${capture.url}`);
  }

  await sleep(900);
  await dismissCommonOverlays(page, notes);
  await sleep(400);

  if (capture.mode !== 'fullPage') {
    await scrollToMode(page, capture.mode, capture, viewport);
    await sleep(600);
  }

  await page.screenshot({ path: outPath, fullPage: capture.mode === 'fullPage' });

  return {
    url: capture.url,
    slug: capture.slug,
    viewport: viewport.name,
    file: path.relative(ROOT, outPath).replace(/\\/g, '/'),
    mode: capture.mode,
  };
}

async function main() {
  await ensureDirs();

  const { chromium } = require('playwright');
  const playwrightVersion = require('playwright/package.json').version;

  const run = {
    startedAt: new Date(),
    localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    playwrightVersion,
    browserName: 'chromium',
    browserVersion: null,
    viewports: VIEWPORTS.map((v) => ({ name: v.name, width: v.width, height: v.height })),
    notes: [],
    items: [],
  };

  const browser = await chromium.launch({ headless: true });
  run.browserVersion = browser.version();

  const deepDocs = await collectDeepDocsUrls(browser, run.notes);
  const deepCaptures = deepDocs.map((u) => {
    const base = slugFromUrl(u);
    return {
      url: u,
      slug: `${base}__top`,
      mode: 'fullPage',
    };
  });

  const captures = [...FIXED_CAPTURES, ...deepCaptures]
    .map((c) => ({ ...c, url: normalizeUrl(c.url) }))
    .filter((c) => c.url);

  // Stable ordering for deterministic filenames + manifest.
  captures.sort((a, b) => a.slug.localeCompare(b.slug) || a.url.localeCompare(b.url));

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.deviceScaleFactor,
      isMobile: viewport.isMobile,
      hasTouch: viewport.hasTouch,
    });
    const page = await context.newPage();

    for (const capture of captures) {
      try {
        const item = await captureOne(page, capture, viewport, run.notes);
        run.items.push(item);
        // eslint-disable-next-line no-console
        console.log(`[${viewport.name}] ${capture.slug} -> ${item.file}`);
      } catch (err) {
        run.notes.push(`capture failed (${viewport.name}) ${capture.slug}: ${String(err?.message || err)}`);
      }
    }

    await context.close();
  }

  await browser.close();

  const startedIso = run.startedAt.toISOString();
  const finishedIso = new Date().toISOString();

  const lines = [];
  lines.push('# monome.org screenshot manifest');
  lines.push('');
  lines.push(`- capture_started_utc: ${startedIso}`);
  lines.push(`- capture_finished_utc: ${finishedIso}`);
  lines.push(`- local_timezone: ${run.localTimezone}`);
  lines.push(`- browser: ${run.browserName} (${run.browserVersion || 'unknown'})`);
  lines.push(`- playwright: ${run.playwrightVersion || 'unknown'}`);
  lines.push(`- viewports: ${run.viewports.map((v) => `${v.name} ${v.width}x${v.height}`).join(' | ')}`);
  lines.push('');

  if (run.notes.length) {
    lines.push('## Notes');
    for (const n of run.notes) lines.push(`- ${n}`);
    lines.push('');
  }

  lines.push('## Captures');
  lines.push('');
  lines.push('| URL | Viewport | Mode | Screenshot |');
  lines.push('| --- | --- | --- | --- |');

  // Stable ordering (url then viewport).
  run.items
    .slice()
    .sort((a, b) => a.url.localeCompare(b.url) || a.viewport.localeCompare(b.viewport) || a.file.localeCompare(b.file))
    .forEach((it) => {
      // Backticks inside template literals are easy to get wrong; build the row explicitly.
      lines.push(`| ${it.url} | ${it.viewport} | ${it.mode} | \`${it.file}\` |`);
    });

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('Generated by `scripts/capture-monome-org.mjs`.');
  lines.push('');

  await fs.writeFile(MANIFEST_PATH, lines.join('\n'), 'utf8');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
