-- Fix null values in is_deleted column by setting them to false
UPDATE project SET is_deleted = false WHERE is_deleted IS NULL; 