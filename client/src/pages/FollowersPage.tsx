import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollowers, getFollowing, followUser, unfollowUser, getUserProfile } from '../api/users';
import { User } from '../types';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

enum Tab {
  FOLLOWERS = 'followers',
  FOLLOWING = 'following'
}

export const FollowersPage = () => {
  const { username, tab = Tab.FOLLOWERS } = useParams<{ username: string; tab?: string }>();
  const [activeTab, setActiveTab] = useState<Tab>(tab as Tab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [currentUserFollowing, setCurrentUserFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [followLoading, setFollowLoading] = useState<{ [key: string]: boolean }>({});
  const [followState, setFollowState] = useState<{ [key: string]: boolean }>({});
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (tab && (tab === Tab.FOLLOWERS || tab === Tab.FOLLOWING)) {
      setActiveTab(tab as Tab);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [username, activeTab]);

  useEffect(() => {
    if (currentUser?.id) {
      loadCurrentUserFollowing();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ ...toast, visible: false });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Update follow state whenever currentUserFollowing changes
  useEffect(() => {
    updateFollowStates();
  }, [currentUserFollowing, followers, following]);

  const loadCurrentUserFollowing = async () => {
    if (!currentUser?.id) return;

    try {
      const response = await getFollowing(currentUser.id);
      // Extract usernames from the following list
      const followingUserIds = response.data.map(user => user.id);
      setCurrentUserFollowing(followingUserIds);
    } catch (err) {
      console.error('Failed to load current user following:', err);
    }
  };

  const updateFollowStates = () => {
    const newFollowState: { [key: string]: boolean } = {};

    // Check if each user in either followers or following list is being followed by current user
    const usersToCheck = activeTab === Tab.FOLLOWERS ? followers : following;

    usersToCheck.forEach(user => {
      // User is followed if they're in currentUserFollowing array
      newFollowState[user.id] = currentUserFollowing.includes(user.id);
    });

    setFollowState(newFollowState);
  };

  const loadData = async () => {
    if (!username) return;

    setLoading(true);
    setError('');

    try {
      // Get user profile to find the user ID
      const userResponse = await getUserProfile(username);
      const userId = userResponse.id;

      // Get followers or following data based on active tab
      const fetchedData = await (activeTab === Tab.FOLLOWERS
        ? getFollowers(userId)
        : getFollowing(userId));

      if (activeTab === Tab.FOLLOWERS) {
        setFollowers(fetchedData.data);
      } else {
        setFollowing(fetchedData.data);
      }
    } catch (err: unknown) {
      setError('Failed to load data. Please try again.');
      console.error(`Failed to load ${activeTab}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    navigate(`/profile/${username}/${newTab}`);
  };

  const handleFollow = async (userId: string, username: string) => {
    if (followLoading[userId]) return;

    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      await followUser(userId);

      // Update follow state
      setFollowState(prev => ({
        ...prev,
        [userId]: true
      }));

      // Add to current user's following list
      if (!currentUserFollowing.includes(userId)) {
        setCurrentUserFollowing(prev => [...prev, userId]);
      }

      setToast({
        message: `You are now following ${username}`,
        visible: true
      });
    } catch (error) {
      console.error('Failed to follow user:', error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUnfollow = async (userId: string, username: string) => {
    if (followLoading[userId]) return;

    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    try {
      await unfollowUser(userId);

      // Update follow state
      setFollowState(prev => ({
        ...prev,
        [userId]: false
      }));

      // Remove from current user's following list
      setCurrentUserFollowing(prev => prev.filter(id => id !== userId));

      setToast({
        message: `You unfollowed ${username}`,
        visible: true
      });
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const renderUserItem = (user: User) => {
    const isCurrentUser = currentUser?.id === user.id;
    const isFollowing = followState[user.id] || false;

    return (
      <div key={user.id} className="flex items-center justify-between py-3 px-4 border-b dark:border-primary-700 last:border-0">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate(`/profile/${user.username}`)}
        >
          <Avatar src={user.profileImage} alt={user.username} size="md" />
          <div className="ml-3">
            <p className="font-medium text-primary-900 dark:text-primary-100">{user.username}</p>
            <p className="text-sm text-primary-500 dark:text-primary-400">{user.name}</p>
          </div>
        </div>

        {!isCurrentUser && (
          <Button
            variant={isFollowing ? "outline" : "primary"}
            size="sm"
            onClick={() => isFollowing
              ? handleUnfollow(user.id, user.username)
              : handleFollow(user.id, user.username)
            }
            isLoading={followLoading[user.id]}
            disabled={followLoading[user.id]}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Toast notification */}
      {toast.visible && (
        <div className="fixed top-16 inset-x-0 flex justify-center z-50 animate-fade-in-down">
          <div className="bg-primary-800 text-white px-4 py-2 rounded-lg shadow-lg">
            {toast.message}
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {/* Header */}
        <div className="border-b dark:border-primary-700 flex">
          <button
            className={`flex-1 py-3 text-center font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700/50 ${activeTab === Tab.FOLLOWERS
              ? 'border-b-2 border-instagram-blue text-instagram-blue dark:text-instagram-blue'
              : ''
              }`}
            onClick={() => handleTabChange(Tab.FOLLOWERS)}
          >
            Followers
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-700/50 ${activeTab === Tab.FOLLOWING
              ? 'border-b-2 border-instagram-blue text-instagram-blue dark:text-instagram-blue'
              : ''
              }`}
            onClick={() => handleTabChange(Tab.FOLLOWING)}
          >
            Following
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="py-10 text-center text-primary-500 dark:text-primary-400">
            Loading...
          </div>
        ) : (
          <>
            {/* Empty state */}
            {activeTab === Tab.FOLLOWERS && followers.length === 0 ? (
              <div className="py-10 text-center text-primary-500 dark:text-primary-400">
                No followers yet
              </div>
            ) : activeTab === Tab.FOLLOWING && following.length === 0 ? (
              <div className="py-10 text-center text-primary-500 dark:text-primary-400">
                Not following anyone yet
              </div>
            ) : (
              /* User list */
              <div className="divide-y dark:divide-primary-700">
                {activeTab === Tab.FOLLOWERS
                  ? followers.map(renderUserItem)
                  : following.map(renderUserItem)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}; 