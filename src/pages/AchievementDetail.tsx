import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { CheckCircle, XCircle, Clock, CalendarDays, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';
import { generateConciseSummary } from '@/lib/gemini';

type Achievement = {
  id: string;
  title: string;
  short_description: string;
  description: string;
  type: string;
  tags: string[];
  achievement_date: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  media_url: string | null;
  how_it_started: string | null;
  how_we_built_it: string | null;
  what_we_achieved: string | null;
  what_we_learned: string | null;
  upvotes: number;
  photos: string[] | null;
  profiles: {
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
};

type Comment = {
  id: number;
  body: string;
  created_at: string;
  user_id: string;
  profiles: {
    name: string;
    username: string | null;
    avatar_url: string | null;
  };
};

export default function AchievementDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [showFull, setShowFull] = useState<boolean>(false);

  // Load main content only when the route id changes
  useEffect(() => {
    if (id) {
      fetchAchievementDetails();
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Check upvote status when user or id changes (no loading spinner)
  useEffect(() => {
    if (id) {
      checkUpvoteStatus();
    }
  }, [id, user]);

  const fetchAchievementDetails = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        id,
        title,
        short_description,
        description,
        type,
        tags,
        achievement_date,
        status,
        is_featured,
        media_url,
        how_it_started,
        how_we_built_it,
        what_we_achieved,
        what_we_learned,
        upvotes,
        photos,
        user_id,
        profiles!achievements_user_id_fkey(name, email, username, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error('Failed to load achievement details');
      console.error('Error fetching achievement:', error);
    } else {
      setAchievement(data as any);

      // Generate a concise, readable summary via Gemini
      try {
        setSummaryLoading(true);
        const concise = await generateConciseSummary({
          title: data.title,
          description: data.description || '',
          how_it_started: data.how_it_started,
          how_we_built_it: data.how_we_built_it,
          what_we_achieved: data.what_we_achieved,
          what_we_learned: data.what_we_learned,
        });
        setSummary(concise);
      } catch (e) {
        console.error('Failed to generate Gemini summary', e);
      } finally {
        setSummaryLoading(false);
      }
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('achievement_comments')
      .select(`
        id,
        body,
        created_at,
        user_id,
        profiles!achievement_comments_user_id_fkey(name, email, username, avatar_url)
      `)
      .eq('achievement_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setComments(data || []);
    }
  };

  const checkUpvoteStatus = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('achievement_upvotes')
      .select('*')
      .eq('achievement_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setUpvoted(true);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      toast.error('You must be logged in to upvote.');
      return;
    }

    if (upvoted) {
      const { error } = await supabase
        .from('achievement_upvotes')
        .delete()
        .eq('achievement_id', id)
        .eq('user_id', user.id);

      if (error) {
        toast.error(`Failed to remove upvote: ${error.message}`);
      } else {
        setUpvoted(false);
        setAchievement(prev => prev ? { ...prev, upvotes: prev.upvotes - 1 } : null);
      }
    } else {
      const { error } = await supabase
        .from('achievement_upvotes')
        .insert({ achievement_id: id, user_id: user.id });

      if (error) {
        toast.error(`Failed to add upvote: ${error.message}`);
      } else {
        setUpvoted(true);
        setAchievement(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : null);
      }
    }
  };

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) {
      toast.error('You must be logged in and provide a comment.');
      return;
    }

    const { error } = await supabase
      .from('achievement_comments')
      .insert({ achievement_id: id, user_id: user.id, body: newComment.trim() });

    if (error) {
      toast.error(`Failed to post comment: ${error.message}`);
    } else {
      setNewComment('');
      fetchComments();
      toast.success('Comment posted!');
    }
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

  if (loading) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: '#faf8f5',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="container mx-auto p-4 text-center" style={{ color: '#6b7280' }}>Loading achievement...</div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen relative">
        <Navbar />
        <div
          className="absolute inset-0 -z-10"
          style={{
            backgroundColor: '#faf8f5',
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px), repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(50, 113, 240, 0.03) 49px, rgba(50, 113, 240, 0.03) 50px)',
            backgroundSize: '50px 50px'
          }}
        />
        <div className="container mx-auto p-4 text-center" style={{ color: '#6b7280' }}>Achievement not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <Navbar />
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
        <Card className="bg-white rounded-[28px] shadow-sm border border-slate-100 mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle className="text-3xl font-bold">{achievement.title}</CardTitle>
              <Badge variant="outline" className="capitalize flex items-center gap-1">
                {getStatusIcon(achievement.status)} {achievement.status}
              </Badge>
            </div>
            <CardDescription className="text-lg text-muted-foreground">
              {achievement.short_description}
            </CardDescription>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={achievement.profiles?.avatar_url || undefined} />
                <AvatarFallback>{achievement.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <span>By {achievement.profiles?.name || 'Unknown User'}</span>
              <CalendarDays className="h-4 w-4 ml-4" />
              <span>{new Date(achievement.achievement_date).toLocaleDateString()}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            {achievement.photos && achievement.photos.length > 0 && (
              <Carousel className="w-full rounded-xl overflow-hidden">
                <CarouselContent>
                  {achievement.photos.map((photo, index) => (
                    <CarouselItem key={index} className="aspect-video">
                      <img src={photo} alt={`Achievement photo ${index + 1}`} className="object-cover w-full h-full" />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            )}

            <div className="flex items-center gap-4">
              <Button
                variant={upvoted ? 'default' : 'outline'}
                onClick={handleUpvote}
                disabled={!user}
                className="flex items-center gap-2"
              >
                <ThumbsUp className="h-5 w-5" />
                {achievement.upvotes || 0}
              </Button>
              <Badge variant="secondary" className="capitalize">{achievement.type}</Badge>
              {achievement.tags && achievement.tags.map((tag, index) => (
                <Badge key={index} variant="outline">{tag}</Badge>
              ))}
            </div>

            {/* AI Summary */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Summary</h3>
              {summaryLoading ? (
                <p className="text-muted-foreground">Generating concise summary…</p>
              ) : summary ? (
                <div className="space-y-3 text-muted-foreground">
                  {summary.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="leading-relaxed">{p}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No summary available.</p>
              )}
              <div className="mt-4">
                <Button variant="outline" onClick={() => setShowFull((s) => !s)}>
                  {showFull ? 'Hide full details' : 'View full details'}
                </Button>
              </div>
            </div>

            {showFull && achievement.description && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.description}</p>
              </div>
            )}

            {showFull && achievement.how_it_started && (
              <div>
                <h3 className="text-xl font-semibold mb-2">How it started</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.how_it_started}</p>
              </div>
            )}
            {showFull && achievement.how_we_built_it && (
              <div>
                <h3 className="text-xl font-semibold mb-2">How we built it</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.how_we_built_it}</p>
              </div>
            )}
            {showFull && achievement.what_we_achieved && (
              <div>
                <h3 className="text-xl font-semibold mb-2">What we achieved</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.what_we_achieved}</p>
              </div>
            )}
            {showFull && achievement.what_we_learned && (
              <div>
                <h3 className="text-xl font-semibold mb-2">What we learned</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.what_we_learned}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-4">Comments</h3>

              {/* Compose box */}
              {user && (
                <div className="flex items-start gap-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                      <Textarea
                        placeholder="Write a thoughtful comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="rounded-lg border-gray-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 resize-none"
                      />
                      <div className="mt-3 flex justify-end">
                        <Button
                          onClick={handlePostComment}
                          className="px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                        >
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to comment!</div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{comment.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-900">{comment.profiles?.name || 'Anonymous'}</span>
                            <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.body}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}