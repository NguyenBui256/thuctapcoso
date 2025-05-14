ALTER TABLE task ADD COLUMN is_deleted BOOLEAN DEFAULT false;
UPDATE task SET is_deleted = false WHERE is_deleted IS NULL; 