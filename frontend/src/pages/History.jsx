import React, { useState, useEffect } from 'react';
import { Clock, FileText, Shield, ExternalLink, Hash, Calendar, User, Search, Trash2, Download, Filter } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS, apiCall, authenticatedApiCall } from '../config/api';
import toast from 'react-hot-toast';

const History = () => {
  const { user, getAuthHeaders } = useAuth();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserHistory();
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, sortBy, sortDirection]);

  const fetchUserHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        orderBy: sortBy,
        orderDirection: sortDirection
      });
      
      const token = await user.getIdToken();
      const data = await authenticatedApiCall(
        `${API_ENDPOINTS.PROOF.HISTORY}?${params}`,
        { method: 'GET' },
        token
      );
      
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
      const data = await apiCall(API_ENDPOINTS.PROOF.STATS);
      
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

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const deleteAllHistory = async () => {
    try {
      const token = await user.getIdToken();
      const data = await authenticatedApiCall(
        API_ENDPOINTS.PROOF.HISTORY,
        { method: 'DELETE' },
        token
      );
      
      if (data.success) {
        setProofs([]);
        setShowDeleteConfirm(false);
        toast.success('All history deleted successfully');
      } else {
        toast.error('Failed to delete history');
      }
    } catch (error) {
      console.error('Error deleting history:', error);
      toast.error('Failed to delete history');
    }
  };

  const exportHistory = () => {
    const csvContent = [
      ['Hash', 'Type', 'File Name', 'Transaction Hash', 'Block Number', 'Timestamp', 'Created At'].join(','),
      ...filteredProofs.map(proof => [
        proof.hash,
        proof.type,
        proof.fileName || '',
        proof.transactionHash,
        proof.blockNumber,
        new Date(proof.timestamp * 1000).toISOString(),
        proof.createdAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proofchain-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('History exported successfully');
  };

  // Filter and search proofs
  const filteredProofs = proofs.filter(proof => {
    const matchesSearch = !searchQuery || 
      proof.hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (proof.fileName && proof.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      proof.transactionHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || proof.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

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
            <div className="text-2xl font-bold text-white">{filteredProofs.length}</div>
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

      {/* Controls */}
      {proofs.length > 0 && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 sm:p-6 mb-6 space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by hash, filename, or transaction..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950/50 border border-white/10 rounded-lg text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all text-sm"
              />
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-2 text-slate-200 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              >
                <option value="all">All Types</option>
                <option value="text">Text Proofs</option>
                <option value="file">File Proofs</option>
              </select>
            </div>
          </div>

          {/* Sort and Actions Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* Sort Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950/50 border border-white/10 rounded-lg px-3 py-1 text-slate-200 text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="timestamp">Blockchain Time</option>
                  <option value="type">Type</option>
                </select>
              </div>
              
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
                title={`Sort ${sortDirection === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={exportHistory}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg transition-all text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg transition-all text-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Delete All</span>
              </button>
            </div>
          </div>

          {/* Results Count */}
          {searchQuery || filterType !== 'all' ? (
            <div className="text-sm text-slate-400">
              Showing {filteredProofs.length} of {proofs.length} proofs
            </div>
          ) : null}
        </div>
      )}

      {filteredProofs.length === 0 ? (
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
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                  {searchQuery || filterType !== 'all' ? 'No Matching Proofs' : 'No Proofs Yet'}
                </h2>
                <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'You haven\'t created any proofs yet. Start by creating your first proof to see your activity history here.'
                  }
                </p>
              </div>

              <div className="pt-4">
                {searchQuery || filterType !== 'all' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-lg shadow-violet-500/25 py-3 px-8 rounded-xl font-semibold transition-all"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => window.location.href = '/create'}
                    className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-8 rounded-xl font-semibold transition-all"
                  >
                    Create Your First Proof
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History List */
        <div className="space-y-4">
          {filteredProofs.map((proof, index) => (
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
                        {proof.fileSize && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {formatFileSize(proof.fileSize)}
                          </span>
                        )}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-400" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Delete All History?</h3>
                <p className="text-slate-400 text-sm">
                  This will permanently delete all your proof history from our database. 
                  The proofs will still exist on the blockchain and can be verified.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllHistory}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;