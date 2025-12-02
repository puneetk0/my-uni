import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, XCircle, Star, Eye, Building2, Clock, MapPin, Users } from 'lucide-react';
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
  photos?: string[] | null;
  profiles: {
    avatar_url: string | null;
  };
};

interface OrganizerInfo {
  name?: string;
  email?: string;
  profile_image_url?: string;
  role?: string;
}

type Opportunity = {
  id: number;
  title: string;
  description: string;
  short_description?: string;
  thumbnail_url?: string;
  tags?: string[];
  deadline?: string;
  location?: string;
  eligibility?: string;
  organizer_info?: OrganizerInfo;
  apply_url?: string;
  details_url?: string;
  join_team_url?: string;
  type?: string;
  status?: string;
  is_approved: boolean;
  created_by: string;
  created_at: string;
  profiles?: {
    avatar_url: string | null;
  };
};

export default function FacultyDashboard() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { userRole, user } = useAuth();

  useEffect(() => {
    if (userRole === 'faculty' || userRole === 'admin') {
      fetchAchievements();
      fetchOpportunities();
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
        photos,
        profiles!achievements_user_id_fkey(avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load achievements');
    } else {
      setAchievements(data as any);
    }
    setLoading(false);
  };

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        id,
        title,
        description,
        is_approved,
        created_by,
        profiles!opportunities_created_by_fkey_profiles(avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      toast.error('Failed to load opportunities');
    } else {
      setOpportunities(data as any);
    }
  };

  const handleAchievementAction = async (achievementId: string, action: 'approve' | 'reject' | 'feature') => {
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
      toast.error('Achievement action failed');
    } else {
      toast.success(`Achievement ${action}d successfully`);
      fetchAchievements();
      setSelectedAchievement(null);
    }

    setActionLoading(false);
  };

  const handleOpportunityAction = async (opportunityId: number, action: 'approve' | 'reject') => {
    setActionLoading(true);

    if (action === 'approve') {
      const { error } = await supabase
        .from('opportunities')
        .update({ is_approved: true })
        .eq('id', opportunityId);

      if (error) {
        toast.error('Opportunity approval failed');
      } else {
        toast.success('Opportunity approved successfully');
        fetchOpportunities();
      }
    } else if (action === 'reject') {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) {
        toast.error('Opportunity rejection failed');
      } else {
        toast.success('Opportunity rejected and deleted successfully');
        fetchOpportunities();
      }
    }
    setActionLoading(false);
  };

  const pendingAchievements = achievements.filter(a => a.status === 'pending');
  const approvedAchievements = achievements.filter(a => a.status === 'approved');
  const rejectedAchievements = achievements.filter(a => a.status === 'rejected');

  const pendingOpportunities = opportunities.filter(o => !o.is_approved);
  const approvedOpportunities = opportunities.filter(o => o.is_approved);

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
          <span className="font-medium">Student:</span> {user?.email}
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
                onClick={() => handleAchievementAction(achievement.id, 'approve')}
                disabled={actionLoading}
              >
                <CheckCircle className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleAchievementAction(achievement.id, 'reject')}
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
              onClick={() => handleAchievementAction(achievement.id, 'feature')}
              disabled={actionLoading}
            >
              <Star className={`h-3 w-3 ${achievement.is_featured ? 'fill-yellow-500 text-yellow-500' : ''}`} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const OpportunityCard = ({ opportunity }: { opportunity: Opportunity }) => {
    const formatDate = (dateString: string) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const getTypeColor = (type: string) => {
      const colors = {
        hackathon: 'bg-blue-100 text-blue-800',
        internship: 'bg-green-100 text-green-800',
        event: 'bg-purple-100 text-purple-800',
        competition: 'bg-red-100 text-red-800',
        workshop: 'bg-yellow-100 text-yellow-800',
        other: 'bg-gray-100 text-gray-800'
      };
      return colors[type as keyof typeof colors] || colors.other;
    };

    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
        {/* Header with type badge */}
        <div className="relative">
          {opportunity.thumbnail_url ? (
            <div className="h-48 overflow-hidden">
              <img
                src={opportunity.thumbnail_url}
                alt={opportunity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          )}
          {opportunity.type && (
            <div className="absolute top-4 left-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(opportunity.type)}`}>
                {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          {/* Company/Organizer */}
          {opportunity.organizer_info?.name && (
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {opportunity.organizer_info.name}
              </span>
              {opportunity.organizer_info.role && (
                <span className="text-xs text-gray-500">
                  • {opportunity.organizer_info.role}
                </span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
            {opportunity.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {opportunity.short_description || opportunity.description}
          </p>

          {/* Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {opportunity.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {opportunity.tags.length > 4 && (
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
                  +{opportunity.tags.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {opportunity.deadline && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="font-medium">Deadline:</span>
                <span>{formatDate(opportunity.deadline)}</span>
              </div>
            )}

            {opportunity.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Location:</span>
                <span>{opportunity.location}</span>
              </div>
            )}

            {opportunity.eligibility && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4 text-green-500 mt-0.5" />
                <span className="font-medium">Eligibility:</span>
                <span className="line-clamp-2">{opportunity.eligibility}</span>
              </div>
            )}
          </div>

          {/* Status and Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`text-sm font-semibold ${opportunity.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                {opportunity.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>

            {!opportunity.is_approved && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  onClick={() => handleOpportunityAction(opportunity.id, 'approve')}
                  disabled={actionLoading}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleOpportunityAction(opportunity.id, 'reject')}
                  disabled={actionLoading}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

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
    <div className="min-h-screen relative">
      <Navbar />

      {/* Background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundColor: '#fafafa',
          backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 animate-fade-in">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              fontFamily: '"Inter", sans-serif',
              color: '#111827',
              letterSpacing: '-0.02em'
            }}
          >
            Faculty Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Review and manage student achievements</p>
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

        <div className="mb-8 mt-12 animate-fade-in">
          <h2
            className="text-3xl font-bold mb-2"
            style={{
              fontFamily: '"Inter", sans-serif',
              color: '#111827',
              letterSpacing: '-0.02em'
            }}
          >
            Manage Opportunities
          </h2>
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>Review and manage student-posted opportunities</p>
        </div>

        <Tabs defaultValue="pending-opportunities" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="pending-opportunities">
              Pending Opportunities ({pendingOpportunities.length})
            </TabsTrigger>
            <TabsTrigger value="approved-opportunities">
              Approved Opportunities ({approvedOpportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending-opportunities" className="space-y-4">
            {pendingOpportunities.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No pending opportunities</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {pendingOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved-opportunities" className="space-y-4">
            {approvedOpportunities.length === 0 ? (
              <Card className="glass-card text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">No approved opportunities</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} />
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
              Submitted by {user?.email}
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
              {(selectedAchievement.photos?.[0] || selectedAchievement.media_url) && (
                <div>
                  <h4 className="font-medium mb-2">Media</h4>
                  <a
                    href={selectedAchievement.photos?.[0] || selectedAchievement.media_url || ''}
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
                    onClick={() => handleAchievementAction(selectedAchievement.id, 'approve')}
                    disabled={actionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleAchievementAction(selectedAchievement.id, 'reject')}
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
