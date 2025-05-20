import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchUsers } from '../api/users';
import { User } from '../types';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch();
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSearch = async () => {
    if (query.trim().length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const results = await searchUsers(query);
      setUsers(results);
    } catch (err: any) {
      setError('Failed to search users. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileClick = (username: string) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-6">
        Search Users
      </h1>

      {/* Search Input */}
      <div className="flex items-center space-x-2 mb-8">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-primary-500" />
          </div>
          <input
            type="text"
            className="form-input pl-10"
            placeholder="Search by username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button
          onClick={handleSearch}
          disabled={query.trim().length < 2 || loading}
          isLoading={loading}
        >
          Search
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {users.length === 0 && query.trim().length >= 2 && !loading ? (
          <p className="text-center text-primary-500 dark:text-primary-400 py-6">
            No users found matching "{query}"
          </p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-primary-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleProfileClick(user.username)}
            >
              <div className="flex items-center space-x-3">
                <Avatar src={user.profileImage} alt={user.username} size="md" />
                <div>
                  <p className="font-medium text-primary-900 dark:text-primary-100">
                    {user.username}
                  </p>
                  <p className="text-sm text-primary-500 dark:text-primary-400">
                    {user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-xs text-primary-500 dark:text-primary-400">
                  <span className="font-medium">{user._count?.posts || 0}</span> posts
                </div>
                <div className="text-xs text-primary-500 dark:text-primary-400">
                  <span className="font-medium">{user._count?.followedBy || 0}</span> followers
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 