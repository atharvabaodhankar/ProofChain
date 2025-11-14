import React, { useState, useEffect } from 'react';
import { Shield, Clock, Hash, ExternalLink, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlockchainStatus();
  }, []);

  const fetchBlockchainStatus = async () => {
    try {
      const response = await fetch('/api/proof/status', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setBlockchainStatus(data.blockchain);
      } else {
        toast.error('Failed to fetch blockchain status');
      }
    } catch (error) {
      console.error('Error fetching blockchain status:', error);
      toast.error('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-slate-900/40 rounded-full flex items-center justify-center border border-white/10 mb-6 shadow-lg">
            <User className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Sign In Required
          </h1>
          <p className="text-slate-400 mb-6">
            Please sign in to access your dashboard
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-6 rounded-xl font-semibold transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500/30 border-t-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Personal Dashboard
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">{user.displayName?.split(' ')[0] || 'User'}</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Manage your proofs, view blockchain status, and track your activity.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-12 w-12 rounded-full ring-2 ring-indigo-400/50"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-white">
                  {user.displayName || 'User'}
                </h3>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <p className="font-mono">User ID: {user.uid.substring(0, 20)}...</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-400">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => window.location.href = '/create'}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-4 rounded-xl font-medium transition-all text-left flex items-center gap-2"
              >
                <span className="material-symbols-outlined">add_circle</span>
                Create New Proof
              </button>
              <button
                onClick={() => window.location.href = '/verify'}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-4 rounded-xl font-medium transition-all text-left flex items-center gap-2"
              >
                <span className="material-symbols-outlined">verified</span>
                Verify Existing Proof
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400">analytics</span>
              Your Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Proofs Created</span>
                <span className="font-semibold text-white">-</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Last Activity</span>
                <span className="font-semibold text-sm text-white">-</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Activity tracking coming soon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      {blockchainStatus && (
        <div className="relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="h-6 w-6 text-blue-400" />
              <h3 className="font-semibold text-white text-xl">Blockchain Status</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Network
                </label>
                <p className="text-white font-mono bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10">
                  {blockchainStatus.network}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet Balance
                </label>
                <p className="text-white font-mono bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10">
                  {blockchainStatus.balance}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-sm bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 truncate flex-1">
                    {blockchainStatus.walletAddress}
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${blockchainStatus.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contract Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-sm bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 truncate flex-1">
                    {blockchainStatus.contractAddress === 'Not deployed' 
                      ? 'Not deployed' 
                      : blockchainStatus.contractAddress
                    }
                  </p>
                  {blockchainStatus.contractAddress !== 'Not deployed' && (
                    <a
                      href={`https://sepolia.etherscan.io/address/${blockchainStatus.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6 text-xl flex items-center gap-2">
            <Clock className="h-6 w-6 text-orange-400" />
            Recent Activity
          </h3>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-slate-300 mb-2 text-lg">No recent activity</p>
            <p className="text-sm text-slate-500">
              Your proof creation and verification history will appear here
            </p>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6 text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400">help</span>
            Need Help?
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">info</span>
                How it works
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                Learn how our Proof of Existence system uses blockchain technology 
                to timestamp your data.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400 text-sm">tips_and_updates</span>
                Best practices
              </h4>
              <p className="text-sm text-slate-400 mb-3">
                Tips for creating and managing your proofs effectively.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-sm text-slate-500">
              For technical support or questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;