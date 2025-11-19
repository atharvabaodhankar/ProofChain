import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, User, LogOut, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedLink from './AnimatedLink';

const Navbar = () => {
  const { user, login, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/create', label: 'Create Proof' },
    { path: '/verify', label: 'Verify' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/history', label: 'History' }
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <AnimatedLink to="/" className="flex items-center space-x-2 lg:space-x-3 group" onClick={closeMobileMenu}>
              <div className="relative">
                <img 
                  src="/ProofChain.png" 
                  alt="ProofChain Logo" 
                  className="w-8 h-8 lg:w-9 lg:h-9 rounded-lg shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300"
                />
              </div>
              <span className="text-base lg:text-lg font-bold tracking-tight text-white">ProofChain</span>
            </AnimatedLink>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-8">
              {navItems.map(({ path, label }) => (
                <AnimatedLink
                  key={path}
                  to={path}
                  className={`nav-link relative text-sm xl:text-base ${
                    isActive(path) 
                      ? 'active after:absolute after:bottom-[-28px] after:left-0 after:w-full after:h-[2px] after:bg-indigo-500 after:content-[\'\'] after:shadow-[0_-4px_12px_rgba(99,102,241,0.6)]' 
                      : ''
                  }`}
                >
                  {label}
                </AnimatedLink>
              ))}
            </div>

            {/* Desktop Auth */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 px-3 lg:px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 transition-all">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="h-7 w-7 lg:h-8 lg:w-8 rounded-full ring-2 ring-indigo-400/50"
                      />
                    ) : (
                      <div className="h-7 w-7 lg:h-8 lg:w-8 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                        <User className="h-3 w-3 lg:h-4 lg:w-4 text-white" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-white hidden xl:block">
                      {user.displayName || user.email}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-2 px-3 lg:px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors duration-300 hover:bg-white/5 rounded-lg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden xl:block">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 lg:gap-4">
                  <button
                    onClick={login}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    Sign In
                  </button>
                  <button className="bg-white/5 hover:bg-white/10 text-white text-sm font-medium px-3 lg:px-4 py-2 rounded-lg border border-white/5 transition-all">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="h-7 w-7 rounded-full ring-2 ring-indigo-400/50"
                  />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                    <User className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map(({ path, label }) => (
                <AnimatedLink
                  key={path}
                  to={path}
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                    isActive(path)
                      ? 'text-white bg-indigo-500/20 border-l-4 border-indigo-500'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </AnimatedLink>
              ))}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-white/10 mt-4">
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-white">
                        {user.displayName || user.email}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        login();
                        closeMobileMenu();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Sign In
                    </button>
                    <button className="w-full text-left px-3 py-2 rounded-lg text-base font-medium bg-white/5 hover:bg-white/10 text-white border border-white/5 transition-all">
                      Connect Wallet
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;