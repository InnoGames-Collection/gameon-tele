-- ==============================================================================
-- GameOn Tele — Migration 004: Update Shortcode to 7198
-- Target: PostgreSQL 16
-- ==============================================================================

ALTER TABLE subscriptions ALTER COLUMN shortcode SET DEFAULT '7198';

UPDATE subscriptions SET shortcode = '7198' WHERE shortcode != '7198';
