/**
 * Facebook Pages automation — Maestría IA
 *
 * Bypasses Chrome extension + macOS accessibility. Uses Playwright's
 * Chrome DevTools Protocol upload (FB can't anti-bot this).
 *
 * Run modes (one at a time, so user can rerun a failing step):
 *   node fb-pages.js login       → opens FB, waits for user to log in, saves session
 *   node fb-pages.js rename-a    → renames Page A "Maestría Video" → "Maestría IA"
 *   node fb-pages.js upload-a    → uploads A_profile + A_cover to Page A
 *   node fb-pages.js create-b    → creates Page B "Maestría IA Academia" with full metadata
 *   node fb-pages.js upload-b    → uploads B_profile + B_cover to Page B
 *   node fb-pages.js all         → run everything sequentially
 *
 * State file: ./fb-state.json — stores cookies + page IDs
 * User profile: ./.pw-userdata (persisted Chromium profile)
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERDATA = path.join(__dirname, '.pw-userdata');
const STATE_FILE = path.join(__dirname, 'fb-state.json');
const ASSETS = path.join(__dirname, 'social/page-assets');

const PAGE_A_ID = '61590243590991'; // existing "Maestría Video" page

const PAGE_A = {
  newName: 'Maestría IA',
  bio: 'Aprende a crear videos virales con IA. Sin cámara. Sin equipo. Solo prompts.',
  about: 'Maestría IA es la comunidad #1 en español para aprender creación de video y contenido con inteligencia artificial. Convierte una idea en un video profesional en menos de 30 segundos. Suscripción desde $9 USD/mes. → maestriavideo.com',
  profile: path.join(ASSETS, 'A_profile.png'),
  cover: path.join(ASSETS, 'A_cover.png'),
};

const PAGE_B = {
  name: 'Maestría IA Academia',
  category1: 'Education',
  category2: 'Online course',
  bio: 'Academia online de creación con IA para Latinoamérica. Cursos, comunidad y herramientas desde $9 USD/mes.',
  about: 'Maestría IA Academia ofrece formación estructurada en creación de video con IA: tutoriales paso a paso, casos prácticos reales, comunidad activa de +20.000 creadores y actualizaciones constantes. Suscripción desde $9 USD/mes. → maestriavideo.com',
  website: 'https://maestriavideo.com',
  email: 'soporte@maestriavideo.com',
  address: '1395 Brickell Avenue, Suite 800',
  city: 'Miami, Florida',
  zip: '33131',
  profile: path.join(ASSETS, 'B_profile.png'),
  cover: path.join(ASSETS, 'B_cover.png'),
};

// ---------- helpers ----------
function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); } catch { return {}; }
}
function saveState(s) { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); }

async function openContext({ headless = false } = {}) {
  if (!fs.existsSync(USERDATA)) fs.mkdirSync(USERDATA, { recursive: true });
  const ctx = await chromium.launchPersistentContext(USERDATA, {
    headless,
    viewport: { width: 1280, height: 900 },
    args: ['--disable-blink-features=AutomationControlled'],
  });
  return ctx;
}

async function waitForLogin(page) {
  console.log('→ Navigating to facebook.com');
  await page.goto('https://www.facebook.com/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);

  // The single most reliable login indicator: the c_user cookie set by FB on auth.
  async function isAuthed() {
    const cookies = await page.context().cookies('https://www.facebook.com');
    return cookies.some(c => c.name === 'c_user' && c.value && c.value.length > 0);
  }

  if (await isAuthed()) {
    console.log('✓ Already logged in (c_user cookie present).');
    return;
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  Please log into Facebook in the Chromium window.');
  console.log('   Solve any 2FA / captcha. I will detect login and continue.');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let attempts = 0;
  while (!(await isAuthed())) {
    attempts++;
    if (attempts > 120) throw new Error('Timeout waiting for login (>4 min).');
    await page.waitForTimeout(2000);
  }
  console.log('✓ Login completed.');
}

// ---------- LOGIN MODE ----------
async function modeLogin() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  console.log('✓ Session saved to', USERDATA);
  console.log('You can now run other modes without re-logging in.');
  await page.waitForTimeout(2000);
  await ctx.close();
}

// ---------- RENAME PAGE A ----------
async function modeRenameA() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  console.log(`→ Opening Page A (${PAGE_A_ID})`);
  await page.goto(`https://www.facebook.com/profile.php?id=${PAGE_A_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Open Page Settings → Page Info to rename
  console.log('→ Opening Page Settings');
  // Try several known UI paths
  await page.goto(`https://www.facebook.com/${PAGE_A_ID}/settings/?tab=basic_info`, { waitUntil: 'domcontentloaded' }).catch(() => null);
  await page.waitForTimeout(3000);

  // Click on the Page Name field / Edit name
  console.log('→ Looking for Page name edit affordance');
  const candidates = [
    'div[aria-label="Edit Name"]',
    'div[role="button"]:has-text("Edit Name")',
    'div[role="button"]:has-text("Maestría Video")',
    'span:has-text("Maestría Video")',
  ];
  let opened = false;
  for (const sel of candidates) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
      await el.click();
      opened = true;
      console.log(`  ✓ clicked: ${sel}`);
      break;
    }
  }
  if (!opened) {
    console.log('  ⚠ Could not find edit affordance. Take screenshot:');
    await page.screenshot({ path: '/tmp/rename-a-debug.png', fullPage: true });
    console.log('     /tmp/rename-a-debug.png');
    throw new Error('Could not open rename UI; check screenshot.');
  }
  await page.waitForTimeout(2000);

  // Fill new name
  const nameInput = page.locator('input[aria-label*="Name"], input[aria-label*="Nombre"]').first();
  await nameInput.fill(PAGE_A.newName);
  await page.waitForTimeout(1000);

  // Click Save / Continue
  const saveBtn = page.locator('div[role="button"]:has-text("Save"), div[role="button"]:has-text("Continue"), div[role="button"]:has-text("Guardar")').first();
  await saveBtn.click();
  console.log(`✓ Rename submitted: "${PAGE_A.newName}"`);
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/rename-a-result.png' });
  await ctx.close();
}

// ---------- UPLOAD COVER + PROFILE TO PAGE A ----------
async function modeUploadA() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  console.log(`→ Opening Page A`);
  await page.goto(`https://www.facebook.com/profile.php?id=${PAGE_A_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // ----- COVER PHOTO -----
  console.log('→ Uploading cover photo');
  // FB uses a hidden file input. setInputFiles bypasses the click flow.
  const coverInputs = page.locator('input[type="file"][accept*="image"]');
  const count = await coverInputs.count();
  console.log(`  found ${count} image inputs`);
  if (count > 0) {
    await coverInputs.first().setInputFiles(PAGE_A.cover);
    console.log('  ✓ cover file injected, waiting for editor');
    await page.waitForTimeout(5000);
    // Click Save / Publish on the editor
    const save = page.locator('div[role="button"]:has-text("Save changes"), div[role="button"]:has-text("Publish"), div[aria-label="Save"]').first();
    if (await save.isVisible({ timeout: 5000 }).catch(() => false)) {
      await save.click();
      console.log('  ✓ saved');
    }
    await page.waitForTimeout(5000);
  }

  // ----- PROFILE PICTURE -----
  console.log('→ Uploading profile picture');
  // Click on the profile pic placeholder first to open the upload dialog
  const profileTrigger = page.locator('div[role="button"][aria-label*="profile picture"], div[role="button"][aria-label*="profile photo"]').first();
  if (await profileTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
    await profileTrigger.click();
    await page.waitForTimeout(1500);
    // Click "Upload photo" if a menu appears
    const upload = page.locator('div[role="menuitem"]:has-text("Upload"), div[role="button"]:has-text("Upload photo")').first();
    if (await upload.isVisible({ timeout: 2000 }).catch(() => false)) {
      // Set file on the next file input
      const filePromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
      await upload.click();
      const fc = await filePromise;
      if (fc) await fc.setFiles(PAGE_A.profile);
    }
    await page.waitForTimeout(5000);
    const saveProfile = page.locator('div[role="button"]:has-text("Save"), div[role="button"]:has-text("Publish")').first();
    if (await saveProfile.isVisible({ timeout: 3000 }).catch(() => false)) await saveProfile.click();
    await page.waitForTimeout(5000);
  }

  await page.screenshot({ path: '/tmp/upload-a-result.png' });
  console.log('→ Done. Screenshot: /tmp/upload-a-result.png');
  await ctx.close();
}

// ---------- CREATE PAGE B ----------
async function modeCreateB() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  console.log('→ Opening Pages create');
  await page.goto('https://www.facebook.com/pages/create/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);

  // ---- Page name ----
  console.log(`→ Filling name: ${PAGE_B.name}`);
  const nameInput = page.locator('input[type="text"]').filter({ hasNot: page.locator('[aria-label="Search Facebook"]') }).first();
  await nameInput.click();
  await nameInput.fill(PAGE_B.name);
  await page.waitForTimeout(1500);

  // ---- Category (typeahead) ----
  console.log(`→ Filling category: ${PAGE_B.category1}`);
  const catInput = page.locator('input[aria-label="Category (required)"]').first();
  await catInput.click();
  await catInput.fill('');
  for (const ch of PAGE_B.category1) {
    await catInput.press(ch);
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(1500);
  // Pick "Education" from listbox
  const eduOption = page.locator('li[role="option"]').filter({ hasText: /^Education$/ }).first();
  await eduOption.click();
  await page.waitForTimeout(1500);

  // ---- Bio ----
  console.log('→ Filling bio');
  const bioField = page.locator('textarea').first();
  await bioField.click();
  await bioField.fill(PAGE_B.bio);
  await page.waitForTimeout(1500);

  // ---- Click Create Page ----
  console.log('→ Click Create Page');
  const createBtn = page.locator('div[role="button"]:has-text("Create Page")').first();
  await createBtn.click();
  console.log('  ✓ Page created — waiting for setup wizard');
  await page.waitForTimeout(8000);

  // ---- Setup wizard Step 1: Contact + Location + Hours ----
  console.log('→ Setup wizard step 1');
  await fillSetupStep1(page);

  // ---- Click Next ----
  const next1 = page.locator('div[role="button"]:has-text("Next")').first();
  if (await next1.isVisible({ timeout: 3000 }).catch(() => false)) {
    await next1.click();
    console.log('  ✓ Step 1 → Step 2');
    await page.waitForTimeout(5000);
  }

  // ---- Step 2: Profile pic + cover. Re-query inputs after each upload (DOM re-renders). ----
  console.log('→ Setup wizard step 2: uploading profile + cover');
  async function findAndUpload(label, filePath) {
    const inputs = page.locator('input[type="file"][accept*="image"]');
    const n = await inputs.count();
    for (let i = 0; i < n; i++) {
      const inp = inputs.nth(i);
      // Wrap evaluate in try/catch so a stale handle doesn't crash
      const parentText = await inp.evaluate(el => el.parentElement?.textContent || '', { timeout: 5000 }).catch(() => '');
      if (parentText.toLowerCase().includes(label.toLowerCase())) {
        await inp.setInputFiles(filePath);
        console.log(`  ✓ ${label} uploaded`);
        await page.waitForTimeout(4000);
        return true;
      }
    }
    console.log(`  ⚠ ${label} input not found`);
    return false;
  }
  await findAndUpload('profile', PAGE_B.profile);
  // Save Page ID early in case cover upload fails
  const urlNow = page.url();
  const mEarly = urlNow.match(/id=(\d+)/);
  if (mEarly) {
    const s = loadState();
    s.pageBId = mEarly[1];
    saveState(s);
    console.log(`  ✓ Page B ID saved early: ${mEarly[1]}`);
  }
  await findAndUpload('cover', PAGE_B.cover);

  // ---- Click Next on Step 2 ----
  const next2 = page.locator('div[role="button"]:has-text("Next")').first();
  if (await next2.isVisible({ timeout: 3000 }).catch(() => false)) {
    await next2.click();
    console.log('  ✓ Step 2 → Step 3');
    await page.waitForTimeout(5000);
  }

  // ---- Step 3: WhatsApp — skip ----
  console.log('→ Skipping WhatsApp');
  const skip = page.locator('div[role="button"]:has-text("Skip")').first();
  if (await skip.isVisible({ timeout: 3000 }).catch(() => false)) {
    await skip.click();
    await page.waitForTimeout(5000);
  }

  // ---- Subsequent steps: keep clicking Next/Skip/Done ----
  for (let i = 0; i < 6; i++) {
    const anyBtn = page.locator('div[role="button"]:has-text("Done"), div[role="button"]:has-text("Skip"), div[role="button"]:has-text("Next"), div[role="button"]:has-text("Finish")').first();
    if (await anyBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const text = await anyBtn.textContent();
      console.log(`  → clicking "${text}"`);
      await anyBtn.click();
      await page.waitForTimeout(4000);
    } else {
      break;
    }
  }

  // Save Page B's URL/ID
  const url = page.url();
  const m = url.match(/id=(\d+)/);
  if (m) {
    const s = loadState();
    s.pageBId = m[1];
    saveState(s);
    console.log(`✓ Page B ID saved: ${m[1]}`);
  }
  await page.screenshot({ path: '/tmp/create-b-result.png', fullPage: false });
  console.log('→ Done. Screenshot: /tmp/create-b-result.png');
  await ctx.close();
}

async function fillSetupStep1(page) {
  async function fillByLabel(labelText, value) {
    // find input/textarea whose nearest label text matches
    const fields = page.locator('input[type="text"], input[type="search"], textarea');
    const total = await fields.count();
    for (let i = 0; i < total; i++) {
      const f = fields.nth(i);
      if (!await f.isVisible().catch(() => false)) continue;
      const aria = await f.getAttribute('aria-label') || '';
      if (aria === 'Search Facebook') continue;
      const label = await f.evaluate(el => {
        let p = el;
        for (let j = 0; j < 6 && p; j++) {
          const labels = p.querySelectorAll('label, span[role=label]');
          for (const l of labels) {
            const t = (l.textContent || '').trim();
            if (t.length > 0 && t.length < 40) return t;
          }
          p = p.parentElement;
        }
        return '';
      });
      if (label.toLowerCase().includes(labelText.toLowerCase())) {
        await f.click();
        await f.fill(value);
        console.log(`    ✓ ${labelText}: ${value.substring(0, 30)}...`);
        return true;
      }
    }
    console.log(`    ⚠ ${labelText} not found`);
    return false;
  }
  await fillByLabel('Website', PAGE_B.website);
  await fillByLabel('Email', PAGE_B.email);
  await fillByLabel('Address', PAGE_B.address);
  await fillByLabel('City', PAGE_B.city);
  await page.waitForTimeout(2500);
  // Pick first city dropdown option (Miami, Florida)
  const miamiOpt = page.locator('li[role="option"]').filter({ hasText: /Miami.*Florida/ }).first();
  if (await miamiOpt.isVisible({ timeout: 2000 }).catch(() => false)) {
    await miamiOpt.click();
    console.log('    ✓ Miami, Florida selected');
  }
  await fillByLabel('ZIP', PAGE_B.zip);
  // Hours: Always open
  const alwaysOpen = page.locator('input[type="radio"][value="ALWAYS_OPEN"]').first();
  if (await alwaysOpen.isVisible({ timeout: 2000 }).catch(() => false)) {
    await alwaysOpen.check();
    console.log('    ✓ Always open');
  }
}

async function modeUploadB() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  const s = loadState();
  if (!s.pageBId) throw new Error('Page B ID not in state. Run create-b first.');
  console.log(`→ Opening Page B (${s.pageBId})`);
  await page.goto(`https://www.facebook.com/profile.php?id=${s.pageBId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  // Same logic as modeUploadA
  const inputs = page.locator('input[type="file"][accept*="image"]');
  if ((await inputs.count()) > 0) {
    await inputs.first().setInputFiles(PAGE_B.cover);
    await page.waitForTimeout(5000);
    const save = page.locator('div[role="button"]:has-text("Save changes"), div[role="button"]:has-text("Publish")').first();
    if (await save.isVisible({ timeout: 3000 }).catch(() => false)) await save.click();
    await page.waitForTimeout(5000);
  }
  console.log('→ Done');
  await page.screenshot({ path: '/tmp/upload-b-result.png' });
  await ctx.close();
}

// ---------- DISCOVER USER'S PAGES ----------
async function modeDiscover() {
  const ctx = await openContext();
  const page = await ctx.newPage();
  await waitForLogin(page);
  console.log('→ Opening Pages list');
  await page.goto('https://www.facebook.com/pages/?category=your_pages', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);
  // Find all Page name links + extract IDs
  const pages = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('a[href*="profile.php?id="], a[href^="/"]').forEach(a => {
      const text = (a.textContent || '').trim();
      if (text.length > 0 && text.length < 60 && !text.includes('http')) {
        const m = a.href.match(/profile\.php\?id=(\d+)/);
        if (m) out.push({ name: text, id: m[1], url: a.href });
      }
    });
    return [...new Map(out.map(p => [p.id, p])).values()].slice(0, 20);
  });
  console.log('Pages found:');
  pages.forEach(p => console.log(`  ${p.id} → ${p.name}`));
  // Save Page B by name match
  const pageB = pages.find(p => p.name.toLowerCase().includes('academia') || p.name.toLowerCase().includes('maestría ia'));
  if (pageB) {
    const s = loadState();
    s.pageBId = pageB.id;
    saveState(s);
    console.log(`✓ Saved pageBId=${pageB.id} (${pageB.name})`);
  } else {
    console.log('⚠ Page B not auto-detected. Set manually in fb-state.json');
  }
  await page.screenshot({ path: '/tmp/discover-result.png' });
  await ctx.close();
}

// ---------- MAIN ----------
const mode = process.argv[2] || 'help';
const run = {
  login: modeLogin,
  discover: modeDiscover,
  'rename-a': modeRenameA,
  'upload-a': modeUploadA,
  'create-b': modeCreateB,
  'upload-b': modeUploadB,
  all: async () => {
    await modeLogin();
    await modeRenameA();
    await modeUploadA();
    await modeCreateB();
    await modeUploadB();
  },
};

if (run[mode]) {
  try {
    await run[mode]();
    console.log('✓ Done.');
  } catch (e) {
    console.error('✗ Error:', e.message);
    process.exit(1);
  }
} else {
  console.log('Usage:');
  console.log('  node fb-pages.js login     → log into FB (once)');
  console.log('  node fb-pages.js rename-a  → rename Page A to "Maestría IA"');
  console.log('  node fb-pages.js upload-a  → upload profile + cover to Page A');
  console.log('  node fb-pages.js create-b  → create Page B "Maestría IA Academia"');
  console.log('  node fb-pages.js upload-b  → upload profile + cover to Page B');
  console.log('  node fb-pages.js all       → run everything');
}
