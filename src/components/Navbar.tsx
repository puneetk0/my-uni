"use client"

import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X } from 'lucide-react';
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
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const { user, userRole, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const navItems = [
    { label: 'Explore', path: '/explore' },
    { label: 'Opportunities', path: '/opportunities' },
  ];

  if (userRole === 'faculty' || userRole === 'admin') {
    navItems.push({ label: 'Dashboard', path: '/faculty-dashboard' });
  }

  return (
    <div className="flex justify-center w-full py-6 px-4">
      <div className="flex items-center justify-between px-6 py-3 bg-white rounded-full shadow-lg w-full max-w-6xl relative z-10">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="font-bold text-xl text-gray-900">myUni</span>
        </Link>

        {/* Desktop Navigation */}
        {user ? (
          <>
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map((item) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Link
                    to={item.path}
                    className={`text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'text-purple-600'
                        : 'text-gray-900 hover:text-gray-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-10 w-10 rounded-full hover:bg-gray-50 transition-all duration-200 p-0"
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-gray-200 ring-offset-2 transition-all duration-200 hover:ring-gray-300">
                      <AvatarFallback 
                        className="text-white font-bold text-sm"
                        style={{
                          background: '#bfc0c1',
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
                    borderColor: 'rgba(191, 192, 193, 0.3)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px'
                  }}
                >
                  <DropdownMenuLabel className="pb-3">
                    <div className="flex flex-col space-y-1.5">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.email}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: '#f5f5f5', color: '#666' }}>
                          {userRole}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: 'rgba(191, 192, 193, 0.2)' }} />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors rounded-lg py-2.5">
                      <User className="mr-2.5 h-4 w-4" style={{ color: '#666' }} />
                      <span className="font-medium">My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut} 
                    className="cursor-pointer text-gray-700 hover:text-gray-900 hover:bg-red-50 transition-colors rounded-lg mt-1 py-2.5"
                  >
                    <LogOut className="mr-2.5 h-4 w-4 text-red-500" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Link
              to="/auth"
              className="inline-flex items-center justify-center px-5 py-2 text-sm text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        )}

        {/* Mobile Menu Button */}
        {user && (
          <motion.button 
            className="md:hidden flex items-center" 
            onClick={toggleMobileMenu} 
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="h-6 w-6 text-gray-900" />
          </motion.button>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-50 pt-24 px-6 md:hidden"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <motion.button
              className="absolute top-6 right-6 p-2"
              onClick={toggleMobileMenu}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <X className="h-6 w-6 text-gray-900" />
            </motion.button>
            <div className="flex flex-col space-y-6">
              {navItems.map((item, i) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.1 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Link
                    to={item.path}
                    className={`text-base font-medium ${
                      isActive(item.path) ? 'text-purple-600' : 'text-gray-900'
                    }`}
                    onClick={toggleMobileMenu}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                exit={{ opacity: 0, y: 20 }}
                className="pt-6 space-y-3"
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-3 text-base text-gray-900 font-medium"
                  onClick={toggleMobileMenu}
                >
                  <User className="h-5 w-5" />
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    toggleMobileMenu();
                  }}
                  className="flex items-center gap-3 text-base text-red-600 font-medium"
                >
                  <LogOut className="h-5 w-5" />
                  Sign out
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}