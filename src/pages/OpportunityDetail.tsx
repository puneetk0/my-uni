import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users, ExternalLink, Clock } from 'lucide-react';
import { apiGetOpportunity } from '@/lib/apiClient';
import { generateOpportunitySuggestions, generateOpportunitySummary } from '@/lib/gemini';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState<any | null>(null);
  const [aiTags, setAiTags] = useState<string[] | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    if (id) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGetOpportunity(id!);
      setOpportunity(data);
      // AI enhancements (non-blocking)
      try {
        setSummaryLoading(true);
        const concise = await generateOpportunitySummary({
          title: data.title,
          description: data.description || '',
          type: data.type,
          organization: data.organization,
          location: data.location,
          eligibility: data.eligibility,
          deadline: data.deadline,
          applyUrl: data.applyUrl,
          detailsUrl: data.detailsUrl,
          joinTeamUrl: data.joinTeamUrl,
          tags: data.tags,
        });
        setSummary(concise);
      } finally {
        setSummaryLoading(false);
      }

      try {
        const s = await generateOpportunitySuggestions({
          title: data.title,
          description: data.description || '',
          type: data.type || 'other',
          organization: data.organization,
        });
        if (s) {
          setAiTags(s.tags);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : '');

  if (loading || !opportunity) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  const 
    title = opportunity.title,
    description = opportunity.description,
    type = opportunity.type,
    tags: string[] = opportunity.tags || [],
    deadline = opportunity.deadline,
    location = opportunity.location,
    eligibility = opportunity.eligibility,
    applyUrl = opportunity.applyUrl,
    detailsUrl = opportunity.detailsUrl,
    joinTeamUrl = opportunity.joinTeamUrl,
    thumbnailUrl = opportunity.thumbnailUrl,
    status = opportunity.status || (opportunity.isApproved ? 'approved' : 'pending');

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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {type && <Badge variant="secondary" className="capitalize">{type}</Badge>}
            <Badge variant={status === 'approved' ? 'default' : status === 'rejected' ? 'destructive' : 'outline'} className="capitalize">{status}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
          {/* Short intro can be derived from summary's first sentence if needed; keeping header clean */}
        </div>

        {/* Cover / thumbnail with proper aspect ratio */}
        {thumbnailUrl && (
          <div className="rounded-xl overflow-hidden border border-gray-200 mb-6">
            <div className="aspect-video">
              <img src={thumbnailUrl} alt={title} className="object-cover w-full h-full" />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* AI Summary */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>AI-enhanced overview</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>Full details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{description}</p>
              </CardContent>
            </Card>

            {eligibility && (
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-2 text-gray-700">
                    <Users className="h-4 w-4 mt-1" />
                    <p>{eligibility}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {aiTags && aiTags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggested Tags</CardTitle>
                  <CardDescription>AI-generated tags to improve discoverability</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiTags.map((t) => (
                      <Badge key={t} variant="outline">{t}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>At a glance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {deadline && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-medium">Deadline:</span>
                    <span>{formatDate(deadline)}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Location:</span>
                    <span>{location}</span>
                  </div>
                )}
                {tags && tags.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t: string) => (
                        <Badge key={t} variant="outline">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {detailsUrl && (
                  <a href={detailsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> View details
                  </a>
                )}
                {applyUrl && (
                  <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> Apply now
                  </a>
                )}
                {joinTeamUrl && (
                  <a href={joinTeamUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                    <ExternalLink className="h-4 w-4" /> Join team
                  </a>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Link to="/opportunities">
                  <Button variant="outline" className="w-full">Back to opportunities</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
