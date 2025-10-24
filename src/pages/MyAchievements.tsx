import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      hackathon: 'bg-primary/10 text-primary border-primary/20',
      research: 'bg-accent/10 text-accent border-accent/20',
      internship: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      project: 'bg-green-500/10 text-green-500 border-green-500/20',
      competition: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      other: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
    return colors[type] || colors.other;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              My Achievements
            </h1>
            <p className="text-muted-foreground">Track and manage all your accomplishments</p>
          </div>
          
          <Button 
            onClick={() => navigate('/submit')}
            className="gradient-primary shadow-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Achievement
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <Card className="glass-card text-center py-16">
            <CardContent>
              <Award className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No achievements yet</h3>
              <p className="text-muted-foreground mb-6">
                Start building your portfolio by adding your first achievement
              </p>
              <Button onClick={() => navigate('/submit')} className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Achievement
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <Card 
                key={achievement.id} 
                className="glass-card hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {achievement.media_url && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <img 
                      src={achievement.media_url} 
                      alt={achievement.title} 
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getTypeColor(achievement.type)}>
                      {achievement.type}
                    </Badge>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(achievement.status)}
                      <Badge className={getStatusColor(achievement.status)}>
                        {achievement.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
                  <CardDescription className="line-clamp-1 text-muted-foreground">
                    {achievement.short_description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {achievement.description}
                  </p>
                  {achievement.tags && achievement.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {achievement.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {achievement.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{achievement.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground pt-2 border-t">
                    {new Date(achievement.achievement_date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
