import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
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
  how_it_started: z.string().optional(),
  how_we_built_it: z.string().optional(),
  what_we_achieved: z.string().optional(),
  what_we_learned: z.string().optional(),
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
    how_it_started: '',
    how_we_built_it: '',
    what_we_achieved: '',
    what_we_learned: '',
  });

  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Parse tags from input
  const parsedTags = formData.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photoFiles.length + files.length > 5) {
      toast.error('You can upload a maximum of 5 photos.');
      return;
    }
    setPhotoFiles(prev => [...prev, ...files]);

    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPhotoPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedFormData = achievementSchema.parse(formData);
      const tagsArray = validatedFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const uploadedPhotoUrls: string[] = [];

      if (photoFiles.length > 0) {
        for (const file of photoFiles) {
          const filePath = `${user?.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('achievement-photos')
            .upload(filePath, file);

          if (uploadError) {
            toast.error(`Failed to upload photo: ${file.name}`);
            setLoading(false);
            return;
          }

          const { data: publicUrlData } = supabase.storage
            .from('achievement-photos')
            .getPublicUrl(filePath);
          uploadedPhotoUrls.push(publicUrlData.publicUrl);
        }
      } else {
        toast.error('At least one photo is required.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: user?.id,
          title: validatedFormData.title,
          short_description: validatedFormData.short_description,
          description: validatedFormData.description,
          type: validatedFormData.type,
          tags: tagsArray,
          achievement_date: validatedFormData.achievement_date,
          how_it_started: validatedFormData.how_it_started || null,
          how_we_built_it: validatedFormData.how_we_built_it || null,
          what_we_achieved: validatedFormData.what_we_achieved || null,
          what_we_learned: validatedFormData.what_we_learned || null,
          photos: uploadedPhotoUrls,
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
      
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
            style={{
              fontFamily: '"Inter", sans-serif',
              color: '#1a202c',
              letterSpacing: '-0.02em'
            }}
          >
            Submit Your Achievement
          </h1>
          <p 
            className="text-base"
            style={{ color: '#718096' }}
          >
            Share your success story with the community
          </p>
        </div>

        {/* Form Card */}
        <Card 
          className="border-0 overflow-hidden"
          style={{
            backgroundColor: '#ffffff',
            border: '.5px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '20px'
          }}
        >
          <CardContent className="p-6 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Photo Upload Section - Featured at top */}
              <div className="space-y-3">
                <Label 
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Achievement Photos (Max 5)
                </Label>
                
                {photoPreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {photoPreviews.map((preview, index) => (
                      <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden shadow-md">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removePhoto(index)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all"
                          style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}
                        >
                          <X className="h-3 w-3" style={{ color: '#e53e3e' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {photoFiles.length < 5 && (
                  <div 
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[#3271f0] hover:bg-blue-50/30 group"
                    style={{ 
                      borderColor: '#cbd5e0',
                      backgroundColor: '#f7fafc'
                    }}
                    onClick={() => document.getElementById('media')?.click()}
                  >
                    <div 
                      className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center transition-all group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
                        boxShadow: '0 6px 16px rgba(50, 113, 240, 0.25)'
                      }}
                    >
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <p 
                      className="text-sm font-semibold mb-1"
                      style={{ color: '#2d3748' }}
                    >
                      Click to upload photos (up to 5)
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: '#a0aec0' }}
                    >
                      PNG, JPG, JPEG up to 10MB each
                    </p>
                  </div>
                )}
                <Input
                  id="media"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </div>

              {/* Divider */}
              <div 
                className="h-px my-6"
                style={{ backgroundColor: '#e2e8f0' }}
              />

              {/* Title */}
              <div className="space-y-2">
                <Label 
                  htmlFor="title"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Won First Place at National Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Short Description */}
              <div className="space-y-2">
                <Label 
                  htmlFor="short_description"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Short Description
                </Label>
                <Textarea
                  id="short_description"
                  placeholder="A brief, catchy description that will appear on your polaroid card"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  required
                  maxLength={100}
                  rows={2}
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
                <p 
                  className="text-xs text-right"
                  style={{ color: '#a0aec0' }}
                >
                  {formData.short_description.length} / 100
                </p>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <Label 
                  htmlFor="description"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Full Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Tell us the full story of your achievement. What did you do? What challenges did you overcome? What did you learn?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  required
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* How it started */}
              <div className="space-y-2">
                <Label 
                  htmlFor="how_it_started"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  How it started
                </Label>
                <Textarea
                  id="how_it_started"
                  placeholder="Describe the initial idea, problem, or inspiration."
                  value={formData.how_it_started}
                  onChange={(e) => setFormData({ ...formData, how_it_started: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* How we built it */}
              <div className="space-y-2">
                <Label 
                  htmlFor="how_we_built_it"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  How we built it
                </Label>
                <Textarea
                  id="how_we_built_it"
                  placeholder="Explain the process, technologies used, and challenges faced during development."
                  value={formData.how_we_built_it}
                  onChange={(e) => setFormData({ ...formData, how_we_built_it: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* What we achieved */}
              <div className="space-y-2">
                <Label 
                  htmlFor="what_we_achieved"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  What we achieved
                </Label>
                <Textarea
                  id="what_we_achieved"
                  placeholder="Summarize the outcomes, impact, and results of your achievement."
                  value={formData.what_we_achieved}
                  onChange={(e) => setFormData({ ...formData, what_we_achieved: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* What we learned */}
              <div className="space-y-2">
                <Label 
                  htmlFor="what_we_learned"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  What we learned
                </Label>
                <Textarea
                  id="what_we_learned"
                  placeholder="Reflect on the key takeaways, skills gained, and personal growth."
                  value={formData.what_we_learned}
                  onChange={(e) => setFormData({ ...formData, what_we_learned: e.target.value })}
                  rows={3}
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                  style={{ 
                    borderRadius: '10px',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              {/* Type and Date - Side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label 
                    htmlFor="type"
                    className="text-sm font-semibold"
                    style={{ color: '#2d3748' }}
                  >
                    Category
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    required
                  >
                    <SelectTrigger 
                      id="type"
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ borderRadius: '10px' }}
                    >
                      <SelectValue placeholder="Select category" />
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
                  <Label 
                    htmlFor="date"
                    className="text-sm font-semibold"
                    style={{ color: '#2d3748' }}
                  >
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.achievement_date}
                    onChange={(e) => setFormData({ ...formData, achievement_date: e.target.value })}
                    required
                    className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                    style={{ borderRadius: '10px' }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label 
                  htmlFor="tags"
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Skills & Tags
                </Label>
                <Input
                  id="tags"
                  placeholder="React, Python, Machine Learning, UI/UX"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  required
                  className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                  style={{ borderRadius: '10px' }}
                />
                
                {/* Tag Preview */}
                {parsedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 p-3 rounded-lg" style={{ backgroundColor: '#f7fafc' }}>
                    {parsedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: '#e6f0ff',
                          color: '#3271f0',
                          border: '1px solid rgba(50, 113, 240, 0.2)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <p 
                  className="text-xs"
                  style={{ color: '#a0aec0' }}
                >
                  Separate tags with commas
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full text-white font-semibold h-12 transition-all hover:scale-[1.01]"
                  style={{
                    background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
                    borderRadius: '10px',
                    boxShadow: '0 4px 16px rgba(50, 113, 240, 0.3)'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Achievement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}