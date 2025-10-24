
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { OpportunityCard } from '@/components/OpportunityCard';

type Opportunity = {
  id: string;
  title: string;
  description: string;
  is_approved: boolean;
};

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, title, description, is_approved')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching opportunities:', error);
    } else {
      setOpportunities(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Opportunities</h1>
          <Link to="/create-opportunity">
            <Button>Create Opportunity</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {opportunities.map(opportunity => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
