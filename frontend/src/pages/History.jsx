import React, { useState, useEffect } from 'react';
import { Clock, FileText, Shield, ExternalLink, Hash, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const History = () => {
  const { user, getAuthHeaders } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserHistory();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserHistory = async () => {
    try {
      const response = await fetch('/api/proof/history', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setProofs(data.proofs);
      } else {
        toast.error('Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      toast.error('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/proof/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wide mb-4">
            <User className="w-3 h-3" />
            Authentication Required
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4">
            Sign In to View <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400">History</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Please sign in to view your proof creation history and track your blockchain activities.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-500/30 border-t-violet-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          Activity History
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Your Proof <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400">History</span>
        </h1>
        
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
          Track all your proof creation activities and blockchain records.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 lg:mb-12">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{proofs.length}</div>
            <div className="text-sm text-slate-400">Your Proofs</div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalProofs}</div>
            <div className="text-sm text-slate-400">Total Platform Proofs</div>
          </div>
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            <div className="text-sm text-slate-400">Total Users</div>
          </div>
        </div>
      )}

      {proofs.length === 0 ? (
        /* No History */
        <div className="relative group max-w-4xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 sm:p-12">
            <div className="text-center space-y-4 lg:space-y-6">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 rounded-full blur-sm"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <Clock className="h-8 w-8 sm:h-10 sm:w-10 text-violet-400" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">No Proofs Yet</h2>
                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  You haven't created any proofs yet. Start by creating your first proof to see your activity history here.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => window.location.href = '/create'}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-8 rounded-xl font-semibold transition-all"
                >
                  Create Your First Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History List */
        <div className="space-y-4">
          {proofs.map((proof, index) => (
            <div key={proof.hash} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-xl rounded-2xl p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 rounded-full blur-sm"></div>
                      <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                        {proof.type === 'file' ? (
                          <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
                        ) : (
                          <Hash className="h-5 w-5 sm:h-6 sm:w-6 text-violet-400" />
                        )}
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-medium text-sm sm:text-base">
                          {proof.type === 'file' ? (proof.fileName || 'File Proof') : 'Text Proof'}
                        </h3>
                        <span className="px-2 py-1 bg-violet-500/20 text-violet-300 text-xs rounded-full">
                          {proof.type}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span className="text-xs sm:text-sm text-slate-400">
                            {formatDate(proof.timestamp)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Hash className="h-3 w-3 text-slate-500" />
                          <code className="text-xs font-mono text-slate-400 truncate">
                            {proof.hash}
                          </code>
                          <button
                            onClick={() => copyToClipboard(proof.hash)}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[12px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://sepolia.etherscan.io/tx/${proof.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg transition-all text-sm"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="hidden sm:inline">View on Etherscan</span>
                      <span className="sm:hidden">View</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;