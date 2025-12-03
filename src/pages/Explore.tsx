import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Filter, User, Calendar, Search, Award } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { apiListAchievements } from '@/lib/apiClient';

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
      const list = await apiListAchievements({
        type: filter === 'all' ? undefined : filter,
        status: 'approved',
      });
      const mapped = (list || []).map((a: any) => ({
        id: a._id,
        title: a.title,
        description: a.description || a.shortDescription || '',
        type: a.type || 'other',
        tags: a.tags || [],
        achievement_date: a.achievementDate,
        is_featured: a.isFeatured,
        media_url: a.mediaUrl,
        photos: a.photos || [],
        user_id: a.userId,
      }));
      setUsers({});
      setAchievements(mapped as any);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements;

  if (loading) {
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

        <div className="container mx-auto px-4 py-8 max-w-7xl">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
            Discover <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Achievements</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore inspiring accomplishments from our community members and celebrate their success stories
          </p>
        </div>

        {/* Filter Section */}
        <div className="mb-12 bg-white rounded-2xl p-1 shadow-sm border border-gray-100 max-w-2xl mx-auto">
          <div className="flex items-center px-4 py-2">
            <Search className="h-5 w-5 text-gray-400 mr-3" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full h-12 border-0 text-base font-medium text-gray-700 focus:ring-0 focus-visible:ring-0">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-0 shadow-lg [&_*]:list-none [&_*]:p-0 [&_*]:m-0 [&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_li]:list-none [&_li]:p-0 [&_li]:m-0">
                <SelectItem value="all" className="text-base py-3 px-6 hover:bg-gray-50 rounded-lg m-1">
                  <div className="flex items-center">
                    All Categories
                  </div>
                </SelectItem>
                {['hackathon', 'research', 'internship', 'project', 'competition', 'other'].map((type) => {
                  const typeColors: Record<string, { bg: string; text: string }> = {
                    hackathon: { bg: 'bg-red-100', text: 'text-red-700' },
                    research: { bg: 'bg-blue-100', text: 'text-blue-700' },
                    internship: { bg: 'bg-green-100', text: 'text-green-700' },
                    project: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
                    competition: { bg: 'bg-purple-100', text: 'text-purple-700' },
                    other: { bg: 'bg-gray-100', text: 'text-gray-700' }
                  };
                  const color = typeColors[type] || typeColors.other;
                  return (
                    <SelectItem key={type} value={type} className="text-base py-3 px-6 hover:bg-gray-50 rounded-lg m-1">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${color.bg} ${color.text} mr-3`}></div>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="mt-8">
          {filteredAchievements.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
                <Search className="h-12 w-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {filter === 'all' ? 'No achievements yet' : `No ${filter} achievements found`}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {filter === 'all'
                  ? "Be the first to share your achievement!"
                  : `No ${filter} achievements have been shared yet. Try another category or check back later.`
                }
              </p>
              <button 
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 transition-all transform hover:-translate-y-0.5"
                onClick={() => setFilter('all')}
              >
                View All Achievements
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => {
                const user = users[achievement.user_id];
                const typeColors: Record<string, { bg: string; text: string; border: string }> = {
                  hackathon: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
                  research: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                  internship: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-100' },
                  project: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-100' },
                  competition: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
                  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-100' }
                };
                const color = typeColors[achievement.type] || typeColors.other;
                const formattedDate = new Date(achievement.achievement_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <Link
                    key={achievement.id}
                    to={`/achievements/${achievement.id}`}
                    className="group block h-full rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-white border border-gray-100 hover:shadow-lg"
                  >
                    {/* Image */}
                    <div className="relative overflow-hidden aspect-video bg-gray-100">
                      {(achievement.photos?.[0] || achievement.media_url) ? (
                        <img
                          src={achievement.photos?.[0] || achievement.media_url || ''}
                          alt={achievement.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <Award className="h-16 w-16 text-gray-300" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Type Badge */}
                      <span className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-semibold ${color.bg} ${color.text} backdrop-blur-sm`}>
                        {achievement.type}
                      </span>
                      
                      {/* Date Badge */}
                      <span className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-gray-700 backdrop-blur-sm">
                        {formattedDate}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {achievement.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {achievement.description}
                      </p>

                      {/* Tags */}
                      {achievement.tags && achievement.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                          {achievement.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {achievement.tags.length > 3 && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-400">
                              +{achievement.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
