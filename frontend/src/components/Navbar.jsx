import React from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedLink from './AnimatedLink';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <AnimatedLink to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <img 
                  src="/ProofChain.png" 
                  alt="ProofChain Logo" 
                  className="w-9 h-9 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">ProofChain</span>
            </AnimatedLink>
          </div>

          <div className="flex items-center space-x-8">
            <div className="hidden md:flex items-center space-x-8">
              {[
                { path: '/', label: 'Home' },
                { path: '/create', label: 'Create Proof' },
                { path: '/verify', label: 'Verify' },
                { path: '/dashboard', label: 'Dashboard' },
                { path: '/history', label: 'History' }
              ].map(({ path, label }) => (
                <AnimatedLink
                  key={path}
                  to={path}
                  className={`nav-link relative ${
                    isActive(path) 
                      ? 'active after:absolute after:bottom-[-28px] after:left-0 after:w-full after:h-[2px] after:bg-indigo-500 after:content-[\'\'] after:shadow-[0_-4px_12px_rgba(99,102,241,0.6)]' 
                      : ''
                  }`}
                >
                  {label}
                </AnimatedLink>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="h-8 w-8 rounded-full ring-2 ring-indigo-400/50"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white hidden sm:block">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 hover:bg-white/5 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    onClick={login}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/5 transition-all">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;