-- ==============================================================================
-- GameOn Tele — Baseline Seeds
-- Active Helix 7-Day Competition Cycle & Top Contenders
-- ==============================================================================

-- 1. Default Telecom Admin Users
INSERT INTO admin_users (id, username, email, password_hash, role)
VALUES 
    ('c0000000-0000-0000-0000-000000000001', 'superadmin', 'admin@gameon.innopulseplatform.com', '$2b$10$7Z/l8K9QZg4e1oU6Qk7sNuR1aLzBvY7p0oQY6dZtLw6oVqZl9rQeS', 'SUPER_ADMIN'),
    ('c0000000-0000-0000-0000-000000000002', 'telecom_auditor', 'auditor@gameon.innopulseplatform.com', '$2b$10$7Z/l8K9QZg4e1oU6Qk7sNuR1aLzBvY7p0oQY6dZtLw6oVqZl9rQeS', 'AUDITOR')
ON CONFLICT (username) DO NOTHING;

-- 2. Active 7-Day Helix Competition Cycle
INSERT INTO competition_cycles (competition_id, cycle_number, start_time, end_time, status, prize_pool_etb)
VALUES 
    ('helix_cycle_w39', 39, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 'ACTIVE', 40000)
ON CONFLICT (competition_id) DO NOTHING;

-- 3. Top 10 Weekly Contenders (Masked MSISDNs)
INSERT INTO cycle_leaderboard (competition_id, player_msisdn, masked_msisdn, seven_day_score, rank, prize_etb)
VALUES
    ('helix_cycle_w39', '251911998890', '091*****890', 4850, 1, 20000),
    ('helix_cycle_w39', '251922334412', '092*****412', 4320, 2, 12000),
    ('helix_cycle_w39', '251933445589', '093*****589', 3950, 3, 5000),
    ('helix_cycle_w39', '251944556633', '094*****633', 3420, 4, 1000),
    ('helix_cycle_w39', '251955667744', '095*****744', 3180, 5, 1000),
    ('helix_cycle_w39', '251966778855', '096*****855', 2950, 6, 1000),
    ('helix_cycle_w39', '251977889966', '097*****966', 2740, 7, 1000),
    ('helix_cycle_w39', '251988990077', '098*****077', 2510, 8, 1000),
    ('helix_cycle_w39', '251999001188', '099*****188', 2390, 9, 1000),
    ('helix_cycle_w39', '251910112299', '091*****299', 2210, 10, 1000)
ON CONFLICT (competition_id, player_msisdn) DO NOTHING;
