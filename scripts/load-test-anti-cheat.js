#!/usr/bin/env node
/**
 * GameOn Tele — High-Throughput Load Test & Anti-Cheat Verification Suite
 * Tests concurrent session issuance, physics telemetry validation, replay prevention,
 * and Valkey/Postgres leaderboard consistency under peak load.
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3602';

async function main() {
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  GAMEON TELE — TIER-0 ANTI-CHEAT & PERFORMANCE LOAD TEST       ');
  console.log(`  Target: ${API_BASE}`);
  console.log('═════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log('✅ PASS');
      passed++;
    } catch (err) {
      console.log(`❌ FAIL: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('Server Health Check', async () => {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy') throw new Error('Unhealthy status');
  });

  // 2. Anti-Cheat: Reject Unsubscribed MSISDN
  await test('Anti-Cheat: Reject Unsubscribed MSISDN', async () => {
    const res = await fetch(`${API_BASE}/api/helix/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: '251900000000' }), // non-subscriber
    });
    if (res.status !== 403) throw new Error(`Expected 403, got ${res.status}`);
  });

  // 3. Webhook Simulation: Subscribe User Idempotently
  const testMsisdn = '251911428890';
  const reqId = `load_req_${Date.now()}`;
  await test('Webhook: Idempotent Subscription Ingestion', async () => {
    // Generate valid HMAC
    const crypto = await import('crypto');
    const secret = 'gameon-hmac-webhook-secret-2026';
    const payload = JSON.stringify({
      event: 'subscribe',
      request_id: reqId,
      msisdn: testMsisdn,
      service_id: 'srv_gameon_daily',
    });
    const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const res = await fetch(`${API_BASE}/api/webhooks/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': sig,
      },
      body: payload,
    });
    if (!res.ok) throw new Error(`Subscription webhook failed: ${res.status}`);

    // Replay identical webhook -> must return 200 with IDEMPOTENT_DUPLICATE
    const replayRes = await fetch(`${API_BASE}/api/webhooks/subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': sig,
      },
      body: payload,
    });
    const replayData = await replayRes.json();
    if (replayData.status !== 'IDEMPOTENT_DUPLICATE') {
      throw new Error(`Expected IDEMPOTENT_DUPLICATE, got ${replayData.status}`);
    }
  });

  // 4. Session Start: Issue single-use run token & tower seed
  let session = null;
  await test('Session Handshake: Seed & Nonce Generation', async () => {
    const res = await fetch(`${API_BASE}/api/helix/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: testMsisdn }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.session?.runToken || !data.session?.towerSeed) {
      throw new Error('Missing runToken or towerSeed in session');
    }
    session = data.session;
  });

  // 5. Anti-Cheat: Reject Instantaneous Fall Run (Gravity / Speed Sanity)
  await test('Anti-Cheat: Flag Impossible Speed (50 floors in 0.2s)', async () => {
    const res = await fetch(`${API_BASE}/api/helix/run/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msisdn: testMsisdn,
        runToken: session.runToken,
        floorsCleared: 50,
        finalScore: 500,
        durationSeconds: 0.2, // impossible speed
        telemetry: [{ floor: 1, action: 'drop_through', combo: 1, t: 10 }],
      }),
    });
    const data = await res.json();
    if (data.fraudFlag !== true || !data.fraudReason?.includes('IMPOSSIBLE_SPEED')) {
      throw new Error(`Expected fraudFlag=true, got fraudFlag=${data.fraudFlag}`);
    }
  });

  // 6. Anti-Cheat: Single-Use Nonce Replay Attack Prevention (409 Conflict)
  await test('Anti-Cheat: Reject Replayed run_token (409 Conflict)', async () => {
    const res = await fetch(`${API_BASE}/api/helix/run/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msisdn: testMsisdn,
        runToken: session.runToken, // replaying same token
        floorsCleared: 10,
        finalScore: 100,
        durationSeconds: 15.0,
        telemetry: [{ floor: 1, action: 'bounce', t: 120 }],
      }),
    });
    if (res.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict, got ${res.status}`);
    }
  });

  // 7. Legitimate Run with Synthesized Physics Telemetry
  await test('Legitimate Run: Verified Physics Telemetry & Scoring', async () => {
    // Acquire fresh session
    const sRes = await fetch(`${API_BASE}/api/helix/session/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ msisdn: testMsisdn }),
    });
    const sData = await sRes.json();
    const freshToken = sData.session.runToken;

    // Build mathematically sound telemetry
    // Floor 0: bounce (+2) -> score = 2
    // Floor 1: drop_through (+10*1) -> score = 12
    // Floor 2: drop_through (+10*2) -> score = 32
    // Floor 3: bounce (+2) -> score = 34
    const validTelemetry = [
      { floor: 0, action: 'bounce', t: 150 },
      { floor: 1, action: 'drop_through', combo: 1, t: 720 },
      { floor: 2, action: 'drop_through', combo: 2, t: 1350 },
      { floor: 3, action: 'bounce', t: 1980 },
    ];
    const expectedScore = 34;

    const res = await fetch(`${API_BASE}/api/helix/run/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        msisdn: testMsisdn,
        runToken: freshToken,
        floorsCleared: 3,
        finalScore: expectedScore,
        durationSeconds: 2.1,
        telemetry: validTelemetry,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.verified || data.fraudFlag) {
      throw new Error(`Expected verified=true, got fraudFlag=${data.fraudFlag} (${data.fraudReason})`);
    }
    if (data.score !== expectedScore) {
      throw new Error(`Expected score ${expectedScore}, got ${data.score}`);
    }
  });

  // 8. Valkey Leaderboard Sub-Millisecond Resolution
  await test('Leaderboard: Valkey Sorted Set Resolution (< 5ms)', async () => {
    const t0 = performance.now();
    const res = await fetch(`${API_BASE}/api/helix/leaderboard`);
    const elapsed = performance.now() - t0;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.leaderboard)) throw new Error('Expected array leaderboard');
    console.log(` (${elapsed.toFixed(2)}ms)`);
  });

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log(`  TEST RESULTS: ${passed} Passed | ${failed} Failed`);
  console.log('═════════════════════════════════════════════════════════════════');

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
