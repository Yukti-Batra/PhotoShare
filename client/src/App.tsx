import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { PostPage } from './pages/PostPage';
import { CreatePostPage } from './pages/CreatePostPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { SearchPage } from './pages/SearchPage';
import { FollowersPage } from './pages/FollowersPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { useAuth } from './context/AuthContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route that redirects to home if already authenticated
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicOnlyRoute>
          <LoginPage />
        </PublicOnlyRoute>
      } />
      <Route path="/register" element={
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        user ? (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ) : (
          <Navigate to="/landing" replace />
        )
      } />
      <Route path="/profile/:username" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:username/followers" element={
        <ProtectedRoute>
          <FollowersPage />
        </ProtectedRoute>
      } />
      <Route path="/profile/:username/following" element={
        <ProtectedRoute>
          <FollowersPage />
        </ProtectedRoute>
      } />
      <Route path="/post/:id" element={
        <ProtectedRoute>
          <PostPage />
        </ProtectedRoute>
      } />
      <Route path="/create-post" element={
        <ProtectedRoute>
          <CreatePostPage />
        </ProtectedRoute>
      } />
      <Route path="/edit-profile" element={
        <ProtectedRoute>
          <EditProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      } />
      <Route path="/search" element={
        <ProtectedRoute>
          <SearchPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to={user ? "/" : "/landing"} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route
                path="/landing"
                element={<LandingPage />}
              />
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-primary-50 dark:bg-primary-900 text-primary-900 dark:text-primary-50">
                    <Header />
                    <main>
                      <AppRoutes />
                    </main>
                  </div>
                }
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;