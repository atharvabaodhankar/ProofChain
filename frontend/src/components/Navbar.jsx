import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <Shield className="h-10 w-10 text-primary-400 group-hover:text-primary-300 transition-colors duration-300" />
                <div className="absolute inset-0 h-10 w-10 bg-primary-400/20 rounded-full blur-xl group-hover:bg-primary-300/30 transition-all duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text">
                  ProofChain
                </span>
                <span className="text-xs text-gray-400 -mt-1">Proof of Existence</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/create', label: 'Create' },
                { path: '/verify', label: 'Verify' },
                ...(user ? [{ path: '/dashboard', label: 'Dashboard' }] : [])
              ].map(({ path, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 group ${
                    isActive(path) 
                      ? 'text-primary-300 bg-primary-500/20' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                  {isActive(path) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-xl blur-sm"></div>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                    {user.photoURL ? (
                      <div className="relative">
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="h-8 w-8 rounded-full ring-2 ring-primary-400/50"
                        />
                        <div className="absolute inset-0 h-8 w-8 bg-primary-400/20 rounded-full blur-md"></div>
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white hidden sm:block">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-red-400 transition-colors duration-300 hover:bg-red-500/10 rounded-xl"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="btn btn-primary flex items-center space-x-2 group"
                >
                  <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;