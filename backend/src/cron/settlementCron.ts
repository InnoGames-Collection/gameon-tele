import cron from 'node-cron';
import crypto from 'crypto';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';
import { SpService } from '../services/spService.js';
import { maskMsisdn } from '../services/helixEngine.js';

const PRIZE_STRUCTURE: Record<number, number> = {
  1: 20000,
  2: 12000,
  3: 5000,
  4: 1000,
  5: 1000,
  6: 1000,
  7: 1000,
  8: 1000,
  9: 1000,
  10: 1000,
};

const RELEASE_LOCK_LUA = `
  if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
  else
    return 0
  end
`;

export const CycleSettlementEngine = {
  /**
   * Finalizes expired 7-day tournament cycles atomically with distributed locking.
   */
  async settleExpiredCycles(): Promise<{ settled: boolean; cycleId?: string; winnersCount?: number }> {
    const lockKey = 'gameon:lock:cycle_settlement';
    const lockValue = crypto.randomUUID();

    // 1. Acquire Distributed Lock in Valkey 8 (TTL 300 seconds)
    const acquired = await cache.set(lockKey, lockValue, 'EX', 300, 'NX');
    if (!acquired) {
      console.log('[Settlement Engine] Another settlement instance is currently running. Skipping.');
      return { settled: false };
    }

    const client = await pool.connect();
    const winnersToNotify: Array<{ msisdn: string; rank: number; prize: number; compId: string }> = [];
    let finalizedCompId: string | undefined;

    try {
      await client.query('BEGIN');

      // 2. Select active cycle that reached end_time with row-level lock
      const cycleRes = await client.query(
        `SELECT competition_id, cycle_number, end_time, prize_pool_etb 
         FROM competition_cycles 
         WHERE status = 'ACTIVE' AND end_time <= NOW() 
         ORDER BY cycle_number ASC 
         LIMIT 1 
         FOR UPDATE`
      );

      if (cycleRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return { settled: false };
      }

      const cycle = cycleRes.rows[0];
      finalizedCompId = cycle.competition_id;
      console.log(`[Settlement Engine] Finalizing cycle ${finalizedCompId} (Cycle #${cycle.cycle_number})...`);

      // 3. Query top 10 verified players for this cycle
      const topPlayersRes = await client.query(
        `SELECT player_msisdn, masked_msisdn, seven_day_score 
         FROM cycle_leaderboard 
         WHERE competition_id = $1 
         ORDER BY seven_day_score DESC 
         LIMIT 10`,
        [cycle.competition_id]
      );

      const winners = topPlayersRes.rows;

      // 4. Record finalized rankings into leaderboard_snapshots & queue airtime payouts
      for (let i = 0; i < winners.length; i++) {
        const rank = i + 1;
        const player = winners[i];
        const prize = PRIZE_STRUCTURE[rank] || 0;
        const txId = `tx_payout_${cycle.competition_id}_r${rank}_${Date.now()}`;

        // Insert permanent snapshot
        await client.query(
          `INSERT INTO leaderboard_snapshots (
             competition_id, cycle_number, rank, player_msisdn, masked_msisdn, total_score, prize_etb, settled_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (competition_id, rank) DO NOTHING`,
          [cycle.competition_id, cycle.cycle_number, rank, player.player_msisdn, player.masked_msisdn, player.seven_day_score, prize]
        );

        // Queue airtime payout log
        if (prize > 0) {
          await client.query(
            `INSERT INTO airtime_payout_logs (
               competition_id, player_msisdn, rank, amount_etb, status, transaction_id, created_at
             ) VALUES ($1, $2, $3, $4, 'PENDING', $5, NOW())
             ON CONFLICT (transaction_id) DO NOTHING`,
            [cycle.competition_id, player.player_msisdn, rank, prize, txId]
          );

          winnersToNotify.push({
            msisdn: player.player_msisdn,
            rank,
            prize,
            compId: cycle.competition_id,
          });
        }
      }

      // 5. Mark the expired cycle as FINALIZED
      await client.query(
        `UPDATE competition_cycles 
         SET status = 'FINALIZED' 
         WHERE competition_id = $1`,
        [cycle.competition_id]
      );

      // 6. Atomically open the next 7-day tournament cycle
      const nextCycleNumber = cycle.cycle_number + 1;
      const nextCompetitionId = `helix_cycle_w${nextCycleNumber}`;
      const nextStartTime = cycle.end_time;

      await client.query(
        `INSERT INTO competition_cycles (
           competition_id, cycle_number, start_time, end_time, status, prize_pool_etb
         ) VALUES ($1, $2, $3, $3::TIMESTAMPTZ + INTERVAL '7 days', 'ACTIVE', $4)
         ON CONFLICT (competition_id) DO NOTHING`,
        [nextCompetitionId, nextCycleNumber, nextStartTime, cycle.prize_pool_etb]
      );

      await client.query('COMMIT');
      console.log(`[Settlement Engine] Successfully closed ${finalizedCompId} and activated ${nextCompetitionId}.`);

      // 7. Archive Valkey sorted set
      const oldZset = `gameon:lb:cycle:${finalizedCompId}`;
      const archiveZset = `gameon:lb:archive:${finalizedCompId}`;
      await cache.rename(oldZset, archiveZset).catch(() => {});
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[Settlement Engine] Error settling cycle:', err);
      throw err;
    } finally {
      client.release();
      // Safely release distributed lock via Lua script
      await cache.eval(RELEASE_LOCK_LUA, 1, lockKey, lockValue).catch(() => {});
    }

    // 8. Outbound Winner MT SMS Prize Notifications (Safe from double-fire)
    for (const w of winnersToNotify) {
      const msg = `🎉 Congratulations! You placed #${w.rank} in GameOn Tele 7-Day Helix Jump tournament! Your prize of ${w.prize.toLocaleString()} ETB is being credited. Play the new cycle now!`;
      SpService.sendMt({
        msisdn: w.msisdn,
        message: msg,
        type: 'business',
      }).catch((smsErr) => {
        console.error(`[Settlement Engine] Failed to dispatch prize SMS to ${maskMsisdn(w.msisdn)}:`, smsErr);
      });
    }

    return {
      settled: true,
      cycleId: finalizedCompId,
      winnersCount: winnersToNotify.length,
    };
  },

  /**
   * Starts recurring cron worker (Runs every 10 minutes).
   */
  startScheduler() {
    console.log('⏰ Starting 7-day competition cycle settlement scheduler (every 10 minutes)...');
    cron.schedule('*/10 * * * *', async () => {
      try {
        await CycleSettlementEngine.settleExpiredCycles();
      } catch (e) {
        console.error('[Settlement Scheduler Error]', e);
      }
    });
  },
};
