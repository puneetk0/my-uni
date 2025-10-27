import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Filter, Trophy, Sparkles, Star, User, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

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
};

export default function Explore() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchAchievements();
  }, [filter]);

  const fetchAchievements = async () => {
    setLoading(true);
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
        photos
      `)
      .eq('status', 'approved')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load achievements');
    } else {
      setAchievements(data as Achievement[]);
    }
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      hackathon: { bg: '#e6f0ff', text: '#3271f0', border: '#3271f0' },
      research: { bg: '#f0e6ff', text: '#7c3aed', border: '#7c3aed' },
      internship: { bg: '#dbeafe', text: '#1e40af', border: '#1e40af' },
      project: { bg: '#d1fae5', text: '#065f46', border: '#10b981' },
      competition: { bg: '#fed7aa', text: '#c2410c', border: '#f97316' },
      other: { bg: '#e5e7eb', text: '#4b5563', border: '#6b7280' },
    };
    return colors[type] || colors.other;
  };

  // Separate featured achievements
  const featuredAchievements = achievements.filter(a => a.is_featured);
  const regularAchievements = achievements.filter(a => !a.is_featured);

  return (
    <div className="min-h-screen relative">
      <Navbar />
      
      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#faf8f5',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px)',
          backgroundSize: '50px 50px'
        }}
      />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h1 
              className="text-3xl md:text-4xl font-bold mb-2 tracking-tight"
              style={{
                fontFamily: '"Inter", sans-serif',
                color: '#1a202c',
                letterSpacing: '-0.02em'
              }}
            >
              Explore Achievements
            </h1>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              Discover what your peers have accomplished
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4" style={{ color: '#718096' }} />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger 
                className="w-[180px] h-10 border-gray-200"
                style={{ borderRadius: '10px' }}
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
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="animate-pulse"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="space-y-3">
                  <div className="h-40 bg-gray-200 rounded-lg" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div 
            className="text-center"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.08)',
              padding: '4rem 2rem'
            }}
          >
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
                opacity: 0.1
              }}
            >
              <Trophy className="h-10 w-10" style={{ color: '#3271f0' }} />
            </div>
            <h3 
              className="text-xl font-bold mb-3"
              style={{
                color: '#1a202c',
                fontFamily: '"Inter", sans-serif'
              }}
            >
              No achievements found
            </h3>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              {filter === 'all' 
                ? 'Be the first to share your achievement!' 
                : 'Try changing the filter to see more achievements'}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Section */}
            {featuredAchievements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="h-5 w-5" style={{ color: '#f59e0b' }} />
                  <h2 
                    className="text-2xl font-bold"
                    style={{ 
                      color: '#1a202c',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    Featured Achievements
                  </h2>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {featuredAchievements.map((achievement) => {
                    const typeColors = getTypeColor(achievement.type);
                    
                    return (
                      <div
                        key={achievement.id}
                        className="group relative overflow-hidden transition-all hover:shadow-2xl cursor-pointer"
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '20px',
                          border: '2px solid #fbbf24'
                        }}
                      >
                        {/* Featured Badge */}
                        <div 
                          className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                          style={{ 
                            backgroundColor: '#fef3c7',
                            color: '#92400e',
                            boxShadow: '0 2px 8px rgba(251, 191, 36, 0.3)'
                          }}
                        >
                          <Star className="h-3.5 w-3.5 fill-current" />
                          FEATURED
                        </div>

                        {/* Image */}
                        {(achievement.photos?.[0] || achievement.media_url) && (
                          <div className="relative h-56 overflow-hidden">
                            <img 
                              src={achievement.photos?.[0] || achievement.media_url || ''} 
                              alt={achievement.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 100%)'
                              }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-6">
                          {/* Type Badge */}
                          <span
                            className="inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-3"
                            style={{
                              backgroundColor: typeColors.bg,
                              color: typeColors.text
                            }}
                          >
                            {achievement.type}
                          </span>

                          {/* Title */}
                          <h3 
                            className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-[#3271f0] transition-colors"
                            style={{ 
                              color: '#1a202c',
                              fontFamily: '"Inter", sans-serif'
                            }}
                          >
                            {achievement.title}
                          </h3>

                          {/* Description */}
                          <p 
                            className="text-sm mb-4 line-clamp-3"
                            style={{ color: '#4a5568' }}
                          >
                            {achievement.description}
                          </p>

                          {/* Tags */}
                          {achievement.tags && achievement.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {achievement.tags.slice(0, 4).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2.5 py-1 text-xs font-medium rounded-md"
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Footer */}
                          <div 
                            className="flex items-center justify-between text-xs pt-4"
                            style={{ 
                              borderTop: '1px solid #e2e8f0',
                              color: '#718096'
                            }}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="font-medium truncate">{user?.email || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(achievement.achievement_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Regular Achievements */}
            {regularAchievements.length > 0 && (
              <div>
                {featuredAchievements.length > 0 && (
                  <h2 
                    className="text-2xl font-bold mb-6"
                    style={{ 
                      color: '#1a202c',
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    All Achievements
                  </h2>
                )}
                
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {regularAchievements.map((achievement) => {
                    const typeColors = getTypeColor(achievement.type);
                    
                    return (
                      <div
                        key={achievement.id}
                        className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer"
                        style={{
                          backgroundColor: '#ffffff',
                          borderRadius: '16px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        {/* Image */}
                        {(achievement.photos?.[0] || achievement.media_url) && (
                          <div className="relative h-44 overflow-hidden">
                            <img 
                              src={achievement.photos?.[0] || achievement.media_url || ''} 
                              alt={achievement.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div 
                              className="absolute inset-0"
                              style={{
                                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.05) 100%)'
                              }}
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="p-5">
                          {/* Type Badge */}
                          <span
                            className="inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3"
                            style={{
                              backgroundColor: typeColors.bg,
                              color: typeColors.text
                            }}
                          >
                            {achievement.type}
                          </span>

                          {/* Title */}
                          <h3 
                            className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-[#3271f0] transition-colors"
                            style={{ 
                              color: '#1a202c',
                              fontFamily: '"Inter", sans-serif'
                            }}
                          >
                            {achievement.title}
                          </h3>

                          {/* Description */}
                          <p 
                            className="text-sm mb-4 line-clamp-2"
                            style={{ color: '#4a5568' }}
                          >
                            {achievement.description}
                          </p>

                          {/* Tags */}
                          {achievement.tags && achievement.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {achievement.tags.slice(0, 3).map((tag, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 text-xs font-medium rounded-md"
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569',
                                    border: '1px solid #e2e8f0'
                                  }}
                                >
                                  {tag}
                                </span>
                              ))}
                              {achievement.tags.length > 3 && (
                                <span
                                  className="px-2 py-0.5 text-xs font-medium rounded-md"
                                  style={{
                                    backgroundColor: '#f1f5f9',
                                    color: '#475569'
                                  }}
                                >
                                  +{achievement.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Footer */}
                          <div 
                            className="flex items-center justify-between text-xs pt-3"
                            style={{ 
                              borderTop: '1px solid #e2e8f0',
                              color: '#718096'
                            }}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="font-medium truncate">{user?.email || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(achievement.achievement_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}