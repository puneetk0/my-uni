
import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, User, Building2, Clock } from 'lucide-react';

interface OrganizerInfo {
  name?: string;
  email?: string;
  profile_image_url?: string;
  role?: string;
}

type Opportunity = {
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
};

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
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

        {/* Action Buttons */}
        <div className="flex gap-3">
          {opportunity.details_url && (
            <a
              href={opportunity.details_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View Details
            </a>
          )}
          
          {opportunity.apply_url && (
            <a
              href={opportunity.apply_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-200"
            >
              Apply Now
            </a>
          )}
        </div>

        {/* Join Team Button */}
        {opportunity.join_team_url && (
          <a
            href={opportunity.join_team_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 text-center bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 block"
          >
            Join Team
          </a>
        )}
      </div>
    </div>
  );
};
