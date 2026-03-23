import { useParams, useLocation, Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProofDetail() {
  const { txHash } = useParams();
  const location = useLocation();
  const proof = location.state?.proof;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-8 lg:mb-12 space-y-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-3xl">verified</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
          Proof Created <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-400">Successfully</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
          Your data has been permanently anchored to the blockchain
        </p>
      </div>

      {/* Proof Details */}
      <div className="w-full max-w-4xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10">
          
          <div className="space-y-6">
            {/* Proof Information Grid */}
            <div className="bg-slate-950/50 rounded-xl p-6 space-y-6">
              {/* Creator Name */}
              {proof?.creatorName && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Creator</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-xl">person</span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-200">{proof.creatorName}</p>
                      <p className="text-xs text-slate-400">Proof Owner</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Hash */}
              {proof?.dataHash && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">SHA-256 Hash</label>
                  <div className="flex items-center gap-3">
                    <code className="flex-1 text-sm font-mono text-slate-200 break-all bg-slate-900/50 p-3 rounded-lg">{proof.dataHash}</code>
                    <button
                      onClick={() => copyToClipboard(proof.dataHash)}
                      className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                      title="Copy Hash"
                    >
                      <span className="material-symbols-outlined text-lg">content_copy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              {proof?.timestamp && (
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Timestamp</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-xl">schedule</span>
                    </div>
                    <div>
                      <p className="text-base font-medium text-slate-200">{formatDate(proof.timestamp)}</p>
                      <p className="text-xs text-slate-400">Blockchain Timestamp</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Hash */}
              <div>
                <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-2">Transaction Hash</label>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-sm font-mono text-slate-200 break-all bg-slate-900/50 p-3 rounded-lg">{txHash}</code>
                  <button
                    onClick={() => copyToClipboard(txHash)}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                    title="Copy Transaction Hash"
                  >
                    <span className="material-symbols-outlined text-lg">content_copy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Explorer Link */}
            <a
              href={`https://amoy.polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-4 px-6 rounded-xl font-semibold transition-all"
            >
              <span>View on Polygonscan</span>
              <ExternalLink className="w-5 h-5" />
            </a>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <Link
                to="/create"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-xl font-medium transition-all text-center"
              >
                Create Another Proof
              </Link>
              <Link
                to="/verify"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-xl font-medium transition-all text-center"
              >
                Verify a Proof
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl w-full">
        <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white">lock_clock</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Timestamped</h3>
          <p className="text-sm text-slate-500">Permanently recorded on-chain</p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white">account_balance_wallet</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Zero Cost</h3>
          <p className="text-sm text-slate-500">Gasless transaction via ERC-4337</p>
        </div>

        <div className="p-6 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-white/10 text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white">verified</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Immutable</h3>
          <p className="text-sm text-slate-500">Cannot be altered or deleted</p>
        </div>
      </div>
    </div>
  );
}
