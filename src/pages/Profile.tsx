
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Award, CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGetUserAchievements } from '@/lib/apiClient';

type Achievement = {
  id: string;
  title: string;
  short_description?: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  achievement_date: string;
  media_url: string | null;
};

export default function Profile() {
  const { user, userRole } = useAuth();
  const [profile] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving] = useState(false);
  const [editMode] = useState(false);
  const [form] = useState<{ name: string; department: string; avatar_url: string }>({
    name: '',
    department: '',
    avatar_url: ''
  });
  const [stats, setStats] = useState<{ approved: number; pending: number; rejected: number; totalUpvotes: number }>({
    approved: 0,
    pending: 0,
    rejected: 0,
    totalUpvotes: 0
  });

  useEffect(() => {
    if (user) {
      fetchAchievements();
    }
  }, [user]);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      if (!user) return;
      const list = await apiGetUserAchievements(user.id);
      const mapped = (list || []).map((a: any) => ({
        id: a._id,
        title: a.title,
        short_description: a.shortDescription,
        type: a.type || 'other',
        status: a.status,
        achievement_date: a.achievementDate,
        media_url: a.mediaUrl || null,
      }));
      setAchievements(mapped);
      const approved = mapped.filter((a) => a.status === 'approved').length;
      const pending = mapped.filter((a) => a.status === 'pending').length;
      const rejected = mapped.filter((a) => a.status === 'rejected').length;
      setStats({ approved, pending, rejected, totalUpvotes: 0 });
    } catch (e) {
      console.error('Error fetching user achievements:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    // Profile editing via Node API is not implemented yet
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
      <div className="min-h-screen relative">
        <Navbar />
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(#bfc0c1 7.2%, transparent 0)',
            backgroundSize: '30px 30px',
            backgroundRepeat: 'repeat'
          }}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-3 bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
              <div className="h-6 w-40 bg-slate-200 rounded mb-4 animate-pulse" />
              <div className="h-4 w-64 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-40 animate-pulse" />
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-40 animate-pulse" />
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm h-40 animate-pulse" />
          </div>
        </div>
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
        <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-6 md:p-8 mb-8">
          {/* Header Card content moved inside shell */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatarUrl || 'https://github.com/shadcn.png'} />
              <AvatarFallback>{user?.email?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.name || user?.email}</CardTitle>
              <div className="text-muted-foreground flex items-center gap-2">
                {userRole && <Badge variant="secondary" className="capitalize">{userRole}</Badge>}
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              {/* Edit profile disabled for now */}
            </div>
          </div>
          {/* Inline profile editing removed for now */}
        </div>
        

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Approved</div>
              <div className="text-2xl font-semibold mt-1">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Pending</div>
              <div className="text-2xl font-semibold mt-1">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Rejected</div>
              <div className="text-2xl font-semibold mt-1">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card className="border border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">Total Upvotes</div>
              <div className="text-2xl font-semibold mt-1">{stats.totalUpvotes}</div>
            </CardContent>
          </Card>
        </div>

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
                      <p className="text-muted-foreground line-clamp-2">{achievement.short_description || achievement.title}</p>
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
