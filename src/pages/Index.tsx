import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import PolaroidCard from '@/components/PolaroidCard';
import { apiListAchievements } from '@/lib/apiClient';

type Achievement = {
  id: string;
  title: string;
  short_description: string;
  media_url?: string;
  photos?: string[] | null;
  upvotes: number;
};

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const tilts = [-4, -2, 1, 3, 5];
  const totalCards = achievements.length + 1;
  const forceTwoCols = totalCards <= 3;

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchAchievements();
    }
  }, [user, loading, navigate]);

  const fetchAchievements = async () => {
    try {
      const list = await apiListAchievements({ status: 'approved' });
      const mapped = (list || [])
        .slice(0, 10)
        .map((a: any) => ({
          id: a._id,
          title: a.title,
          short_description: a.shortDescription || a.description || '',
          media_url: a.mediaUrl,
          photos: a.photos || [],
          upvotes: a.upvotes || 0,
        }));
      setAchievements(mapped as any);
    } catch (e) {
      console.error('Error fetching achievements:', e);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <div className="relative min-h-screen">
      <Navbar />

      {/* Clean subtle background - no blobs! */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(#bfc0c1 7.2%, transparent 0)',
          backgroundSize: '30px 30px',
          backgroundRepeat: 'repeat'
        }}
      />

      <div className="container mx-auto px-4 py-10 md:py-14 max-w-6xl">
        <div className="mb-12 md:mb-16 text-center">
          <h1
            className="text-5xl md:text-6xl font-bold mb-3 tracking-tight"
            style={{
              fontFamily: '"Permanent Marker", cursive',
              color: '#2d3748',
              textShadow: '2px 2px 0px rgba(139, 92, 246, 0.1)'
            }}
          >
            Wall of Fame
          </h1>

        </div>

        <div className={(forceTwoCols ? 'grid grid-cols-2' : 'grid grid-cols-[repeat(auto-fill,minmax(210px,1fr))]') + ' gap-10 justify-items-center'}>
          {achievements.map((achievement, index) => (
            <PolaroidCard
              key={achievement.id}
              image={achievement.photos?.[0] || achievement.media_url || ''}
              text={achievement.short_description}
              href={`/achievements/${achievement.id}`}
              tilt={tilts[index % tilts.length]}
            />
          ))}

          <PolaroidCard
            variant="mystery"
            text="Could be you!"
            href="/submit"
            tilt={2}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;