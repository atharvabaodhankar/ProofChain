import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartAccount } from '../hooks/useSmartAccount';
import { useGaslessProof } from '../hooks/useGaslessProof';
import toast from 'react-hot-toast';

export default function CreateProof() {
  const navigate = useNavigate();
  const { user, authenticated, smartAccountAddress, nexusClient, pimlicoClient } = useSmartAccount();
  const { submitProof, loading, error } = useGaslessProof(nexusClient, pimlicoClient);
  
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [creatorName, setCreatorName] = useState(user?.google?.name || user?.email?.address?.split('@')[0] || '');

  const handleSubmit = async () => {
    if (!textContent.trim() || !creatorName.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const result = await submitProof(textContent.trim(), creatorName.trim());
      toast.success('Proof created successfully!');
      // Pass the full proof data via state
      navigate(`/proof/${result.transactionHash}`, { 
        state: { 
          proof: {
            dataHash: result.dataHash,
            transactionHash: result.transactionHash,
            creatorName: creatorName.trim(),
            timestamp: result.timestamp,
            explorerUrl: result.explorerUrl
          }
        } 
      });
    } catch (err) {
      toast.error(error || 'Failed to create proof');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-slate-400">Please sign in to create proofs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-8 lg:mb-12 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Immutable Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Existence</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
          Securely anchor your documents to the blockchain with gasless transactions
        </p>
      </div>

      {/* Main Form */}
      <div className="w-full max-w-4xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          
          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 lg:space-y-8">
            {/* Creator Name */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Creator Name</label>
              <input
                type="text"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Text Content */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Content to Certify</label>
              <textarea
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 sm:p-6 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[200px] sm:min-h-[300px] resize-none font-mono text-sm leading-relaxed shadow-inner"
                placeholder="Enter the text you wish to timestamp on the blockchain..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
              <span className="material-symbols-outlined text-indigo-400 text-[18px] sm:text-[20px] mt-0.5 flex-shrink-0">privacy_tip</span>
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-indigo-200">Zero-Knowledge Privacy</h4>
                <p className="text-xs text-indigo-300/70 mt-1 leading-relaxed">
                  Your data is hashed locally. Only the cryptographic hash is stored on-chain.
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 pt-4 lg:pt-6 border-t border-white/5">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Network Fee</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base lg:text-lg font-bold text-emerald-400">FREE</span>
                    <span className="text-xs text-slate-500">(Gasless)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !textContent.trim() || !creatorName.trim()}
                className="w-full lg:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 lg:py-4 px-6 lg:px-10 rounded-xl font-semibold text-sm tracking-wide transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    <span>Creating Proof...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined">fingerprint</span>
                    <span>Generate Proof</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
