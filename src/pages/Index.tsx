import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import PolaroidCard from '@/components/PolaroidCard';

type Achievement = {
  id: string;
  title: string;
  short_description: string;
  media_url?: string;
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchAchievements();
    }
  }, [user, loading, navigate]);

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('id, title, short_description, media_url')
      .limit(10)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
    } else {
      setAchievements(data || []);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <PolaroidCard
              key={achievement.id}
              image={achievement.media_url || ''}
              text={achievement.short_description}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
