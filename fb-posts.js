/**
 * Facebook Pages — Post Scheduler for Maestría IA
 *
 * Posts the 12 images from /social/shared with their captions
 * to Page A (Maestría IA) and Page B (Maestría IA Academia).
 *
 * Modes:
 *   node fb-posts.js list                       → show parsed captions + post status
 *   node fb-posts.js post a 1                   → post #1 to Page A immediately
 *   node fb-posts.js post b 1                   → post #1 to Page B immediately
 *   node fb-posts.js run-day N                  → post the scheduled items for day N (1..19)
 *   node fb-posts.js run-today                  → infer day from launchDate in state, post due items
 *   node fb-posts.js set-launch YYYY-MM-DD      → set the campaign launch date
 *
 * Schedule (from captions.md):
 *   Day  1 → post 01 both pages
 *   Day  2 → post 02 both
 *   Day  3 → post 03 both
 *   Day  4 → post 06 both
 *   Day  5 → post 04 both
 *   Day  7 → post 07 both
 *   Day  9 → post 08 both
 *   Day 11 → post 09 both
 *   Day 13 → post 10 both
 *   Day 15 → post 05 both
 *   Day 17 → post 11 both
 *   Day 19 → post 12 both
 *
 * State stored in fb-state.json so reruns are idempotent.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERDATA = path.join(__dirname, '.pw-userdata');
const STATE_FILE = path.join(__dirname, 'fb-state.json');
const SHARED = path.join(__dirname, 'social/shared');
const CAPTIONS_FILE = path.join(__dirname, 'social/captions.md');

// Page IDs (from discovery)
const PAGE_A_ID = '61590243590991'; // Maestría IA (was "Maestría Video")
const PAGE_B_ID = '61589950864838'; // Maestría IA Academia

const SCHEDULE = [
  { day: 1,  postNum: 1  },
  { day: 2,  postNum: 2  },
  { day: 3,  postNum: 3  },
  { day: 4,  postNum: 6  },
  { day: 5,  postNum: 4  },
  { day: 7,  postNum: 7  },
  { day: 9,  postNum: 8  },
  { day: 11, postNum: 9  },
  { day: 13, postNum: 10 },
  { day: 15, postNum: 5  },
  { day: 17, postNum: 11 },
  { day: 19, postNum: 12 },
];

const POST_FILES = {
  1:  '01_esto_es_ia.png',
  2:  '02_contenido_social.png',
  3:  '03_cualquier_estilo.png',
  4:  '04_30_segundos.png',
  5:  '05_sin_camara.png',
  6:  '06_video_viral.png',
  7:  '07_20k_creadores.png',
  8:  '08_9_usd.png',
  9:  '09_nadie_te_ensena.png',
  10: '10_el_futuro.png',
  11: '11_cero_a_viral.png',
  12: '12_desbloquea.png',
};

// ---------- state ----------
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); } catch { return {}; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

function postKey(page, num) { return `posted_${page}_${num}`; }
function isPosted(page, num) {
  const s = loadState();
  return !!s[postKey(page, num)];
}
function markPosted(page, num, url) {
  const s = loadState();
  s[postKey(page, num)] = { at: new Date().toISOString(), url };
  saveState(s);
}

// ---------- captions parsing ----------
function parseCaptions() {
  const text = fs.readFileSync(CAPTIONS_FILE, 'utf-8');
  const result = { a: {}, b: {} };
  // Split into two halves by the Page B header
  const splitMarker = '## 🎓 Page B';
  const idx = text.indexOf(splitMarker);
  if (idx === -1) throw new Error('Could not find Page B section in captions.md');
  const partA = text.substring(0, idx);
  const partB = text.substring(idx);
  parseSection(partA, result.a);
  parseSection(partB, result.b);
  return result;
}

function parseSection(text, out) {
  // Match: ### N. → `XX_filename.png`\n(optional **Hook:** etc)\n<body>\n
  const re = /###\s+(\d+)\.\s+→\s+`([^`]+)`\s*\n([\s\S]*?)(?=\n###\s+\d+\.|\n---|\n##\s+|$)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const filename = m[2];
    const body = m[3].trim();
    out[num] = { num, filename, body };
  }
}

// ---------- helpers ----------
async function openContext() {
  if (!fs.existsSync(USERDATA)) fs.mkdirSync(USERDATA, { recursive: true });
  const ctx = await chromium.launchPersistentContext(USERDATA, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  return ctx;
}

async function ensureLoggedIn(page) {
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const cookies = await page.context().cookies('https://www.facebook.com');
  if (!cookies.some(c => c.name === 'c_user')) {
    throw new Error('Not logged in. Run: node fb-pages.js login');
  }
  console.log('✓ Logged in.');
}

// ---------- core: post a single image+caption to a Page ----------
async function postOne(pageLetter, postNum) {
  const pageId = pageLetter === 'a' ? PAGE_A_ID : PAGE_B_ID;
  const captions = parseCaptions();
  const cap = captions[pageLetter][postNum];
  if (!cap) throw new Error(`No caption found for page=${pageLetter} post=${postNum}`);
  const imagePath = path.join(SHARED, POST_FILES[postNum]);
  if (!fs.existsSync(imagePath)) throw new Error(`Image not found: ${imagePath}`);

  if (isPosted(pageLetter, postNum)) {
    console.log(`⏭  Already posted: ${pageLetter}#${postNum}. Skipping.`);
    return;
  }

  console.log(`→ Posting Page ${pageLetter.toUpperCase()} post #${postNum}`);
  console.log(`  caption: "${cap.body.substring(0, 60)}..."`);
  console.log(`  image: ${POST_FILES[postNum]}`);

  const ctx = await openContext();
  const page = await ctx.newPage();
  try {
    await ensureLoggedIn(page);

    // Open the Page's main view
    await page.goto(`https://www.facebook.com/profile.php?id=${pageId}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Switch into Page admin mode if "Switch Now" banner is visible
    const switchBtn = page.locator('div[role="button"]:has-text("Switch Now"), a:has-text("Switch Now")').first();
    if (await switchBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('  → Switching into Page admin mode');
      await switchBtn.click();
      await page.waitForTimeout(4000);
    }

    // Click the composer "What's on your mind?" or "Create post" area
    const composer = page.locator('div[role="button"]:has-text("What\'s on your mind"), div[role="button"]:has-text("Create post"), span:has-text("What\'s on your mind")').first();
    if (await composer.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('  → Opening composer');
      await composer.click();
      await page.waitForTimeout(3000);
    }

    // Type the caption
    const captionField = page.locator('div[contenteditable="true"][role="textbox"]').first();
    await captionField.click();
    await page.keyboard.type(cap.body, { delay: 5 });
    console.log('  → Caption typed');
    await page.waitForTimeout(2000);

    // Click the photo/video upload button to expose the file input
    const photoBtn = page.locator('div[aria-label="Photo/video"], div[aria-label*="Photo"], div[role="button"]:has-text("Photo/video")').first();
    if (await photoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await photoBtn.click();
      console.log('  → Clicked Photo/video');
      await page.waitForTimeout(2000);
    }

    // Upload the image
    const fileInputs = page.locator('input[type="file"][accept*="image"]');
    const fileInput = fileInputs.last(); // composer's input is usually the last
    await fileInput.setInputFiles(imagePath);
    console.log('  → Image attached');
    await page.waitForTimeout(5000);

    // Click Post / Publish
    const postBtn = page.locator('div[role="button"][aria-label="Post"], div[role="button"]:has-text("Post"):not(:has-text("Posts"))').first();
    if (await postBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await postBtn.click();
      console.log('  → Post submitted');
      await page.waitForTimeout(6000);
    } else {
      throw new Error('Post button not found');
    }

    // Capture the resulting URL if possible
    const url = page.url();
    markPosted(pageLetter, postNum, url);
    console.log(`  ✓ Posted! State updated.`);
    await page.screenshot({ path: `/tmp/post-${pageLetter}-${postNum}.png` });
  } finally {
    await ctx.close();
  }
}

// ---------- batch: run a specific day ----------
async function runDay(dayNum) {
  const entry = SCHEDULE.find(e => e.day === dayNum);
  if (!entry) {
    console.log(`No posts scheduled for day ${dayNum}.`);
    return;
  }
  console.log(`━━━ Day ${dayNum}: posting #${entry.postNum} to both pages ━━━`);
  await postOne('a', entry.postNum);
  // Stagger 3+ minutes between pages
  console.log('⏱  Sleeping 3 min before Page B (anti-spam)…');
  await new Promise(r => setTimeout(r, 3 * 60 * 1000));
  await postOne('b', entry.postNum);
}

// ---------- run-today: infer day from launch ----------
async function runToday() {
  const s = loadState();
  if (!s.launchDate) {
    throw new Error('No launchDate in state. Run: node fb-posts.js set-launch YYYY-MM-DD');
  }
  const launch = new Date(s.launchDate);
  const now = new Date();
  const dayNum = Math.floor((now - launch) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`Campaign day ${dayNum} (launched ${s.launchDate})`);
  if (dayNum < 1) {
    console.log('Campaign hasn\'t started yet.');
    return;
  }
  if (dayNum > 19) {
    console.log('Campaign complete (3 weeks elapsed).');
    return;
  }
  await runDay(dayNum);
}

// ---------- list: show schedule + status ----------
function modeList() {
  const captions = parseCaptions();
  console.log('SCHEDULE STATUS:\n');
  console.log('Day  Post  Page A         Page B         Image');
  console.log('───  ────  ─────────────  ─────────────  ─────────────────────────');
  for (const { day, postNum } of SCHEDULE) {
    const aDone = isPosted('a', postNum) ? '✓ posted' : '⏳ pending';
    const bDone = isPosted('b', postNum) ? '✓ posted' : '⏳ pending';
    console.log(`${String(day).padStart(2)}   ${String(postNum).padStart(2)}    ${aDone.padEnd(13)}  ${bDone.padEnd(13)}  ${POST_FILES[postNum]}`);
  }
  const s = loadState();
  if (s.launchDate) console.log(`\nLaunch date: ${s.launchDate}`);
  else console.log('\nLaunch date not set. Run: node fb-posts.js set-launch YYYY-MM-DD');
}

// ---------- set-launch ----------
function modeSetLaunch(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Date must be YYYY-MM-DD');
  }
  const s = loadState();
  s.launchDate = dateStr;
  saveState(s);
  console.log(`✓ Launch date set: ${dateStr}`);
}

// ---------- MAIN ----------
const mode = process.argv[2] || 'help';
try {
  if (mode === 'list') {
    modeList();
  } else if (mode === 'post') {
    const pageLetter = process.argv[3];
    const num = parseInt(process.argv[4], 10);
    if (!['a', 'b'].includes(pageLetter) || !Number.isFinite(num)) {
      throw new Error('Usage: node fb-posts.js post <a|b> <1..12>');
    }
    await postOne(pageLetter, num);
  } else if (mode === 'run-day') {
    const d = parseInt(process.argv[3], 10);
    await runDay(d);
  } else if (mode === 'run-today') {
    await runToday();
  } else if (mode === 'set-launch') {
    modeSetLaunch(process.argv[3]);
  } else {
    console.log('Usage:');
    console.log('  node fb-posts.js list                  → show schedule + status');
    console.log('  node fb-posts.js post a 1              → post #1 to Page A now');
    console.log('  node fb-posts.js post b 1              → post #1 to Page B now');
    console.log('  node fb-posts.js run-day 5             → run day 5 (both pages)');
    console.log('  node fb-posts.js run-today             → run today\'s posts (based on launchDate)');
    console.log('  node fb-posts.js set-launch 2026-05-19 → set campaign launch date');
  }
} catch (e) {
  console.error('✗', e.message);
  process.exit(1);
}
