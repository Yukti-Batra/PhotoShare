import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { useProfileQuery } from '../hooks/useProfileQuery';
import { useAuth } from '../context/AuthContext';
import { followUser, unfollowUser } from '../api/users';
import { formatDate } from '../utils/date';

export const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean | undefined>(undefined);
  const [followLoading, setFollowLoading] = useState(false);

  const { data: profile, isLoading, error } = useProfileQuery(username || '');

  // Initialize isFollowing with profile data when it loads
  if (isFollowing === undefined && profile?.isFollowing !== undefined) {
    setIsFollowing(profile.isFollowing);
  }

  const isCurrentUser = currentUser?.username === username;

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
      } else {
        await followUser(profile.id);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-instagram-blue"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-primary-800 dark:text-primary-200">
            Profile not found
          </h2>
          <p className="mt-2 text-primary-600 dark:text-primary-400">
            The user you're looking for doesn't exist or is unavailable.
          </p>
          <Link to="/">
            <Button className="mt-4" variant="secondary">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
      {/* Profile Header */}
      <div className="card mb-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-shrink-0 mb-4 sm:mb-0 flex justify-center">
            <Avatar
              src={profile.profileImage}
              alt={profile.username}
              size="xl"
            />
          </div>
          <div className="sm:ml-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {profile.username}
              </h1>
              <div className="mt-2 sm:mt-0">
                {isCurrentUser ? (
                  <Link to="/edit-profile">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<PencilSquareIcon className="h-4 w-4" />}
                    >
                      Edit Profile
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={handleFollowToggle}
                    isLoading={followLoading}
                    disabled={followLoading}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-3 text-lg font-medium text-primary-800 dark:text-primary-200">
              {profile.name}
            </div>
            {profile.bio && (
              <p className="mt-2 text-primary-600 dark:text-primary-400">
                {profile.bio}
              </p>
            )}
            <div className="mt-3 text-sm text-primary-500 dark:text-primary-500">
              Joined {formatDate(profile.createdAt || '')}
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        <div className="mt-6 border-t border-primary-200 dark:border-primary-700 pt-6">
          <div className="flex justify-around">
            <div className="text-center">
              <div className="text-xl font-bold text-primary-900 dark:text-primary-100">
                {profile._count?.posts || 0}
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400">
                Posts
              </div>
            </div>
            <Link
              to={`/profile/${username}/followers`}
              className="text-center hover:bg-primary-50 dark:hover:bg-primary-800/50 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="text-xl font-bold text-primary-900 dark:text-primary-100">
                {profile._count?.followedBy || 0}
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400">
                Followers
              </div>
            </Link>
            <Link
              to={`/profile/${username}/following`}
              className="text-center hover:bg-primary-50 dark:hover:bg-primary-800/50 px-4 py-2 rounded-lg transition-colors"
            >
              <div className="text-xl font-bold text-primary-900 dark:text-primary-100">
                {profile._count?.following || 0}
              </div>
              <div className="text-sm text-primary-600 dark:text-primary-400">
                Following
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <h2 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-4">
        Posts
      </h2>
      {profile.posts && profile.posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 sm:gap-4">
          {profile.posts.map((post) => (
            <Link to={`/post/${post.id}`} key={post.id}>
              <div className="aspect-square bg-primary-100 dark:bg-primary-800 overflow-hidden rounded-md hover:opacity-90 transition-opacity">
                <img
                  src={post.imageUrl}
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-primary-50 dark:bg-primary-800/50 rounded-md">
          <p className="text-primary-600 dark:text-primary-400">
            {isCurrentUser
              ? "You haven't posted anything yet."
              : "This user hasn't posted anything yet."}
          </p>
          {isCurrentUser && (
            <Link to="/create-post">
              <Button className="mt-4">Create Your First Post</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}; 