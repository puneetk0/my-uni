import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Star, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Achievement = {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  achievement_date: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  media_url: string | null;
  profiles: {
    name: string;
    email: string;
  };
};

export default function FacultyDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { userRole, user } = useAuth();

  useEffect(() => {
    if (userRole === 'faculty' || userRole === 'admin') {
      fetchAchievements();
    }
  }, [userRole]);

  const fetchAchievements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        id,
        title,
        description,
        type,
        tags,
        achievement_date,
        status,
        is_featured,
        media_url,
        profiles:user_id (
          name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load achievements');
    } else {
      setAchievements(data as any);
    }
    setLoading(false);
  };

  const handleAction = async (achievementId: string, action: 'approve' | 'reject' | 'feature') => {
    setActionLoading(true);
    
    const updates: any = {};
    
    if (action === 'approve') {
      updates.status = 'approved';
      updates.verified_by = user?.id;
    } else if (action === 'reject') {
      updates.status = 'rejected';
    } else if (action === 'feature') {
      const achievement = achievements.find(a => a.id === achievementId);
      updates.is_featured = !achievement?.is_featured;
    }

    const { error } = await supabase
      .from('achievements')
      .update(updates)
      .eq('id', achievementId);

    if (error) {
      toast.error('Action failed');
    } else {
      toast.success(`Achievement ${action}d successfully`);
      fetchAchievements();
      setSelectedAchievement(null);
    }
    
    setActionLoading(false);
  };

  const pendingAchievements = achievements.filter(a => a.status === 'pending');
  const approvedAchievements = achievements.filter(a => a.status === 'approved');
  const rejectedAchievements = achievements.filter(a => a.status === 'rejected');

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

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card className="glass-card hover-lift">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge className={getTypeColor(achievement.type)}>
            {achievement.type}
          </Badge>
          {achievement.is_featured && (
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </div>
        <CardTitle className="line-clamp-1">{achievement.title}</CardTitle>
        <CardDescription className="line-clamp-2">{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Student:</span> {achievement.profiles.name}
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Date:</span> {new Date(achievement.achievement_date).toLocaleDateString()}
        </p>
        {achievement.tags && achievement.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {achievement.tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedAchievement(achievement)}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          {achievement.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700"
                onClick={() => handleAction(achievement.id, 'approve')}
                disabled={actionLoading}
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleAction(achievement.id, 'reject')}
                disabled={actionLoading}
              >
                <XCircle className="h-3 w-3" />
              </Button>
            </>
          )}
          {achievement.status === 'approved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction(achievement.id, 'feature')}
              disabled={actionLoading}
            >
              <Star className={`h-3 w-3 ${achievement.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (userRole !== 'faculty' && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Card className="glass-card text-center py-12">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
              <p className="text-muted-foreground">
                This page is only accessible to faculty and admin users.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground">Review and manage student achievements</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pending">
              Pending ({pendingAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({rejectedAchievements.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAchievements.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No pending achievements</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedAchievements.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No approved achievements</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedAchievements.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No rejected achievements</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {rejectedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle>{selectedAchievement?.title}</DialogTitle>
            <DialogDescription>
              Submitted by {selectedAchievement?.profiles.name} ({selectedAchievement?.profiles.email})
            </DialogDescription>
          </DialogHeader>
          {selectedAchievement && (
            <div className="space-y-4">
              <div>
                <Badge className={getTypeColor(selectedAchievement.type)}>
                  {selectedAchievement.type}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{selectedAchievement.description}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAchievement.tags?.map((tag, i) => (
                    <Badge key={i} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Achievement Date</h4>
                <p className="text-muted-foreground">
                  {new Date(selectedAchievement.achievement_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              {selectedAchievement.media_url && (
                <div>
                  <h4 className="font-medium mb-2">Media</h4>
                  <a 
                    href={selectedAchievement.media_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View Media →
                  </a>
                </div>
              )}
              {selectedAchievement.status === 'pending' && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleAction(selectedAchievement.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAction(selectedAchievement.id, 'reject')}
                    disabled={actionLoading}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
