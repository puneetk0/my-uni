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
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setPhotoFile(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Parse tags from input
  const parsedTags = formData.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedFormData = achievementSchema.parse(formData);
      const tagsArray = validatedFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      let mediaUrl: string | null = null;

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
      } else {
        toast.error('Photo is required');
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
                  Achievement Photo
                </Label>
                
                {photoPreview ? (
                  <div 
                    className="relative rounded-xl overflow-hidden"
                    style={{
                      maxWidth: '400px',
                      margin: '0'
                    }}
                  >
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-auto"
                      style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                        maxHeight: '300px',
                        objectFit: 'cover'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all"
                      style={{
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      <X className="h-4 w-4" style={{ color: '#e53e3e' }} />
                    </button>
                  </div>
                ) : (
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
                      Click to upload your achievement photo
                    </p>
                    <p 
                      className="text-xs"
                      style={{ color: '#a0aec0' }}
                    >
                      PNG, JPG, JPEG up to 10MB
                    </p>
                  </div>
                )}
                <Input
                  id="media"
                  type="file"
                  accept="image/*"
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