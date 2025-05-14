ALTER TABLE user_story ADD COLUMN is_deleted BOOLEAN DEFAULT false;
UPDATE user_story SET is_deleted = false WHERE is_deleted IS NULL; 