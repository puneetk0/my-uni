import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Award, Sparkles, LayoutDashboard, LogOut, Trophy } from 'lucide-react';
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
    <nav 
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(45, 55, 72, 0.08)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
      }}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div 
              className="p-2.5 rounded-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)'
              }}
            >
      
            </div>
            <div className="flex flex-col">
              <span 
                className="font-bold text-2xl tracking-tight leading-none"
                style={{
                  fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
                  color: '#1a202c',
                  letterSpacing: '-0.02em'
                }}
              >
                AchieveHub
              </span>
             
            </div>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1.5">
            {user && (
              <>
                <Link to="/explore">
                  <Button 
                    variant="ghost"
                    className={`transition-all duration-200 px-4 py-2 rounded-lg font-medium ${
                      isActive('/explore') 
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.9rem'
                    }}
                  >
                    Explore
                  </Button>
                </Link>
                
                <Link to="/my-achievements">
                  <Button 
                    variant="ghost"
                    className={`transition-all duration-200 px-4 py-2 rounded-lg font-medium ${
                      isActive('/my-achievements') 
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.9rem'
                    }}
                  >
                    My Achievements
                  </Button>
                </Link>

                <Link to="/opportunities">
                  <Button 
                    variant="ghost"
                    className={`transition-all duration-200 px-4 py-2 rounded-lg font-medium ${
                      isActive('/opportunities') 
                        ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    style={{
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '0.9rem'
                    }}
                  >
                    Opportunities
                  </Button>
                </Link>

                {(userRole === 'faculty' || userRole === 'admin') && (
                  <Link to="/faculty-dashboard">
                    <Button 
                      variant="ghost"
                      className={`transition-all duration-200 px-4 py-2 rounded-lg font-medium ${
                        isActive('/faculty-dashboard') 
                          ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/30' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.9rem'
                      }}
                    >
                      Dashboard
                    </Button>
                  </Link>
                )}

                {/* Divider */}
                <div 
                  className="h-8 w-px mx-2"
                  style={{ backgroundColor: 'rgba(45, 55, 72, 0.1)' }}
                />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-11 w-11 rounded-full hover:bg-gray-50 transition-all duration-200 p-0"
                    >
                      <Avatar className="h-11 w-11 ring-2 ring-purple-100 ring-offset-2 transition-all duration-200 hover:ring-purple-200">
                        <AvatarFallback 
                          className="text-white font-bold text-sm"
                          style={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                            fontFamily: '"Inter", sans-serif'
                          }}
                        >
                          {getInitials(user.email || 'U')}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 p-2"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: 'rgba(139, 92, 246, 0.15)',
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                      borderRadius: '12px'
                    }}
                  >
                    <DropdownMenuLabel className="pb-3">
                      <div className="flex flex-col space-y-1.5">
                        <p 
                          className="text-sm font-semibold"
                          style={{ 
                            color: '#1a202c',
                            fontFamily: '"Inter", sans-serif' 
                          }}
                        >
                          {user.email}
                        </p>
                        <div className="flex items-center gap-2">
                          <span 
                            className="text-xs font-medium px-2 py-0.5 rounded-full capitalize"
                            style={{
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              color: '#8b5cf6'
                            }}
                          >
                            {userRole}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }} />
                    <DropdownMenuItem 
                      onClick={signOut} 
                      className="cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-red-50 transition-colors rounded-lg mt-1 py-2.5"
                      style={{
                        fontFamily: '"Inter", sans-serif',
                        fontSize: '0.9rem'
                      }}
                    >
                      <LogOut className="mr-2.5 h-4 w-4 text-red-500" />
                      <span className="font-medium">Sign out</span>
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