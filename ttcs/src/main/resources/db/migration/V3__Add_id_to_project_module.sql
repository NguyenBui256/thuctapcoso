-- Add id column to project_module table if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "project_module";
SET @columnname = "id";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
    AND
      (TABLE_NAME = @tablename)
    AND
      (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 1",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " BIGINT AUTO_INCREMENT PRIMARY KEY")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists; 