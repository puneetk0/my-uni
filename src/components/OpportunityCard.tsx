
import React from 'react';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  is_approved: boolean;
};

type OpportunityCardProps = {
  opportunity: Opportunity;
};

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold mb-2">{opportunity.title}</h2>
      <p className="text-gray-700">{opportunity.description}</p>
    </div>
  );
};
