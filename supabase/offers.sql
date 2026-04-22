-- Create offers table
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  peripheral_id UUID REFERENCES public.peripherals(id) ON DELETE SET NULL,
  value DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'BRL',
  currency_symbol TEXT NOT NULL DEFAULT 'R$',
  coupon_code TEXT,
  link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Keep compatibility with older schemas while the app no longer uses description.
ALTER TABLE offers ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS peripheral_id UUID;
ALTER TABLE offers ALTER COLUMN description DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'offers_peripheral_id_fkey'
  ) THEN
    ALTER TABLE offers
      ADD CONSTRAINT offers_peripheral_id_fkey
      FOREIGN KEY (peripheral_id)
      REFERENCES public.peripherals(id)
      ON DELETE SET NULL;
  END IF;
END;
$$;

-- Create index for chronological ordering and status filtering
CREATE INDEX IF NOT EXISTS offers_created_at_idx ON offers(created_at DESC);
CREATE INDEX IF NOT EXISTS offers_status_idx ON offers(status);
CREATE INDEX IF NOT EXISTS offers_peripheral_id_idx ON offers(peripheral_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS offers_updated_at_trigger ON offers;
CREATE TRIGGER offers_updated_at_trigger
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_offers_updated_at();

-- Enable RLS (Row Level Security) on offers table
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active, non-expired offers
CREATE POLICY "View public active offers" ON offers
  FOR SELECT
  USING (status = 'active' AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP));

-- Policies for authenticated admin management.
-- Fine-grained permission checks remain enforced in Next.js API routes.
CREATE POLICY "Authenticated can read offers" ON offers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can insert offers" ON offers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can update offers" ON offers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can delete offers" ON offers
  FOR DELETE
  TO authenticated
  USING (true);
