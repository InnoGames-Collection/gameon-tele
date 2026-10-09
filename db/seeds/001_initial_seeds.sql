-- ==============================================================================
-- GameOn Tele — Baseline Seeds
-- Active Helix 7-Day Competition Cycle & Top Contenders
-- ==============================================================================

-- 1. Default Telecom Admin Users (Password: Admin@GameOn2026!)
INSERT INTO admin_users (id, username, email, password_hash, role)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'superadmin', 'admin@gameon.innopulseplatform.com', '$2b$10$9dHZSKG/pwgmmpHSCDpSgOLvR.TIDh8zQh0vcAIHBa7Ffud5RNDcq', 'SUPER_ADMIN'),
    ('c0000000-0000-0000-0000-000000000002', 'telecom_auditor', 'auditor@gameon.innopulseplatform.com', '$2b$10$9dHZSKG/pwgmmpHSCDpSgOLvR.TIDh8zQh0vcAIHBa7Ffud5RNDcq', 'AUDITOR')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Active 7-Day Helix Competition Cycle
INSERT INTO competition_cycles (competition_id, cycle_number, start_time, end_time, status, prize_pool_etb)
VALUES 
    ('helix_cycle_w39', 39, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 'ACTIVE', 40000)
ON CONFLICT (competition_id) DO UPDATE SET prize_pool_etb = 40000;

-- 3. Top 10 Weekly Contenders (Masked MSISDNs)
-- Exact 40,000 ETB Allocation: 1st: 20k, 2nd: 10k, 3rd: 5k, 4th-8th: 1k each (Sum: 40k)
INSERT INTO cycle_leaderboard (competition_id, player_msisdn, masked_msisdn, seven_day_score, rank, prize_etb)
VALUES
    ('helix_cycle_w39', '251911998890', '091*****890', 4850, 1, 20000),
    ('helix_cycle_w39', '251922334412', '092*****412', 4320, 2, 10000),
    ('helix_cycle_w39', '251933445589', '093*****589', 3950, 3, 5000),
    ('helix_cycle_w39', '251944556633', '094*****633', 3420, 4, 1000),
    ('helix_cycle_w39', '251955667744', '095*****744', 3180, 5, 1000),
    ('helix_cycle_w39', '251966778855', '096*****855', 2950, 6, 1000),
    ('helix_cycle_w39', '251977889966', '097*****966', 2740, 7, 1000),
    ('helix_cycle_w39', '251988990077', '098*****077', 2510, 8, 1000),
    ('helix_cycle_w39', '251999001188', '099*****188', 2390, 9, 0),
    ('helix_cycle_w39', '251910112299', '091*****299', 2210, 10, 0)
ON CONFLICT (competition_id, player_msisdn) DO UPDATE SET
    seven_day_score = EXCLUDED.seven_day_score,
    rank = EXCLUDED.rank,
    prize_etb = EXCLUDED.prize_etb;

-- 4. Initial Player records for seeded players
INSERT INTO players (msisdn, masked_msisdn, coins, status)
VALUES
    ('251911998890', '091*****890', 250, 'ACTIVE'),
    ('251922334412', '092*****412', 150, 'ACTIVE'),
    ('251933445589', '093*****589', 100, 'ACTIVE'),
    ('251911428890', '091*****890', 100, 'ACTIVE')
ON CONFLICT (msisdn) DO NOTHING;

-- 5. Active Subscriptions for Seeded Players
INSERT INTO subscriptions (msisdn, shortcode, service_id, status, plan_type, price_etb, renew_count)
VALUES
    ('251911998890', '7198', 'srv_gameon_daily', 'ACTIVE', 'daily', 2.00, 39),
    ('251922334412', '7198', 'srv_gameon_daily', 'ACTIVE', 'daily', 2.00, 24),
    ('251933445589', '7198', 'srv_gameon_daily', 'ACTIVE', 'daily', 2.00, 15),
    ('251911428890', '7198', 'srv_gameon_daily', 'ACTIVE', 'daily', 2.00, 5)
ON CONFLICT (msisdn, service_id) DO NOTHING;
