import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Calendar, User, Filter, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type Achievement = {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  achievement_date: string;
  is_featured: boolean;
  profiles: {
    name: string;
    email: string;
  };
};

export default function Explore() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

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
        profiles:user_id (
          name,
          email
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('type', filter as any);
    }

    const { data, error } = await query;

    if (error) {
      toast.error('Failed to load achievements');
    } else {
      setAchievements(data as any);
    }
    setLoading(false);
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
              Explore Achievements
            </h1>
            <p className="text-muted-foreground">Discover what your peers have accomplished</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
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
          <Card className="glass-card text-center py-12">
            <CardContent>
              <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No achievements found</h3>
              <p className="text-muted-foreground">
                {filter === 'all' 
                  ? 'Be the first to share your achievement!' 
                  : 'Try changing the filter to see more achievements'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => (
              <Card 
                key={achievement.id} 
                className="glass-card hover-lift cursor-pointer animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getTypeColor(achievement.type)}>
                      {achievement.type}
                    </Badge>
                    {achievement.is_featured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  <CardTitle className="line-clamp-2">{achievement.title}</CardTitle>
                  <CardDescription className="line-clamp-3">{achievement.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{achievement.profiles.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(achievement.achievement_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
