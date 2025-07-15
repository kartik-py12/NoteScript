import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Moon, Sun, User, LogOut, Home, FileText, Globe, PlusCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCreateNote = () => {
    navigate('/editor');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/my-notes', label: 'My Notes', icon: FileText },
    { path: '/public-notes', label: 'Public Notes', icon: Globe },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary via-secondary to-accent rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary">
                NoteScript
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-secondary hover:text-secondary-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Create Note Button */}
            {isAuthenticated && (
              <Button
                onClick={handleCreateNote}
                className="hidden sm:flex items-center space-x-2 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Note</span>
              </Button>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 text-gray-700 dark:text-gray-300">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{user?.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-gray-700 dark:text-gray-300 hover:text-red-600"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  className="text-gray-700 dark:text-gray-300"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && (
          <div className="md:hidden pb-3">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-black'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-secondary hover:text-secondary-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Button
                onClick={handleCreateNote}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <PlusCircle className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
