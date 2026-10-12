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

-- 6. Initial Database High Scores for Catalog Games (PostgreSQL Authoritative)
INSERT INTO player_game_scores (player_msisdn, game_id, high_score, matches_played, last_played_at)
VALUES
    -- Pop Balloon
    ('251911998890', 'pop-balloon', 19450, 42, NOW() - INTERVAL '2 hours'),
    ('251922334412', 'pop-balloon', 18920, 38, NOW() - INTERVAL '5 hours'),
    ('251933445589', 'pop-balloon', 18410, 31, NOW() - INTERVAL '1 day'),
    ('251911428890', 'pop-balloon', 17850, 24, NOW() - INTERVAL '3 hours'),

    -- Fruit Slice
    ('251911998890', 'fruit-slice', 12850, 35, NOW() - INTERVAL '3 hours'),
    ('251922334412', 'fruit-slice', 12620, 29, NOW() - INTERVAL '6 hours'),
    ('251933445589', 'fruit-slice', 12410, 25, NOW() - INTERVAL '1 day'),
    ('251911428890', 'fruit-slice', 11980, 20, NOW() - INTERVAL '4 hours'),

    -- Moto Race
    ('251911998890', 'moto-race', 18920, 50, NOW() - INTERVAL '1 hour'),
    ('251922334412', 'moto-race', 18745, 44, NOW() - INTERVAL '4 hours'),
    ('251933445589', 'moto-race', 18520, 39, NOW() - INTERVAL '8 hours'),
    ('251911428890', 'moto-race', 17890, 32, NOW() - INTERVAL '2 hours'),

    -- Candy Blast
    ('251911998890', 'candy-blast', 38450, 48, NOW() - INTERVAL '5 hours'),
    ('251922334412', 'candy-blast', 35210, 40, NOW() - INTERVAL '7 hours'),
    ('251933445589', 'candy-blast', 32670, 33, NOW() - INTERVAL '1 day'),
    ('251911428890', 'candy-blast', 29840, 28, NOW() - INTERVAL '3 hours'),

    -- Sorting Balls
    ('251911998890', 'sorting-balls', 32450, 40, NOW() - INTERVAL '6 hours'),
    ('251922334412', 'sorting-balls', 28900, 34, NOW() - INTERVAL '9 hours'),
    ('251933445589', 'sorting-balls', 25400, 29, NOW() - INTERVAL '1 day'),
    ('251911428890', 'sorting-balls', 21850, 22, NOW() - INTERVAL '4 hours'),

    -- Emoji Sorting Ball
    ('251911998890', 'emoji-sorting-ball', 33200, 41, NOW() - INTERVAL '2 hours'),
    ('251922334412', 'emoji-sorting-ball', 30450, 36, NOW() - INTERVAL '5 hours'),
    ('251933445589', 'emoji-sorting-ball', 26800, 30, NOW() - INTERVAL '12 hours'),
    ('251911428890', 'emoji-sorting-ball', 22400, 25, NOW() - INTERVAL '1 hour'),

    -- Emoji IQ
    ('251911998890', 'emoji-iq', 38400, 45, NOW() - INTERVAL '3 hours'),
    ('251922334412', 'emoji-iq', 35120, 39, NOW() - INTERVAL '6 hours'),
    ('251933445589', 'emoji-iq', 33450, 32, NOW() - INTERVAL '1 day'),
    ('251911428890', 'emoji-iq', 31200, 27, NOW() - INTERVAL '2 hours'),

    -- Emoji Fun
    ('251911998890', 'emoji-fun', 48720, 32, NOW() - INTERVAL '2 hours'),
    ('251922334412', 'emoji-fun', 46350, 30, NOW() - INTERVAL '5 hours'),
    ('251933445589', 'emoji-fun', 44180, 29, NOW() - INTERVAL '1 day'),
    ('251911428890', 'emoji-fun', 41890, 27, NOW() - INTERVAL '3 hours'),

    -- Hill Rider / Hill Climb
    ('251911998890', 'hill-rider', 14850, 33, NOW() - INTERVAL '4 hours'),
    ('251922334412', 'hill-rider', 13920, 28, NOW() - INTERVAL '8 hours'),
    ('251933445589', 'hill-rider', 12640, 22, NOW() - INTERVAL '1 day'),
    ('251911428890', 'hill-rider', 11480, 19, NOW() - INTERVAL '3 hours'),

    -- Knife Madness
    ('251911998890', 'knife-madness', 1420, 55, NOW() - INTERVAL '1 hour'),
    ('251922334412', 'knife-madness', 1285, 48, NOW() - INTERVAL '4 hours'),
    ('251933445589', 'knife-madness', 1140, 40, NOW() - INTERVAL '7 hours'),
    ('251911428890', 'knife-madness', 980, 35, NOW() - INTERVAL '2 hours'),

    -- World Legends
    ('251911998890', 'world-legends', 14850, 30, NOW() - INTERVAL '6 hours'),
    ('251922334412', 'world-legends', 13920, 25, NOW() - INTERVAL '10 hours'),
    ('251933445589', 'world-legends', 12640, 21, NOW() - INTERVAL '1 day'),
    ('251911428890', 'world-legends', 11480, 17, NOW() - INTERVAL '5 hours'),

    -- Soccer Shooter
    ('251911998890', 'soccer-shooter', 24800, 36, NOW() - INTERVAL '2 hours'),
    ('251922334412', 'soccer-shooter', 22100, 31, NOW() - INTERVAL '5 hours'),
    ('251933445589', 'soccer-shooter', 19500, 26, NOW() - INTERVAL '12 hours'),
    ('251911428890', 'soccer-shooter', 18200, 22, NOW() - INTERVAL '3 hours'),

    -- Pop Piano
    ('251911998890', 'pop-piano', 16500, 28, NOW() - INTERVAL '3 hours'),
    ('251922334412', 'pop-piano', 15200, 24, NOW() - INTERVAL '7 hours'),
    ('251933445589', 'pop-piano', 14100, 20, NOW() - INTERVAL '1 day'),
    ('251911428890', 'pop-piano', 13400, 18, NOW() - INTERVAL '4 hours'),

    -- Dama
    ('251911998890', 'dama', 9800, 22, NOW() - INTERVAL '4 hours'),
    ('251922334412', 'dama', 8900, 19, NOW() - INTERVAL '8 hours'),
    ('251933445589', 'dama', 8100, 16, NOW() - INTERVAL '1 day'),
    ('251911428890', 'dama', 7600, 14, NOW() - INTERVAL '2 hours')
ON CONFLICT (player_msisdn, game_id) DO UPDATE SET
    high_score = EXCLUDED.high_score,
    matches_played = EXCLUDED.matches_played,
    last_played_at = EXCLUDED.last_played_at;
