import { useState } from 'react';
import toast from 'react-hot-toast';

export default function VerifyProof() {
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      // Hash the text locally
      const encoder = new TextEncoder();
      const data = encoder.encode(textContent);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hash = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // TODO: Query blockchain for this hash
      toast.info('Verification coming soon - blockchain query needed');
      setResult({ hash, verified: false });
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to verify proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-8 lg:mb-12 space-y-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
          Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Proof</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
          Check if your content has been timestamped on the blockchain
        </p>
      </div>

      {/* Main Form */}
      <div className="w-full max-w-4xl relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
          
          <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 lg:space-y-8">
            {/* Text Content */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-slate-300">Content to Verify</label>
              <textarea
                className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 sm:p-6 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[200px] sm:min-h-[300px] resize-none font-mono text-sm leading-relaxed shadow-inner"
                placeholder="Enter the text you want to verify..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>

            {/* Result */}
            {result && (
              <div className="bg-slate-950/50 rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Computed Hash</label>
                  <code className="block text-sm font-mono text-slate-200 break-all mt-2">{result.hash}</code>
                </div>
                <div className="text-center py-4">
                  <span className="text-amber-400">⚠️ Blockchain verification coming soon</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleVerify}
              disabled={loading || !textContent.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-4 px-6 rounded-xl font-semibold text-sm tracking-wide transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">verified</span>
                  <span>Verify Proof</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
