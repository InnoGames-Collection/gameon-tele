-- ==============================================================================
-- GameOn Tele — Migration 003: Prize Configuration & Catalog Game Scores
-- Target: PostgreSQL 16
-- ==============================================================================

-- 1. Dynamic Prize Tier Configurations
CREATE TABLE IF NOT EXISTS prize_configurations (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'default_weekly',
    total_pool_etb INT NOT NULL DEFAULT 40000,
    prize_map JSONB NOT NULL DEFAULT '{"1": 20000, "2": 10000, "3": 5000, "4": 1000, "5": 1000, "6": 1000, "7": 1000, "8": 1000}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ensure initial configured default prize tiers (1st: 20k, 2nd: 10k, 3rd: 5k, 4th-8th: 1k each = 40,000 ETB)
INSERT INTO prize_configurations (id, total_pool_etb, prize_map)
VALUES ('default_weekly', 40000, '{"1": 20000, "2": 10000, "3": 5000, "4": 1000, "5": 1000, "6": 1000, "7": 1000, "8": 1000}'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    total_pool_etb = EXCLUDED.total_pool_etb,
    prize_map = EXCLUDED.prize_map,
    updated_at = NOW();

-- 3. Permanent Database Store for All Non-Tournament Catalog Game High Scores
CREATE TABLE IF NOT EXISTS player_game_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_msisdn VARCHAR(20) NOT NULL,
    game_id VARCHAR(50) NOT NULL,
    high_score INT NOT NULL DEFAULT 0,
    matches_played INT NOT NULL DEFAULT 1,
    last_played_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_player_game_scores UNIQUE (player_msisdn, game_id)
);

CREATE INDEX IF NOT EXISTS idx_player_game_scores_msisdn ON player_game_scores(player_msisdn);
CREATE INDEX IF NOT EXISTS idx_player_game_scores_game ON player_game_scores(game_id, high_score DESC);
