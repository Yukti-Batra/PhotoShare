import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export const SettingsPage = () => {
  const { user, deactivateAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDeactivateAccount = async () => {
    setDeactivateLoading(true);
    setError('');

    try {
      await deactivateAccount();
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to deactivate account. Please try again.');
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="card">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-primary-100 mb-6">
          Account Settings
        </h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              Profile Settings
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 mb-4">
              Manage your profile information and preferences
            </p>
            <Link to="/edit-profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>

          <div className="border-t dark:border-primary-700 pt-6">
            <h2 className="text-lg font-medium text-primary-900 dark:text-primary-100 mb-2">
              Account Actions
            </h2>

            <div className="mt-4">
              <h3 className="text-md font-medium text-red-600 dark:text-red-400">
                Deactivate Account
              </h3>
              <p className="text-sm text-primary-600 dark:text-primary-400 mb-3">
                Temporarily disable your account. You can reactivate by logging in again.
              </p>

              {!showDeactivateConfirm ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowDeactivateConfirm(true)}
                >
                  Deactivate Account
                </Button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
                  <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                    Are you sure you want to deactivate your account? Your profile and posts will be hidden until you log in again.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={handleDeactivateAccount}
                      isLoading={deactivateLoading}
                      disabled={deactivateLoading}
                    >
                      Yes, Deactivate
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowDeactivateConfirm(false)}
                      disabled={deactivateLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 