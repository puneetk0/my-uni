
-- 1. Allow users to read all approved opportunities
CREATE POLICY "Allow read access to approved opportunities" ON opportunities
FOR SELECT
USING (is_approved = true);

-- 2. Allow authenticated users to create new opportunities
CREATE POLICY "Allow authenticated users to create opportunities" ON opportunities
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow users to update their own opportunities
CREATE POLICY "Allow users to update their own opportunities" ON opportunities
FOR UPDATE
USING (auth.uid() = created_by);

-- 4. Allow faculty members to approve opportunities
CREATE POLICY "Allow faculty to approve opportunities" ON opportunities
FOR UPDATE
USING (EXISTS (
  SELECT 1
  FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'faculty'
))
WITH CHECK (EXISTS (
  SELECT 1
  FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'faculty'
));
