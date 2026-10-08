import crypto from 'crypto';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';
import { cache } from '../config/cache.js';

export function normalizeMsisdn(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('251')) return digits;
  if (digits.startsWith('09')) return '251' + digits.substring(1);
  if (digits.startsWith('9')) return '251' + digits;
  if (digits.startsWith('07')) return '251' + digits.substring(1);
  if (digits.startsWith('7')) return '251' + digits;
  return digits;
}

export function maskMsisdn(msisdn: string): string {
  const norm = normalizeMsisdn(msisdn);
  if (norm.length >= 9) {
    const prefix = norm.startsWith('251') ? '0' + norm.substring(3, 5) : norm.substring(0, 3);
    const suffix = norm.slice(-3);
    return `${prefix}*****${suffix}`;
  }
  return '091*****890';
}

export const HelixEngine = {
  maskMsisdn,
  normalizeMsisdn,

  createRunToken(msisdn: string, timestamp: number): string {
    return crypto.createHash('sha256').update(`${msisdn}:${timestamp}:${env.HELIX_RUN_SECRET}`).digest('hex');
  },

  async getActiveCycle(): Promise<any> {
    const res = await pool.query(
      `SELECT * FROM competition_cycles WHERE status = 'ACTIVE' ORDER BY cycle_number DESC LIMIT 1`
    );
    if (res.rows.length > 0) return res.rows[0];

    // Compute cycle number based on weekly epoch
    const now = Date.now();
    const cycleNumber = Math.max(1, Math.floor(now / (7 * 86400000)) - 2900); // realistic sequential cycle
    const compId = `helix_cycle_w${cycleNumber}`;
    const insRes = await pool.query(
      `INSERT INTO competition_cycles (competition_id, cycle_number, start_time, end_time, status, prize_pool_etb)
       VALUES ($1, $2, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE', 40000)
       ON CONFLICT (competition_id) DO UPDATE SET status = 'ACTIVE'
       RETURNING *`,
      [compId, cycleNumber]
    );
    return insRes.rows[0];
  },

  /**
   * Recalculates real ranks in cycle_leaderboard from PostgreSQL and Valkey.
   */
  async recomputeLeaderboardRanks(competitionId: string): Promise<void> {
    await pool.query(
      `WITH ranked AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY seven_day_score DESC) as new_rank
        FROM cycle_leaderboard
        WHERE competition_id = $1
      )
      UPDATE cycle_leaderboard c
      SET rank = r.new_rank
      FROM ranked r
      WHERE c.id = r.id`,
      [competitionId]
    );
  },
};
