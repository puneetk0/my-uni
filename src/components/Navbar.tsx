import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Sparkles, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="gradient-primary p-2 rounded-lg transition-smooth group-hover:shadow-glow">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AchieveHub
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {user && (
              <>
                <Link to="/explore">
                  <Button 
                    variant={isActive('/explore') ? 'default' : 'ghost'}
                    className="transition-smooth"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explore
                  </Button>
                </Link>
                
                <Link to="/my-achievements">
                  <Button 
                    variant={isActive('/my-achievements') ? 'default' : 'ghost'}
                    className="transition-smooth"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    My Achievements
                  </Button>
                </Link>

                {(userRole === 'faculty' || userRole === 'admin') && (
                  <Link to="/faculty-dashboard">
                    <Button 
                      variant={isActive('/faculty-dashboard') ? 'default' : 'ghost'}
                      className="transition-smooth"
                    >
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="gradient-primary text-primary-foreground">
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
