/*
  # Add product link field to requests table

  1. Changes
    - Add `product_link` column to `requests` table to store product URLs
    - This allows users to share links to the products they want to split

  2. Security
    - No additional RLS policies needed as existing policies cover this column
*/

-- Add product_link column to requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'requests' AND column_name = 'product_link'
  ) THEN
    ALTER TABLE requests ADD COLUMN product_link TEXT;
  END IF;
END $$;