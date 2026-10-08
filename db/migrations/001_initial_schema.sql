-- ==============================================================================
-- GameOn Tele — Production Relational Schema
-- Target: PostgreSQL 16
-- Service: 3D Rolling 7-Day Competition Game (Helix Jump)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Players Master Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn VARCHAR(20) NOT NULL UNIQUE,
    masked_msisdn VARCHAR(20) NOT NULL,
    coins INT NOT NULL DEFAULT 100 CHECK (coins >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'BANNED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gameon_players_msisdn ON players(msisdn);

-- 2. Telecom Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    msisdn VARCHAR(20) NOT NULL,
    shortcode VARCHAR(10) NOT NULL DEFAULT '9898',
    service_id VARCHAR(50) NOT NULL DEFAULT 'srv_gameon_daily',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'UNSUBSCRIBED', 'SUSPENDED')),
    plan_type VARCHAR(20) NOT NULL DEFAULT 'daily',
    price_etb NUMERIC(10,2) NOT NULL DEFAULT 2.00,
    renew_count INT NOT NULL DEFAULT 1,
    last_billed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    next_billing_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 day'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_subscriptions_msisdn_service UNIQUE (msisdn, service_id)
);

CREATE INDEX IF NOT EXISTS idx_gameon_subs_msisdn ON subscriptions(msisdn);

-- 3. Idempotent Subscription Events Log
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('subscribe', 'unsubscribe', 'renew', 'billing_failed')),
    msisdn VARCHAR(20) NOT NULL,
    service_id VARCHAR(50) NOT NULL DEFAULT 'srv_gameon_daily',
    raw_payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT TRUE,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_events_msisdn ON subscription_events(msisdn);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);

-- Backward compatibility view
CREATE OR REPLACE VIEW sp_webhook_events AS 
SELECT id, event_type, request_id, msisdn, service_id, raw_payload, signature_verified, processed_at AS created_at
FROM subscription_events;

-- 4. 7-Day Rolling Competition Cycles
CREATE TABLE IF NOT EXISTS competition_cycles (
    competition_id VARCHAR(50) PRIMARY KEY,
    cycle_number INT NOT NULL UNIQUE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('UPCOMING', 'ACTIVE', 'FINALIZED')),
    prize_pool_etb INT NOT NULL DEFAULT 40000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Individual 3D Helix Runs & Authoritative Physics Telemetry
CREATE TABLE IF NOT EXISTS helix_runs (
    id VARCHAR(100) PRIMARY KEY,
    competition_id VARCHAR(50) NOT NULL REFERENCES competition_cycles(competition_id) ON DELETE CASCADE,
    player_msisdn VARCHAR(20) NOT NULL,
    run_token VARCHAR(255) NOT NULL UNIQUE,
    floors_cleared INT NOT NULL DEFAULT 0,
    final_score INT NOT NULL DEFAULT 0,
    duration_seconds NUMERIC(10,2) NOT NULL DEFAULT 0,
    tower_seed VARCHAR(64),
    telemetry_data JSONB,
    telemetry_verified BOOLEAN NOT NULL DEFAULT FALSE,
    fraud_flag BOOLEAN NOT NULL DEFAULT FALSE,
    fraud_reason VARCHAR(255),
    client_duration_ms INT,
    server_duration_ms INT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_helix_runs_player ON helix_runs(player_msisdn);
-- Composite index for sub-millisecond leaderboard resolution during peak traffic
CREATE INDEX IF NOT EXISTS idx_helix_runs_cycle_score_time ON helix_runs(competition_id, final_score DESC, completed_at ASC);
CREATE INDEX IF NOT EXISTS idx_helix_runs_msisdn_comp ON helix_runs(player_msisdn, competition_id);

-- 6. Daily Scores Per Cycle (Day 1 to Day 7)
CREATE TABLE IF NOT EXISTS cycle_daily_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id VARCHAR(50) NOT NULL REFERENCES competition_cycles(competition_id) ON DELETE CASCADE,
    player_msisdn VARCHAR(20) NOT NULL,
    day_number INT NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
    best_score INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(competition_id, player_msisdn, day_number)
);

CREATE INDEX IF NOT EXISTS idx_cycle_daily_scores_comp ON cycle_daily_scores(competition_id, player_msisdn);

-- 7. 7-Day Cumulative Leaderboard Snapshots & Active Ranks
CREATE TABLE IF NOT EXISTS cycle_leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id VARCHAR(50) NOT NULL REFERENCES competition_cycles(competition_id) ON DELETE CASCADE,
    player_msisdn VARCHAR(20) NOT NULL,
    masked_msisdn VARCHAR(20) NOT NULL,
    seven_day_score INT NOT NULL DEFAULT 0,
    rank INT NOT NULL,
    prize_etb INT NOT NULL DEFAULT 0,
    is_disbursed BOOLEAN NOT NULL DEFAULT FALSE,
    disbursed_at TIMESTAMPTZ,
    UNIQUE(competition_id, player_msisdn)
);

CREATE INDEX IF NOT EXISTS idx_cycle_lb_rank ON cycle_leaderboard(competition_id, rank);
CREATE INDEX IF NOT EXISTS idx_cycle_lb_score ON cycle_leaderboard(competition_id, seven_day_score DESC);

-- 8. Permanent 7-Day Cycle Leaderboard Snapshots
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id VARCHAR(50) NOT NULL REFERENCES competition_cycles(competition_id) ON DELETE CASCADE,
    cycle_number INT NOT NULL,
    rank INT NOT NULL,
    player_msisdn VARCHAR(20) NOT NULL,
    masked_msisdn VARCHAR(20) NOT NULL,
    total_score INT NOT NULL,
    prize_etb INT NOT NULL DEFAULT 0,
    settled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_lb_snapshot_cycle_rank UNIQUE (competition_id, rank)
);

CREATE INDEX IF NOT EXISTS idx_lb_snapshot_cycle ON leaderboard_snapshots(competition_id, rank ASC);

-- 9. Telecom Airtime Prize Settlement Logs
CREATE TABLE IF NOT EXISTS airtime_payout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id VARCHAR(50) NOT NULL REFERENCES competition_cycles(competition_id) ON DELETE CASCADE,
    player_msisdn VARCHAR(20) NOT NULL,
    rank INT NOT NULL,
    amount_etb NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED')),
    transaction_id VARCHAR(100) UNIQUE,
    provider_reference VARCHAR(100),
    retry_count INT NOT NULL DEFAULT 0,
    provider_response JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    disbursed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payout_logs_comp_status ON airtime_payout_logs(competition_id, status);
CREATE INDEX IF NOT EXISTS idx_payout_logs_msisdn ON airtime_payout_logs(player_msisdn);

-- 10. Admin Users & Audit Logs
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'SUPER_ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
