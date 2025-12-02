import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Filter, User, Calendar, Search, Award } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

type Achievement = {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  achievement_date: string;
  is_featured: boolean;
  media_url?: string;
  photos?: string[] | null;
  user_id: string;
};

type User = {
  id: string;
  email: string;
};

export default function Explore() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchAchievements();
  }, [filter]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('achievements')
        .select(`
          id,
          title,
          description,
          type,
          tags,
          achievement_date,
          is_featured,
          media_url,
          photos,
          user_id
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data: achievementsData, error: achievementsError } = await query;

      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        toast.error('Failed to load achievements');
        return;
      }

      if (achievementsData) {
        // Fetch user data for each achievement
        const userIds = [...new Set(achievementsData.map(a => a.user_id).filter(Boolean))];

        if (userIds.length > 0) {
          const { data: usersData, error: usersError } = await supabase
            .from('profiles')
            .select('id, email')
            .in('id', userIds);

          if (usersError) {
            console.error('Error fetching users:', usersError);
          } else if (usersData && Array.isArray(usersData)) {
            const usersMap = usersData.reduce((acc, user) => {
              if (user && typeof user === 'object' && user !== null) {
                const typedUser = user as { id: string; email: string };
                acc[typedUser.id] = typedUser as User;
              }
              return acc;
            }, {} as Record<string, User>);
            setUsers(usersMap);
          }
        } else {
          setUsers({});
        }

        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while loading achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements;

  if (loading) {
    return (
      <div className="min-h-screen outer-green-bg">
        <Navbar />
        <div className="container mx-auto px-4 py-10 max-w-7xl">
          <div className="bg-white rounded-[28px] p-10 shadow-sm border border-slate-100 min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-green-600"></div>
              <p className="text-gray-600 font-semibold">Loading achievements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen outer-green-bg">
      <Navbar />
      <div className="container mx-auto px-4 pt-8 pb-6 max-w-7xl">
        <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 md:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl md:text-5xl font-bold mb-3"
            style={{
              fontFamily: '"Inter", sans-serif',
              color: '#111827',
              letterSpacing: '-0.02em'
            }}
          >
            Explore Achievements
          </h1>
          <p className="text-base md:text-lg" style={{ color: '#6b7280' }}>
            Discover inspiring stories from our community
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="flex items-center justify-center gap-3 p-4 mb-8 rounded-xl"
          style={{
            backgroundColor: 'white',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)',
            maxWidth: '400px',
            margin: '0 auto 2rem'
          }}
        >
          <Filter className="h-4 w-4" style={{ color: '#9ca3af' }} />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger
              className="w-full h-10 border-0 focus:ring-0 font-medium"
              style={{ color: '#374151' }}
            >
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="research">Research</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="competition">Competition</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div
            className="text-center py-20 px-8 rounded-2xl"
            style={{
              backgroundColor: '#ffffff',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#f3f4f6' }}
            >
              <Search className="h-10 w-10" style={{ color: '#9ca3af' }} />
            </div>
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: '#374151' }}
            >
              No achievements found
            </h3>
            <p style={{ color: '#9ca3af' }}>
              {filter === 'all'
                ? "No achievements have been approved yet. Check back soon!"
                : `No ${filter} achievements found. Try a different filter.`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAchievements.map((achievement) => {
              const user = users[achievement.user_id];
              const typeColors: Record<string, { bg: string; text: string }> = {
                hackathon: { bg: '#fef2f2', text: '#dc2626' },
                research: { bg: '#eff6ff', text: '#2563eb' },
                internship: { bg: '#f0fdf4', text: '#16a34a' },
                project: { bg: '#fffbeb', text: '#d97706' },
                competition: { bg: '#faf5ff', text: '#9333ea' },
                other: { bg: '#f9fafb', text: '#6b7280' }
              };
              const typeColor = typeColors[achievement.type] || typeColors.other;

              return (
                <Link
                  key={achievement.id}
                  to={`/achievements/${achievement.id}`}
                  className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  {/* Image */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: '16/9', backgroundColor: '#f3f4f6' }}>
                    {(achievement.photos?.[0] || achievement.media_url) ? (
                      <img
                        src={achievement.photos?.[0] || achievement.media_url || ''}
                        alt={achievement.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Award className="h-12 w-12" style={{ color: '#d1d5db' }} />
                      </div>
                    )}

                    {/* Type Badge */}
                    <div
                      className="absolute top-3 left-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide"
                      style={{
                        backgroundColor: typeColor.bg,
                        color: typeColor.text
                      }}
                    >
                      {achievement.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors"
                      style={{
                        color: '#111827',
                        fontFamily: '"Inter", sans-serif'
                      }}
                    >
                      {achievement.title}
                    </h3>

                    <p
                      className="text-sm mb-4 line-clamp-2"
                      style={{ color: '#6b7280' }}
                    >
                      {achievement.description}
                    </p>

                    {/* Tags */}
                    {achievement.tags && achievement.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {achievement.tags.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 text-xs font-medium rounded-md"
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280'
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {achievement.tags.length > 2 && (
                          <span
                            className="px-2.5 py-1 text-xs font-medium rounded-md"
                            style={{
                              backgroundColor: '#f3f4f6',
                              color: '#6b7280'
                            }}
                          >
                            +{achievement.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div
                      className="flex items-center justify-between text-xs pt-4"
                      style={{
                        borderTop: '1px solid #f3f4f6',
                        color: '#9ca3af'
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span className="font-medium">{user?.email?.split('@')[0] || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(achievement.achievement_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
