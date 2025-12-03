import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { OpportunityCard } from '@/components/OpportunityCard';
import { useAuth } from '@/contexts/AuthContext';
import { apiListOpportunities } from '@/lib/apiClient';

interface OrganizerInfo {
  name?: string;
  email?: string;
  profile_image_url?: string;
  role?: string;
}

interface Opportunity {
  id: string;
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
  created_at: string;
  created_by?: string;
}

const Opportunities = () => {
  const { user, userRole } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchOpportunities();
  }, [filter]);

  const fetchOpportunities = async () => {
    try {
      const list = await apiListOpportunities({ type: filter === 'all' ? undefined : filter });
      const formattedData = (list || []).map((opp: any) => ({
        id: String(opp._id),
        title: opp.title,
        description: opp.description,
        short_description: opp.short_description || opp.description?.substring(0, 150) + '...' || '',
        thumbnail_url: opp.thumbnailUrl,
        tags: opp.tags || [],
        deadline: opp.deadline,
        location: opp.location || 'TBD',
        eligibility: opp.eligibility || 'Open to all',
        organizer_info: { name: opp.organization || '', email: '', role: '' },
        apply_url: opp.applyUrl,
        details_url: opp.detailsUrl,
        join_team_url: opp.joinTeamUrl,
        type: opp.type || 'other',
        status: 'active',
        is_approved: opp.isApproved !== false,
        created_at: opp.createdAt,
        created_by: opp.createdBy,
      }));
      setOpportunities(formattedData as any);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeCount = (type: string) => {
    return opportunities.filter(opp => opp.type === type).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto p-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Opportunities</h1>
            <p className="text-gray-600 mt-1">Discover hackathons, internships, events, and more</p>
          </div>
          {(user || userRole === 'faculty') && (
            <Link to="/create-opportunity">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Opportunity
              </Button>
            </Link>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({opportunities.length})
          </button>
          <button
            onClick={() => setFilter('hackathon')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'hackathon'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Hackathons ({getTypeCount('hackathon')})
          </button>
          <button
            onClick={() => setFilter('internship')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'internship'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Internships ({getTypeCount('internship')})
          </button>
          <button
            onClick={() => setFilter('event')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'event'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Events ({getTypeCount('event')})
          </button>
          <button
            onClick={() => setFilter('competition')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'competition'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Competitions ({getTypeCount('competition')})
          </button>
          <button
            onClick={() => setFilter('workshop')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'workshop'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Workshops ({getTypeCount('workshop')})
          </button>
          <button
            onClick={() => setFilter('other')}
            className={`pb-3 px-1 font-medium text-sm transition-colors ${
              filter === 'other'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Other ({getTypeCount('other')})
          </button>
        </div>

        {/* Opportunities Grid */}
        {opportunities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? "There are no approved opportunities at the moment." 
                : `There are no ${filter} opportunities at the moment.`}
            </p>
            {user && (
              <Link to="/create-opportunity">
                <Button>Create the first opportunity</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {opportunities.map(opportunity => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
