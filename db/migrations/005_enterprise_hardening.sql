-- ==============================================================================
-- GameOn Tele — Migration 005: Enterprise Hardening & Zero-Trust Relational Integrity
-- Target: PostgreSQL 16
-- Scope: Composite Indexes, RBAC Audit Trail, Subscribers/Scores Aliasing,
--        Fraud Prevention & Payout Ledgering
-- ==============================================================================

-- 1. Ensure UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Ensure players table contains status column with proper constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'status'
    ) THEN
        ALTER TABLE players ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
    END IF;
END $$;

-- 3. Enhance admin_audit_logs with IP and entity metadata
ALTER TABLE admin_audit_logs 
    ADD COLUMN IF NOT EXISTS ip VARCHAR(45),
    ADD COLUMN IF NOT EXISTS before_state JSONB,
    ADD COLUMN IF NOT EXISTS after_state JSONB;

-- 4. High-Performance Composite Indexes for Tier-0 Throughput
-- Fast lookup of cycle leaderboard sorted by score with rank resolution
CREATE INDEX IF NOT EXISTS idx_cycle_leaderboard_score_rank 
    ON cycle_leaderboard (competition_id, seven_day_score DESC, rank ASC);

-- Fast lookup of runs per player within active cycle
CREATE INDEX IF NOT EXISTS idx_helix_runs_user_cycle 
    ON helix_runs (player_msisdn, competition_id, started_at DESC);

-- Fast lookup of cheater / fraud queue
CREATE INDEX IF NOT EXISTS idx_helix_runs_fraud_flag 
    ON helix_runs (fraud_flag, started_at DESC);

-- Fast lookup of active subscribers by msisdn
CREATE INDEX IF NOT EXISTS idx_subscriptions_msisdn_status 
    ON subscriptions (msisdn, status);

-- Fast lookup of payout logs by status and competition
CREATE INDEX IF NOT EXISTS idx_airtime_payouts_comp_status 
    ON airtime_payout_logs (competition_id, status);

-- Fast lookup of audit logs by creation time
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created 
    ON admin_audit_logs (created_at DESC);

-- 5. Standardized Relational Views for Uniform Schema Access
-- Provides 'subscribers' view alias to 'subscriptions' with normalized column names
CREATE OR REPLACE VIEW subscribers AS 
SELECT 
    id,
    msisdn,
    shortcode,
    service_id,
    status,
    plan_type,
    price_etb,
    renew_count,
    created_at AS subscribed_at,
    last_billed_at AS renewed_at,
    next_billing_at AS expires_at,
    updated_at
FROM subscriptions;

-- Provides 'cycle_scores' view alias to 'cycle_daily_scores' aggregated per player
CREATE OR REPLACE VIEW cycle_scores AS
SELECT 
    player_msisdn AS user_id,
    competition_id AS cycle_id,
    MAX(best_score) AS highest_score,
    COUNT(DISTINCT day_number) AS total_attempts,
    MAX(updated_at) AS updated_at
FROM cycle_daily_scores
GROUP BY player_msisdn, competition_id;

-- 6. Add Ban tracking & disqualification support on players
CREATE TABLE IF NOT EXISTS player_ban_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_msisdn VARCHAR(20) NOT NULL,
    banned_by VARCHAR(100) NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_ban_logs_msisdn 
    ON player_ban_logs (player_msisdn);
