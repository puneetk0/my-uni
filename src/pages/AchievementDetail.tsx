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

  useEffect(() => {
    if (id) {
      fetchAchievementDetails();
      fetchComments();
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
        toast.error('Failed to remove upvote');
      } else {
        setUpvoted(false);
        setAchievement(prev => prev ? { ...prev, upvotes: prev.upvotes - 1 } : null);
      }
    } else {
      const { error } = await supabase
        .from('achievement_upvotes')
        .insert({ achievement_id: id, user_id: user.id });

      if (error) {
        toast.error('Failed to add upvote');
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
      toast.error('Failed to post comment');
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
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 text-center">Loading achievement...</div>
      </div>
    );
  }

  if (!achievement) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4 text-center">Achievement not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="glass-card shadow-lg mb-8">
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
          <CardContent className="space-y-6">
            {achievement.photos && achievement.photos.length > 0 && (
              <Carousel className="w-full max-w-xs mx-auto">
                <CarouselContent>
                  {achievement.photos.map((photo, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-square items-center justify-center p-6">
                            <img src={photo} alt={`Achievement photo ${index + 1}`} className="object-cover w-full h-full rounded-md" />
                          </CardContent>
                        </Card>
                      </div>
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

            {achievement.description && (
              <div>
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.description}</p>
              </div>
            )}

            {achievement.how_it_started && (
              <div>
                <h3 className="text-xl font-semibold mb-2">How it started</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.how_it_started}</p>
              </div>
            )}
            {achievement.how_we_built_it && (
              <div>
                <h3 className="text-xl font-semibold mb-2">How we built it</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.how_we_built_it}</p>
              </div>
            )}
            {achievement.what_we_achieved && (
              <div>
                <h3 className="text-xl font-semibold mb-2">What we achieved</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.what_we_achieved}</p>
              </div>
            )}
            {achievement.what_we_learned && (
              <div>
                <h3 className="text-xl font-semibold mb-2">What we learned</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{achievement.what_we_learned}</p>
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold mb-4">Comments</h3>
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                ) : (
                  comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                        <AvatarFallback>{comment.profiles?.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{comment.profiles?.name || 'Anonymous'}</span>
                          <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-muted-foreground">{comment.body}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {user && (
                <div className="mt-6 flex space-x-2">
                  <Textarea 
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={2}
                  />
                  <Button onClick={handlePostComment}>Post</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}