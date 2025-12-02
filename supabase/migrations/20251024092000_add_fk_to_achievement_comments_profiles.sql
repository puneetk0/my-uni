
ALTER TABLE achievement_comments
ADD CONSTRAINT achievement_comments_user_id_fkey_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;
