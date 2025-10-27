
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Award, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';

type Achievement = {
  id: string;
  title: string;
  short_description: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  achievement_date: string;
  media_url: string | null;
};

export default function Profile() {
  const { user, userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileAndAchievements();
    }
  }, [user]);

  const fetchProfileAndAchievements = async () => {
    setLoading(true);
    // Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url, department')
      .eq('id', user?.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code
      });
    } else {
      setProfile(profileData);
    }

    // Fetch achievements
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, title, short_description, type, status, achievement_date, media_url')
      .eq('user_id', user?.id)
      .order('achievement_date', { ascending: false });

    if (achievementsError) {
      console.error('Error fetching achievements:', {
        message: achievementsError.message,
        details: achievementsError.details,
        hint: achievementsError.hint,
        code: achievementsError.code
      });
    } else {
      setAchievements(achievementsData || []);
    }
    setLoading(false);
  };

  const getStatusIcon = (status: 'pending' | 'approved' | 'rejected') => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hackathon':
        return <Award className="h-4 w-4 text-blue-500" />;
      case 'research':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'internship':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'project':
        return <Award className="h-4 w-4 text-orange-500" />;
      case 'competition':
        return <Award className="h-4 w-4 text-red-500" />;
      case 'other':
      default:
        return <Award className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 text-center">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 text-center">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card shadow-lg mb-8">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || 'https://github.com/shadcn.png'} />
              <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.email}</CardTitle>
              <div className="text-muted-foreground flex items-center gap-2">
                {userRole && <Badge variant="secondary" className="capitalize">{userRole}</Badge>}
                {profile?.department && <span>{profile.department}</span>}
              </div>
            </div>
          </CardHeader>
        </Card>

        <h2 className="text-3xl font-bold mb-6">My Achievements Timeline</h2>
        
        {achievements.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">No achievements submitted yet.</p>
              <Link to="/submit" className="mt-4 inline-block">
                <Button>Submit Your First Achievement</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="relative pl-8">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
            {achievements.map((achievement, index) => (
              <div key={achievement.id} className="mb-8 relative">
                <div className="absolute -left-3 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground z-10">
                  {getTypeIcon(achievement.type)}
                </div>
                <Link to={`/achievements/${achievement.id}`} className="block group">
                  <Card className="glass-card hover:shadow-lg transition-shadow duration-200 ease-in-out ml-4">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200">
                          {achievement.title}
                        </CardTitle>
                        <Badge variant="outline" className="capitalize flex items-center gap-1">
                          {getStatusIcon(achievement.status)} {achievement.status}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 text-sm">
                        <CalendarDays className="h-3 w-3" />
                        {new Date(achievement.achievement_date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-2">{achievement.short_description}</p>
                      {achievement.media_url && (
                        <img 
                          src={achievement.media_url} 
                          alt={achievement.title} 
                          className="mt-4 rounded-md object-cover h-32 w-full"
                        />
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
