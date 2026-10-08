-- ==============================================================================
-- GameOn Tele — Migration 002: Anti-Cheat Telemetry, Settlements & Webhook Idempotency
-- Target: PostgreSQL 16
-- ==============================================================================

-- 1. Ensure Subscriptions Table Constraints
ALTER TABLE subscriptions 
    ADD CONSTRAINT uq_subscriptions_msisdn_service UNIQUE (msisdn, service_id);

-- 2. Webhook Event Deduplication & Standardized Schema
CREATE TABLE IF NOT EXISTS subscription_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('subscribe', 'unsubscribe', 'renew', 'billing_failed')),
    msisdn VARCHAR(20) NOT NULL,
    service_id VARCHAR(50) NOT NULL,
    raw_payload JSONB NOT NULL,
    signature_verified BOOLEAN NOT NULL DEFAULT TRUE,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sub_events_request_id UNIQUE (request_id)
);

CREATE INDEX IF NOT EXISTS idx_sub_events_msisdn ON subscription_events(msisdn);
CREATE INDEX IF NOT EXISTS idx_sub_events_type ON subscription_events(event_type);

-- Backward compatibility view if legacy table queried
CREATE OR REPLACE VIEW sp_webhook_events_compat AS 
SELECT id, event_type, request_id, msisdn, service_id, raw_payload, signature_verified, processed_at AS created_at
FROM subscription_events;

-- 3. Helix Game Sessions & Anti-Cheat Runs Hardening
-- Enforce unique run_token to prevent session replay attacks
ALTER TABLE helix_runs 
    ADD CONSTRAINT uq_helix_runs_token UNIQUE (run_token);

ALTER TABLE helix_runs 
    ADD COLUMN IF NOT EXISTS tower_seed VARCHAR(64),
    ADD COLUMN IF NOT EXISTS telemetry_data JSONB,
    ADD COLUMN IF NOT EXISTS telemetry_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fraud_reason VARCHAR(255),
    ADD COLUMN IF NOT EXISTS client_duration_ms INT,
    ADD COLUMN IF NOT EXISTS server_duration_ms INT;

-- Composite index for sub-millisecond leaderboard resolution during peak traffic
CREATE INDEX IF NOT EXISTS idx_helix_runs_cycle_score_time 
    ON helix_runs(competition_id, final_score DESC, completed_at ASC);

CREATE INDEX IF NOT EXISTS idx_helix_runs_msisdn_comp 
    ON helix_runs(player_msisdn, competition_id);

-- 4. 7-Day Cycle Leaderboard Snapshots Table
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

-- 5. Telecom Airtime Prize Settlement Logs
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
