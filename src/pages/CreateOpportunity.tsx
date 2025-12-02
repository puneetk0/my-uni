import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Calendar, MapPin, Users, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrganizerInfo {
  name: string;
  email: string;
  profile_image_url?: string;
  role: string;
}

const CreateOpportunity = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    tags: '',
    deadline: '',
    location: '',
    eligibility: '',
    type: 'hackathon',
    apply_url: '',
    details_url: '',
    join_team_url: '',
  });

  const [organizerInfo, setOrganizerInfo] = useState<OrganizerInfo>({
    name: '',
    email: '',
    role: '',
    profile_image_url: '',
  });

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnail_url = '';

      // Upload thumbnail if provided
      if (thumbnailFile) {
        // Ensure user is logged in
        if (!user?.id) {
          toast({ 
            title: 'Error', 
            description: 'You must be logged in to upload a thumbnail' 
          });
          setLoading(false);
          return;
        }

        // First check if bucket exists
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.error('Error listing buckets:', bucketError);
          toast({ 
            title: 'Storage Error', 
            description: 'Unable to access storage. Please check your connection and try again.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        const bucketExists = buckets?.some(bucket => bucket.name === 'opportunity-thumbnails');
        
        if (!bucketExists) {
          console.error('Bucket does not exist');
          toast({ 
            title: 'Storage Configuration Error', 
            description: 'The opportunity thumbnails storage bucket is not configured. Please contact support to set up the storage bucket.',
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        // Clean file name and create safe path
        const cleanFileName = thumbnailFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${user.id}/${Date.now()}_${cleanFileName}`;
        
        console.log('Uploading to:', filePath);
        console.log('File details:', {
          name: thumbnailFile.name,
          size: thumbnailFile.size,
          type: thumbnailFile.type
        });
        
        // Try to upload the file
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('opportunity-thumbnails')
          .upload(filePath, thumbnailFile);

        if (uploadError) {
          console.error('Upload error details:', {
            message: uploadError.message,
            statusCode: (uploadError as any).statusCode,
            error: uploadError
          });
          
          // Provide more user-friendly error messages
          let errorMessage = uploadError.message;
          
          if (uploadError.message.includes('bucket not found') || uploadError.message.includes('Bucket not found')) {
            errorMessage = 'Storage bucket is not properly configured. The opportunity thumbnails bucket needs to be set up in Supabase. Please contact support or check the bucket configuration.';
          } else if (uploadError.message.includes('permission') || uploadError.message.includes('Permission')) {
            errorMessage = 'Permission denied. You may not have permission to upload files. Please ensure you are logged in and have the correct permissions.';
          } else if (uploadError.message.includes('file size') || uploadError.message.includes('too large')) {
            errorMessage = 'File too large. Please upload an image smaller than 5MB.';
          } else if (uploadError.message.includes('mime type') || uploadError.message.includes('content type')) {
            errorMessage = 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.';
          } else if (uploadError.message.includes('duplicate') || uploadError.message.includes('already exists')) {
            errorMessage = 'A file with this name already exists. Please try again or rename your file.';
          }
          
          toast({ 
            title: 'Upload Error', 
            description: errorMessage,
            variant: 'destructive'
          });
          setLoading(false);
          return;
        }

        console.log('Upload successful:', uploadData);

        const { data: publicUrlData } = supabase.storage
          .from('opportunity-thumbnails')
          .getPublicUrl(filePath);
        thumbnail_url = publicUrlData.publicUrl;
        console.log('Thumbnail URL:', thumbnail_url);
      }

      // Parse tags
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const is_approved = userRole === 'faculty';

      const { error } = await supabase
        .from('opportunities')
        .insert({
          title: formData.title,
          description: formData.description,
          short_description: formData.short_description,
          thumbnail_url: thumbnail_url || null,
          tags: tagsArray,
          deadline: formData.deadline || null,
          location: formData.location,
          eligibility: formData.eligibility,
          organizer_info: organizerInfo,
          apply_url: formData.apply_url || null,
          details_url: formData.details_url || null,
          join_team_url: formData.join_team_url || null,
          type: formData.type,
          created_by: user?.id,
          is_approved,
        });

      if (error) {
        toast({ 
          title: 'Error', 
          description: error.message 
        });
      } else {
        toast({ 
          title: 'Success', 
          description: 'Opportunity created successfully.' 
        });
        navigate('/opportunities');
      }
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast({ 
        title: 'Error', 
        description: 'An unexpected error occurred.' 
      });
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
            Create Opportunity
          </h1>
          <p 
            className="text-base"
            style={{ color: '#718096' }}
          >
            Share hackathons, internships, events, and other opportunities with the community
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
              {/* Thumbnail Upload Section */}
              <div className="space-y-3">
                <Label 
                  className="text-sm font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Thumbnail Image (Poster/Banner)
                </Label>
                
                {thumbnailPreview && (
                  <div className="relative w-48 h-32 rounded-xl overflow-hidden shadow-md mb-4">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/95 backdrop-blur-sm hover:bg-white transition-all"
                      style={{ boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)' }}
                    >
                      <X className="h-4 w-4" style={{ color: '#e53e3e' }} />
                    </button>
                  </div>
                )}

                {!thumbnailPreview && (
                  <div 
                    className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[#3271f0] hover:bg-blue-50/30 group"
                    style={{ 
                      borderColor: '#cbd5e0',
                      backgroundColor: '#f7fafc'
                    }}
                    onClick={() => document.getElementById('thumbnail')?.click()}
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
                      Click to upload thumbnail
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
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
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
                  placeholder="e.g., Smart India Hackathon 2025"
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
                  placeholder="e.g., 48-hour national hackathon for innovative solutions"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  required
                  maxLength={150}
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
                  {formData.short_description.length} / 150
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
                  placeholder="Provide detailed information about this opportunity..."
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

              {/* Type and Tags Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label 
                    htmlFor="type"
                    className="text-sm font-semibold"
                    style={{ color: '#2d3748' }}
                  >
                    Type
                  </Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger 
                      className="h-11 border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0]"
                      style={{ borderRadius: '10px' }}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="competition">Competition</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="tags"
                    className="text-sm font-semibold"
                    style={{ color: '#2d3748' }}
                  >
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    placeholder="#Hackathon, #AI, #Offline"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                    style={{ 
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Important Info Section */}
              <div className="space-y-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Important Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="deadline"
                      className="text-sm font-semibold flex items-center gap-2"
                      style={{ color: '#2d3748' }}
                    >
                      <Calendar className="h-4 w-4" />
                      Deadline
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="location"
                      className="text-sm font-semibold flex items-center gap-2"
                      style={{ color: '#2d3748' }}
                    >
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      placeholder="e.g., Online / Mumbai, India"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="eligibility"
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{ color: '#2d3748' }}
                  >
                    <Users className="h-4 w-4" />
                    Eligibility
                  </Label>
                  <Textarea
                    id="eligibility"
                    placeholder="e.g., Open to all college students, must have basic programming knowledge"
                    value={formData.eligibility}
                    onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                    rows={3}
                    className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] resize-none"
                    style={{ 
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Call to Action Section */}
              <div className="space-y-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Call to Action
                </h3>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="apply_url"
                      className="text-sm font-semibold flex items-center gap-2"
                      style={{ color: '#2d3748' }}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Apply URL
                    </Label>
                    <Input
                      id="apply_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.apply_url}
                      onChange={(e) => setFormData({ ...formData, apply_url: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="details_url"
                      className="text-sm font-semibold"
                      style={{ color: '#2d3748' }}
                    >
                      Details URL
                    </Label>
                    <Input
                      id="details_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.details_url}
                      onChange={(e) => setFormData({ ...formData, details_url: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="join_team_url"
                      className="text-sm font-semibold"
                      style={{ color: '#2d3748' }}
                    >
                      Join Team URL
                    </Label>
                    <Input
                      id="join_team_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.join_team_url}
                      onChange={(e) => setFormData({ ...formData, join_team_url: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Organizer Info Section */}
              <div className="space-y-4">
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: '#2d3748' }}
                >
                  Organizer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label 
                      htmlFor="organizer_name"
                      className="text-sm font-semibold"
                      style={{ color: '#2d3748' }}
                    >
                      Organizer Name
                    </Label>
                    <Input
                      id="organizer_name"
                      placeholder="e.g., Computer Science Department"
                      value={organizerInfo.name}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, name: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label 
                      htmlFor="organizer_email"
                      className="text-sm font-semibold"
                      style={{ color: '#2d3748' }}
                    >
                      Organizer Email
                    </Label>
                    <Input
                      id="organizer_email"
                      type="email"
                      placeholder="organizer@example.com"
                      value={organizerInfo.email}
                      onChange={(e) => setOrganizerInfo({ ...organizerInfo, email: e.target.value })}
                      className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                      style={{ 
                        borderRadius: '10px',
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label 
                    htmlFor="organizer_role"
                    className="text-sm font-semibold"
                    style={{ color: '#2d3748' }}
                  >
                    Organizer Role
                  </Label>
                  <Input
                    id="organizer_role"
                    placeholder="e.g., Faculty Coordinator, Event Organizer"
                    value={organizerInfo.role}
                    onChange={(e) => setOrganizerInfo({ ...organizerInfo, role: e.target.value })}
                    className="border-gray-200 focus:border-[#3271f0] focus:ring-[#3271f0] h-11"
                    style={{ 
                      borderRadius: '10px',
                      fontSize: '0.95rem'
                    }}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                  style={{
                    background: 'linear-gradient(135deg, #3271f0 0%, #1e4fd9 100%)',
                    borderRadius: '12px',
                    boxShadow: '0 4px 14px rgba(50, 113, 240, 0.3)'
                  }}
                >
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateOpportunity;
