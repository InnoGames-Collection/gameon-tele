import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SCREENSHOTS_DIR = '/Users/yasabneh/.gemini/antigravity/brain/6f57d6aa-b5aa-400d-9029-86f11724860c/screenshots';

const DEMO_USER_PROFILE = {
  id: 'usr_demo_telebirr_001',
  phoneNumber: '0911428890',
  displayName: 'Abebe B.',
  avatarId: 'avatar_eagle',
  isRegistered: true,
  telebirrLinked: true,
  telebirrId: 'TB-894210',
  telebirrBalance: 145.50,
  coins: 50,
  xp: 3850,
  level: 5,
  energy: 5,
  maxEnergy: 5,
  lastEnergyRefillTimestamp: Date.now(),
  subscription: {
    plan: 'daily',
    isActive: true,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    autoRenew: true,
  },
  streak: {
    current: 4,
    lastClaimedDate: '',
    hasClaimedToday: false,
  },
  highScores: {
    'candy-blast': 380,
    'helix-jump': 400,
    'retro-runner': 450,
  },
  achievements: ['first_win', 'streak_3'],
  matchesPlayed: 42,
  trophiesCount: 8,
};

async function run() {
  console.log('Launching Chrome for comprehensive production UAT screenshots...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  try {
    // ==========================================
    // 1. ADMIN PORTAL SCREENSHOTS (Desktop Viewport)
    // ==========================================
    const adminPage = await browser.newPage();
    await adminPage.setViewport({ width: 1440, height: 900 });

    // 1.1 Unauthenticated Admin Login Screen
    await adminPage.goto('http://localhost:3603', { waitUntil: 'networkidle0' });
    await adminPage.evaluate(() => sessionStorage.clear());
    await adminPage.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_login.png') });
    console.log('Captured admin_login.png');

    // 1.2 Perform Admin Login
    await adminPage.click('button[type="submit"]');
    await new Promise((r) => setTimeout(r, 1200));

    // 1.3 Admin Dashboard (Live PostgreSQL data)
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_dashboard.png') });
    console.log('Captured admin_dashboard.png');

    // 1.4 Admin Cycles & Prize Configuration Tab
    const cycleTabBtn = await adminPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      return btns.find(b => b.textContent && b.textContent.includes('7-Day Competition'));
    });
    if (cycleTabBtn) await cycleTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_cycles.png') });
    console.log('Captured admin_cycles.png');

    // 1.5 Admin Physics Runs Tab
    const runsTabBtn = await adminPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      return btns.find(b => b.textContent && b.textContent.includes('3D Physics Telemetry'));
    });
    if (runsTabBtn) await runsTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_runs.png') });
    console.log('Captured admin_runs.png');

    // 1.6 Admin Subscriber Ledger Tab
    const subsTabBtn = await adminPage.evaluateHandle(() => {
      const btns = Array.from(document.querySelectorAll('aside button'));
      return btns.find(b => b.textContent && b.textContent.includes('Subscriber Ledger'));
    });
    if (subsTabBtn) await subsTabBtn.click();
    await new Promise((r) => setTimeout(r, 800));
    await adminPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'admin_subscribers.png') });
    console.log('Captured admin_subscribers.png');

    await adminPage.close();

    // ==========================================
    // 2. PLAYER CLIENT SCREENSHOTS (Mobile Viewport)
    // ==========================================
    const webPage = await browser.newPage();
    await webPage.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });

    // 2.1 Unauthenticated Login Screen
    await webPage.goto('http://localhost:3600', { waitUntil: 'networkidle0' });
    await webPage.evaluate(() => localStorage.clear());
    await webPage.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 600));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_login.png') });
    console.log('Captured web_login.png');

    // 2.2 Authenticated Home Screen
    await webPage.evaluate((prof) => {
      localStorage.setItem('teleplay_ethio_profile_v1', JSON.stringify(prof));
    }, DEMO_USER_PROFILE);
    await webPage.reload({ waitUntil: 'networkidle0' });
    await new Promise((r) => setTimeout(r, 800));

    // Dismiss any toasts
    await webPage.evaluate(() => {
      document.querySelectorAll('#notification-toast-container button').forEach(b => b.click());
    });
    await new Promise((r) => setTimeout(r, 300));

    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_home.png') });
    console.log('Captured web_home.png');

    // 2.3 Explicit Tournament Tab (Click bottom nav TOURNAMENT)
    await webPage.click('#bottom-nav-tournament');
    await new Promise((r) => setTimeout(r, 800));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_tournament.png') });
    console.log('Captured web_tournament.png');

    // 2.4 Games Catalog Tab
    await webPage.click('#bottom-nav-games');
    await new Promise((r) => setTimeout(r, 600));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_games_catalog.png') });
    console.log('Captured web_games_catalog.png');

    // 2.5 Leaderboard Tab
    await webPage.click('#bottom-nav-leaderboard');
    await new Promise((r) => setTimeout(r, 600));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_leaderboard.png') });
    console.log('Captured web_leaderboard.png');

    // 2.6 Profile Tab
    await webPage.click('#bottom-nav-profile');
    await new Promise((r) => setTimeout(r, 600));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_profile.png') });
    console.log('Captured web_profile.png');

    // 2.7 Launch Helix Jump from Tournament tab or Home tab
    await webPage.click('#bottom-nav-tournament');
    await new Promise((r) => setTimeout(r, 500));
    await webPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const launchBtn = btns.find(b => b.textContent && b.textContent.includes('PLAY HELIX'));
      if (launchBtn) launchBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_helix_game_menu.png') });
    console.log('Captured web_helix_game_menu.png');

    // Start 3D Gameplay
    await webPage.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const startBtn = buttons.find(b => b.textContent && (b.textContent.includes('PLAY') || b.textContent.includes('TAP TO PLAY') || b.textContent.includes('START')));
      if (startBtn) startBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1500));
    await webPage.screenshot({ path: path.join(SCREENSHOTS_DIR, 'web_helix_gameplay.png') });
    console.log('Captured web_helix_gameplay.png');

    await webPage.close();
    console.log('🎉 Successfully captured all production UAT screenshots!');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
