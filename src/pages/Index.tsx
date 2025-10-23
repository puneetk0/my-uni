import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Sparkles, TrendingUp, Users } from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <section className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="gradient-primary p-4 rounded-2xl shadow-glow">
              <Award className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary-light bg-clip-text text-transparent">
            Showcase Your Achievements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A permanent, structured platform for students to highlight their accomplishments
            and inspire their peers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="gradient-primary shadow-glow text-lg px-8"
              onClick={() => navigate('/submit')}
            >
              <Award className="mr-2 h-5 w-5" />
              Add Achievement
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8"
              onClick={() => navigate('/explore')}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Explore Feed
            </Button>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Build Your Portfolio</CardTitle>
              <CardDescription>
                Create a permanent record of all your academic achievements, competitions, and projects
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <div className="mb-4 p-3 rounded-lg bg-accent/10 w-fit">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <CardTitle>Get Recognition</CardTitle>
              <CardDescription>
                Faculty-verified achievements that showcase your skills and dedication to the community
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card hover-lift animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <div className="mb-4 p-3 rounded-lg bg-primary-light/10 w-fit">
                <Sparkles className="h-6 w-6 text-primary-light" />
              </div>
              <CardTitle>Inspire Others</CardTitle>
              <CardDescription>
                Share your journey and motivate peers to pursue their own achievements and goals
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <section className="text-center">
          <Card className="glass-card p-8 shadow-lg">
            <CardContent>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join the community of achievers. Submit your accomplishments and discover what your peers are doing.
              </p>
              <Button 
                size="lg"
                className="gradient-primary shadow-glow"
                onClick={() => navigate('/my-achievements')}
              >
                View My Achievements
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
