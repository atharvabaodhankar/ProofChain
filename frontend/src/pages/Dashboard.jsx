import React, { useState, useEffect } from 'react';
import { Shield, Clock, Hash, ExternalLink, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, authenticatedApiCall } from '../config/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentProofs, setRecentProofs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBlockchainStatus();
      fetchUserStats();
      fetchRecentActivity();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchBlockchainStatus = async () => {
    try {
      const token = await user.getIdToken();
      const data = await authenticatedApiCall(
        API_ENDPOINTS.PROOF.STATUS,
        { method: 'GET' },
        token
      );
      
      if (data.success) {
        setBlockchainStatus(data.blockchain);
      } else {
        toast.error('Failed to fetch blockchain status');
      }
    } catch (error) {
      console.error('Error fetching blockchain status:', error);
      toast.error('Failed to connect to backend');
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = await user.getIdToken();
      const data = await authenticatedApiCall(
        `${API_ENDPOINTS.PROOF.HISTORY}?limit=5`,
        { method: 'GET' },
        token
      );
      
      if (data.success) {
        const proofs = data.proofs;
        const lastActivity = proofs.length > 0 ? proofs[0].createdAt : null;
        
        setUserStats({
          totalProofs: proofs.length,
          lastActivity: lastActivity
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = await user.getIdToken();
      const data = await authenticatedApiCall(
        `${API_ENDPOINTS.PROOF.HISTORY}?limit=3`,
        { method: 'GET' },
        token
      );
      
      if (data.success) {
        setRecentProofs(data.proofs);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (!user) {
    return (
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center mb-6 shadow-lg">
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
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Personal Dashboard
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">{user.displayName?.split(' ')[0] || 'User'}</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
          Manage your proofs, view blockchain status, and track your activity.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {/* User Info Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-full ring-2 ring-indigo-400/50"
                />
              ) : (
                <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 rounded-full blur-sm"></div>
                  <div className="relative h-full w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                  {user.displayName || 'User'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-slate-500">
              <p className="font-mono truncate">User ID: {user.uid.substring(0, 20)}...</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <span className="material-symbols-outlined text-green-400 text-lg sm:text-xl">bolt</span>
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => window.location.href = '/create'}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-all text-left flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">add_circle</span>
                <span className="truncate">Create New Proof</span>
              </button>
              <button
                onClick={() => window.location.href = '/verify'}
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-medium transition-all text-left flex items-center gap-2 text-sm sm:text-base"
              >
                <span className="material-symbols-outlined text-lg sm:text-xl">verified</span>
                <span className="truncate">Verify Existing Proof</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
            <h3 className="font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-base">
              <span className="material-symbols-outlined text-violet-400 text-lg sm:text-xl">analytics</span>
              Your Activity
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-400">Proofs Created</span>
                <span className="font-semibold text-white text-sm sm:text-base">
                  {userStats ? userStats.totalProofs : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-slate-400">Last Activity</span>
                <span className="font-semibold text-xs sm:text-sm text-white">
                  {userStats ? formatDate(userStats.lastActivity) : '-'}
                </span>
              </div>
              <button
                onClick={() => window.location.href = '/history'}
                className="w-full text-left text-xs text-indigo-400 hover:text-indigo-300 underline mt-2"
              >
                View full history →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      {blockchainStatus && (
        <div className="relative group mb-6 lg:mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <h3 className="font-semibold text-white text-lg sm:text-xl">Blockchain Status</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Network
                </label>
                <p className="text-white font-mono bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 text-sm sm:text-base">
                  {blockchainStatus.network}
                </p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Wallet Balance
                </label>
                <p className="text-white font-mono bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 text-sm sm:text-base">
                  {blockchainStatus.balance}
                </p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Wallet Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-xs sm:text-sm bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 truncate flex-1">
                    {blockchainStatus.walletAddress}
                  </p>
                  <a
                    href={`https://sepolia.etherscan.io/address/${blockchainStatus.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                  </a>
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                  Contract Address
                </label>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono text-xs sm:text-sm bg-slate-950/50 px-3 py-2 rounded-lg border border-white/10 truncate flex-1">
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
                      className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                    >
                      <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-green-400">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>System operational</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="relative group mb-6 lg:mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="font-semibold text-white text-lg sm:text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
              Recent Activity
            </h3>
            {recentProofs.length > 0 && (
              <button
                onClick={() => window.location.href = '/history'}
                className="text-xs sm:text-sm text-orange-400 hover:text-orange-300 underline"
              >
                View all
              </button>
            )}
          </div>
          
          {recentProofs.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-full blur-sm"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-slate-500" />
                </div>
              </div>
              <p className="text-slate-300 mb-2 text-base sm:text-lg">No recent activity</p>
              <p className="text-xs sm:text-sm text-slate-500">
                Your proof creation and verification history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentProofs.map((proof, index) => (
                <div key={proof.hash} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-950/30 rounded-xl border border-white/5">
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-20 rounded-full blur-sm"></div>
                    <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                      {proof.type === 'file' ? (
                        <span className="material-symbols-outlined text-orange-400 text-sm sm:text-base">description</span>
                      ) : (
                        <Hash className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium text-sm sm:text-base truncate">
                        {proof.type === 'file' ? (proof.fileName || 'File Proof') : 'Text Proof'}
                      </p>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full flex-shrink-0">
                        {proof.type}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400">
                      {formatDate(proof.createdAt)}
                    </p>
                  </div>
                  
                  <a
                    href={`https://sepolia.etherscan.io/tx/${proof.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-4 sm:p-6">
          <h3 className="font-semibold text-white mb-4 sm:mb-6 text-lg sm:text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-400 text-xl sm:text-2xl">help</span>
            Need Help?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="material-symbols-outlined text-blue-400 text-base sm:text-lg">info</span>
                How it works
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mb-3">
                Learn how our Proof of Existence system uses blockchain technology 
                to timestamp your data.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center gap-2 text-sm sm:text-base">
                <span className="material-symbols-outlined text-green-400 text-base sm:text-lg">tips_and_updates</span>
                Best practices
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mb-3">
                Tips for creating and managing your proofs effectively.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-6 pt-4 border-t border-white/10">
            <p className="text-xs sm:text-sm text-slate-500">
              For technical support or questions, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;