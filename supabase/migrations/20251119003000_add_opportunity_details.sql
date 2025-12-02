-- Add new fields to opportunities table
ALTER TABLE opportunities
ADD COLUMN thumbnail_url TEXT,
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN short_description TEXT,
ADD COLUMN deadline DATE,
ADD COLUMN location TEXT,
ADD COLUMN eligibility TEXT,
ADD COLUMN organizer_info JSONB DEFAULT '{}',
ADD COLUMN apply_url TEXT,
ADD COLUMN details_url TEXT,
ADD COLUMN join_team_url TEXT,
ADD COLUMN type TEXT DEFAULT 'other',
ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'draft'));

-- Add index for better performance
CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);

-- Add comment for organizer_info structure
COMMENT ON COLUMN opportunities.organizer_info IS 'JSON object containing organizer details: {name, email, profile_image_url, role}';
