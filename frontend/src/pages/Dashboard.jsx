import { useSmartAccount } from '../hooks/useSmartAccount';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, smartAccountAddress, authenticated, login } = useSmartAccount();

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Please sign in to view your dashboard</p>
          <button
            onClick={login}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-8 rounded-xl font-semibold transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Manage your proofs and account</p>
      </div>

      {/* Account Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">person</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Account</h3>
              <p className="text-sm text-slate-400">Your identity</p>
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Email</label>
              <p className="text-sm text-slate-200">{user?.google?.email || user?.email?.address || 'Not available'}</p>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Name</label>
              <p className="text-sm text-slate-200">{user?.google?.name || 'Not available'}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Smart Account</h3>
              <p className="text-sm text-slate-400">ERC-4337 Address</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Address</label>
            <code className="block text-xs font-mono text-slate-200 break-all mt-1">{smartAccountAddress || 'Loading...'}</code>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/create"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/50 border border-white/10 hover:border-indigo-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white">add</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Create Proof</h3>
              <p className="text-sm text-slate-400">Timestamp new content</p>
            </div>
          </Link>

          <Link
            to="/verify"
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/50 border border-white/10 hover:border-violet-500/30 transition-all group"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-white">verified</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Verify Proof</h3>
              <p className="text-sm text-slate-400">Check authenticity</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
