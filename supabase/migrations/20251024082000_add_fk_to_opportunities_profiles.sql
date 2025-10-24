
ALTER TABLE opportunities
ADD CONSTRAINT opportunities_created_by_fkey_profiles
FOREIGN KEY (created_by)
REFERENCES profiles(id)
ON DELETE CASCADE;
