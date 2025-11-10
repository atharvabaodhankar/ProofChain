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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign In Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your dashboard
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600">
          Welcome back, {user.displayName || user.email}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="h-12 w-12 rounded-full"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.displayName || 'User'}
              </h3>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            <p>User ID: {user.uid}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/create'}
              className="btn btn-primary w-full text-left"
            >
              Create New Proof
            </button>
            <button
              onClick={() => window.location.href = '/verify'}
              className="btn btn-outline w-full text-left"
            >
              Verify Existing Proof
            </button>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Your Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Proofs Created</span>
              <span className="font-semibold">-</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Last Activity</span>
              <span className="font-semibold text-sm">-</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Activity tracking coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Blockchain Status */}
      {blockchainStatus && (
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Blockchain Status</h3>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Network
              </label>
              <p className="text-sm text-gray-900">{blockchainStatus.network}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Balance
              </label>
              <p className="text-sm text-gray-900">{blockchainStatus.balance}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-900 font-mono truncate">
                  {blockchainStatus.walletAddress}
                </p>
                <a
                  href={`https://sepolia.etherscan.io/address/${blockchainStatus.walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contract Address
              </label>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-900 font-mono truncate">
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
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>System operational</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div className="card mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No recent activity</p>
          <p className="text-sm text-gray-400">
            Your proof creation and verification history will appear here
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="card mt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">How it works</h4>
            <p className="text-sm text-gray-600 mb-3">
              Learn how our Proof of Existence system uses blockchain technology 
              to timestamp your data.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Best practices</h4>
            <p className="text-sm text-gray-600 mb-3">
              Tips for creating and managing your proofs effectively.
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            For technical support or questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;