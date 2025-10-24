import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

const achievementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title is too long'),
  short_description: z.string().min(3, 'Short description must be at least 3 characters').max(100, 'Short description is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  type: z.enum(['hackathon', 'research', 'internship', 'project', 'competition', 'other']),
  tags: z.string(),
  achievement_date: z.string().min(1, 'Achievement date is required'),
  media_url: z.string().min(1, 'Photo is required'),
});

export default function SubmitAchievement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    type: '',
    tags: '',
    achievement_date: '',
    media_url: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = achievementSchema.parse(formData);
      const tagsArray = validated.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      let mediaUrl = null;
      if (photoFile) {
        const filePath = `${user?.id}/${Date.now()}`;
        const { error: uploadError } = await supabase.storage
          .from('achievement-photos')
          .upload(filePath, photoFile);

        if (uploadError) {
          toast.error('Failed to upload photo');
          setLoading(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('achievement-photos')
          .getPublicUrl(filePath);
        mediaUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user?.id,
          title: validated.title,
          short_description: validated.short_description,
          description: validated.description,
          type: validated.type,
          tags: tagsArray,
          achievement_date: validated.achievement_date,
          media_url: mediaUrl,
          status: 'pending',
        });

      if (error) {
        toast.error('Failed to submit achievement');
      } else {
        toast.success('Achievement submitted successfully! Awaiting approval.');
        navigate('/my-achievements');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Submit Achievement
          </h1>
          <p className="text-muted-foreground">
            Share your accomplishments with the community
          </p>
        </div>

        <Card className="glass-card shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Achievement Details
            </CardTitle>
            <CardDescription>
              Fill in the information about your achievement. All fields are required except media URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Won First Place at National Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description *</Label>
                <Textarea
                  id="short_description"
                  placeholder="A short, catchy description (e.g., Won SIH 2025, Placed at Google)"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  required
                  maxLength={100}
                />
                 <p className="text-xs text-muted-foreground">
                  {formData.short_description.length} / 100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your achievement, what you did, what you learned..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select achievement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Achievement Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.achievement_date}
                    onChange={(e) => setFormData({ ...formData, achievement_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Skills / Tags *</Label>
                <Input
                  id="tags"
                  placeholder="React, Python, Machine Learning (comma separated)"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="media">Photo *</Label>
                <Input
                  id="media"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files ? e.target.files[0] : null)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload a photo of your achievement
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="flex-1 gradient-primary shadow-glow"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Achievement'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/my-achievements')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
