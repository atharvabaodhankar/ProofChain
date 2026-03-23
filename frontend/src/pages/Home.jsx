import { Link } from 'react-router-dom';
import { useSmartAccount } from '../hooks/useSmartAccount';

export default function Home() {
  const { login, authenticated } = useSmartAccount();

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-6xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Powered by ERC-4337 Account Abstraction
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white">
            Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Existence</span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            Timestamp your documents on the blockchain with zero gas fees. Immutable, verifiable, and permanent.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {authenticated ? (
            <>
              <Link
                to="/create"
                className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-4 px-8 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all"
              >
                Create Proof
              </Link>
              <Link
                to="/verify"
                className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 px-8 rounded-xl font-semibold text-lg transition-all"
              >
                Verify Proof
              </Link>
            </>
          ) : (
            <button
              onClick={login}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-4 px-8 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all"
            >
              Get Started
            </button>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">lock_clock</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Timestamped</h3>
            <p className="text-slate-400">Irrefutable proof of when your data existed on the blockchain</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-violet-500/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">account_balance_wallet</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Gasless</h3>
            <p className="text-slate-400">Zero transaction fees with ERC-4337 sponsored transactions</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 transition-all">
            <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">verified</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Verifiable</h3>
            <p className="text-slate-400">Anyone can independently verify the authenticity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
