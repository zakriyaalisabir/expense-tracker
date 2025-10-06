-- Add enabled field to goals table
ALTER TABLE goals ADD COLUMN enabled BOOLEAN NOT NULL DEFAULT true;