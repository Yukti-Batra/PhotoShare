import { useState, useRef, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { updateUserProfile } from '../api/users';

export const EditProfilePage = () => {
  const { user, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(user?.profileImage || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    // Redirect to login if not authenticated
    navigate('/login');
    return null;
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setProfileImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setProfileImage(null);
    setProfileImagePreview(user?.profileImage || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();

      // Only include fields that have changed
      if (name !== user.name) {
        formData.append('name', name);
      }

      if (username !== user.username) {
        formData.append('username', username);
      }

      if (bio !== user.bio) {
        formData.append('bio', bio || ''); // Handle null/undefined bio
      }

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      // Check if any data is being updated
      if ([...formData.entries()].length === 0 && !profileImage) {
        // No changes detected
        navigate(`/profile/${user.username}`);
        return;
      }

      const updatedUser = await updateUserProfile(formData);

      // Update user data in context
      updateUserData(updatedUser);

      // Redirect to profile page
      navigate(`/profile/${updatedUser.username}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:py-12">
      <div className="card">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-6">
          Edit Profile
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <Avatar
                src={profileImagePreview}
                alt={user.username}
                size="xl"
                className="cursor-pointer"
              />
              <div
                className="absolute inset-0 flex items-center justify-center bg-primary-900/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <CameraIcon className="h-8 w-8 text-white" />
              </div>
              {profileImagePreview && profileImagePreview !== user.profileImage && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1 -right-1 p-1 bg-primary-900/70 dark:bg-primary-900/90 rounded-full text-white hover:bg-primary-800 dark:hover:bg-primary-800"
                  aria-label="Remove image"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-instagram-blue hover:text-instagram-purple"
            >
              Change Profile Photo
            </button>
          </div>

          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="form-input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-primary-700 dark:text-primary-300 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="form-input"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(`/profile/${user.username}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 