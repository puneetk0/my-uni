import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Award, Clock, CheckCircle, XCircle, Calendar, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type Achievement = {
  id: string;
  title: string;
  short_description: string;
  description: string;
  type: string;
  tags: string[];
  achievement_date: string;
  media_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
};

export default function MyAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchMyAchievements();
    }
  }, [user]);

  const fetchMyAchievements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load your achievements');
    } else {
      setAchievements(data);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>
            <CheckCircle className="h-3.5 w-3.5" />
            Approved
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
            <XCircle className="h-3.5 w-3.5" />
            Rejected
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
            <Clock className="h-3.5 w-3.5" />
            Pending Review
          </div>
        );
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string; accent: string }> = {
      hackathon: { bg: '#e6f0ff', text: '#3271f0', accent: '#3271f0' },
      research: { bg: '#f0e6ff', text: '#7c3aed', accent: '#7c3aed' },
      internship: { bg: '#dbeafe', text: '#1e40af', accent: '#1e40af' },
      project: { bg: '#d1fae5', text: '#065f46', accent: '#10b981' },
      competition: { bg: '#fed7aa', text: '#c2410c', accent: '#f97316' },
      other: { bg: '#e5e7eb', text: '#4b5563', accent: '#6b7280' },
    };
    return colors[type] || colors.other;
  };

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
              My Achievements
            </h1>
            <p style={{ color: '#718096', fontSize: '0.95rem' }}>
              {achievements.length} {achievements.length === 1 ? 'achievement' : 'achievements'} and counting
            </p>
          </div>
          
          <Button 
            onClick={() => navigate('/submit')}
            className="text-white font-semibold h-11 px-6 transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
              borderRadius: '10px',
              boxShadow: '0 4px 16px rgba(50, 113, 240, 0.3)'
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
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
                <div className="flex gap-6">
                  <div className="w-48 h-32 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
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
              <Award className="h-10 w-10" style={{ color: '#3271f0' }} />
            </div>
            <h3 
              className="text-xl font-bold mb-3"
              style={{ color: '#1a202c', fontFamily: '"Inter", sans-serif' }}
            >
              No achievements yet
            </h3>
            <p className="mb-8" style={{ color: '#718096', fontSize: '0.95rem' }}>
              Start building your portfolio by adding your first achievement
            </p>
            <Button 
              onClick={() => navigate('/submit')}
              className="text-white font-semibold h-11 px-6"
              style={{
                background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(50, 113, 240, 0.3)'
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Achievement
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const typeColors = getTypeColor(achievement.type);
              
              return (
                <div 
                  key={achievement.id}
                  className="group relative overflow-hidden transition-all hover:shadow-2xl"
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                  }}
                >
                  {/* Colored accent bar on left */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                    style={{ backgroundColor: typeColors.accent }}
                  />

                  <div className="flex flex-col md:flex-row gap-6 p-6 pl-8">
                    {/* Image Section */}
                    {achievement.media_url && (
                      <div 
                        className="relative w-full md:w-64 h-48 md:h-40 flex-shrink-0 overflow-hidden group/img cursor-pointer"
                        style={{
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <img 
                          src={achievement.media_url} 
                          alt={achievement.title} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                        />
                        <div 
                          className="absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"
                          style={{
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(2px)'
                          }}
                        >
                          <span className="text-white text-sm font-semibold">View Full Size</span>
                        </div>
                      </div>
                    )}

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      {/* Top Row: Status and Type */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{
                            backgroundColor: typeColors.bg,
                            color: typeColors.text
                          }}
                        >
                          {achievement.type}
                        </span>
                        {getStatusBadge(achievement.status)}
                        {achievement.is_featured && (
                          <div 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-2xl font-bold mb-2 transition-colors group-hover:text-[#3271f0]"
                        style={{ 
                          color: '#1a202c',
                          fontFamily: '"Inter", sans-serif',
                          lineHeight: '1.3'
                        }}
                      >
                        {achievement.title}
                      </h3>

                      {/* Short Description */}
                      <p 
                        className="text-base mb-4 leading-relaxed"
                        style={{ color: '#4a5568' }}
                      >
                        {achievement.short_description}
                      </p>

                      {/* Full Description - Expandable */}
                      <p 
                        className="text-sm mb-4 leading-relaxed line-clamp-2"
                        style={{ color: '#718096' }}
                      >
                        {achievement.description}
                      </p>

                      {/* Bottom Row: Tags and Date */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Tags */}
                        {achievement.tags && achievement.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {achievement.tags.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 text-xs font-medium rounded-md transition-colors hover:bg-opacity-80"
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

                        {/* Date */}
                        <div 
                          className="flex items-center gap-2 ml-auto text-sm font-medium"
                          style={{ color: '#718096' }}
                        >
                          <Calendar className="h-4 w-4" />
                          {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}