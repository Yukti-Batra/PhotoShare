import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Button } from '../components/Button';

export const LandingPage = () => {
  return (
    <div className="bg-gradient-to-tr from-instagram-pink via-instagram-purple to-instagram-blue min-h-screen">
      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">PhotoShare</h1>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white !text-black hover:bg-white/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Share moments, connect with friends
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Experience the joy of sharing your best moments with friends and followers. PhotoShare provides the core features you love, all in one place.
            </p>
            <Link to="/register">
              <Button
                className="bg-white !text-black hover:bg-white/90 px-8 py-3 text-lg"
                icon={<ArrowRightIcon className="ml-2 h-5 w-5" />}
              >
                Get Started
              </Button>
            </Link>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-tr from-white/10 to-white/20 backdrop-blur-sm rounded-3xl shadow-2xl p-4 transform rotate-2">
              <img
                src="/hero-image.jpg"
                alt="App mockup"
                className="rounded-2xl shadow-lg"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-instagram-yellow rounded-full blur-xl opacity-50"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-instagram-pink rounded-full blur-xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-16">Key Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-instagram-pink to-instagram-purple rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Photo Sharing</h3>
              <p className="text-white/70">Share your best moments with beautiful photos and captions.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-instagram-blue to-instagram-purple rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Comments & Likes</h3>
              <p className="text-white/70">Engage with content through likes and meaningful comments.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-r from-instagram-orange to-instagram-yellow rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Follow Friends</h3>
              <p className="text-white/70">Connect with friends and see their content in your personalized feed.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to join our community?</h2>
          <p className="text-white/80 text-lg mb-8">
            Sign up today and start sharing your moments with the world.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login">
              <Button variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20 px-8 py-3">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white !text-black hover:bg-white/90 px-8 py-3">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} PhotoShare. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}; 