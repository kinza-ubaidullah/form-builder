-- Add col_span column to form_fields table for Grid Layout support
ALTER TABLE form_fields ADD COLUMN IF NOT EXISTS col_span integer DEFAULT 2;

-- Add description
COMMENT ON COLUMN form_fields.col_span IS 'Grid column span (1-4) for layout control';
