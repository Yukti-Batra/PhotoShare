import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  PlusCircleIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar';

export const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-primary-800 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-instagram-pink">
                PhotoShare
              </Link>
            </div>
          </div>

          {/* Desktop navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`nav-link ${isActive('/') ? 'nav-link-active' : ''}`}
                >
                  <HomeIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/search"
                  className={`nav-link ${isActive('/search') ? 'nav-link-active' : ''}`}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Search</span>
                </Link>
                <Link
                  to="/create-post"
                  className={`nav-link ${isActive('/create-post') ? 'nav-link-active' : ''}`}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>New Post</span>
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className={`nav-link ${isActive(`/profile/${user.username}`) ? 'nav-link-active' : ''
                    }`}
                >
                  <UserCircleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className={`nav-link ${isActive('/settings') ? 'nav-link-active' : ''}`}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={logout}
                  className="nav-link text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link ${isActive('/login') ? 'nav-link-active' : ''}`}>
                  Login
                </Link>
                <Link to="/register" className={`nav-link ${isActive('/register') ? 'nav-link-active' : ''}`}>
                  Register
                </Link>
              </>
            )}
            <ThemeToggle />
            {user && (
              <Link to={`/profile/${user.username}`} className="flex items-center">
                <Avatar src={user.profileImage} alt={user.username} size="sm" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="ml-2 p-2 rounded-md text-primary-400 hover:text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-700 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-primary-800 pb-3 pt-2">
          <div className="px-2 space-y-1">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md ${isActive('/') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HomeIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/search"
                  className={`block px-3 py-2 rounded-md ${isActive('/search') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Search</span>
                </Link>
                <Link
                  to="/create-post"
                  className={`block px-3 py-2 rounded-md ${isActive('/create-post') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>New Post</span>
                </Link>
                <Link
                  to={`/profile/${user.username}`}
                  className={`block px-3 py-2 rounded-md ${isActive(`/profile/${user.username}`) ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className={`block px-3 py-2 rounded-md ${isActive('/settings') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Cog6ToothIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-700 dark:hover:text-red-300"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 inline-block" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block px-3 py-2 rounded-md ${isActive('/login') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block px-3 py-2 rounded-md ${isActive('/register') ? 'bg-primary-100 dark:bg-primary-700 text-primary-900 dark:text-white' : 'text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}; 