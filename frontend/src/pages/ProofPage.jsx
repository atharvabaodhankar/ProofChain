import { useState, useEffect }  from "react";
import { useSmartAccount }      from "../hooks/useSmartAccount";
import { useGaslessProof }      from "../hooks/useGaslessProof";

export default function ProofPage() {
  const {
    login,
    logout,
    authenticated,
    user,
    initSmartAccount,
    smartAccountAddress,
    nexusClient,
    pimlicoClient,
    loading:   accountLoading,
    error:     accountError,
    isReady,
  } = useSmartAccount();

  const {
    submitProof,
    loading: proofLoading,
    error:   proofError,
    result,
    resetResult,
  } = useGaslessProof(nexusClient, pimlicoClient);

  const [text,        setText]        = useState("");
  const [creatorName, setCreatorName] = useState("");

  // Wait for authenticated before initializing smart account
  useEffect(() => {
    if (authenticated) {
      initSmartAccount();
    }
  }, [authenticated, initSmartAccount]);

  // Pre-fill creator name from Privy user
  useEffect(() => {
    if (user?.google?.name) {
      setCreatorName(user.google.name);
    } else if (user?.email?.address) {
      setCreatorName(user.email.address.split("@")[0]);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!text.trim() || !creatorName.trim()) return;
    try {
      await submitProof(text.trim(), creatorName.trim());
    } catch {
      // error already in hook state
    }
  };

  // ── NOT LOGGED IN ─────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">
              Proof of Existence
            </h1>
            <p className="text-slate-400 text-lg">
              Timestamp any text permanently on Polygon blockchain.
              No wallet. No gas. Just sign in.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-left">
            <p className="text-slate-300 text-sm font-medium">How it works</p>
            <div className="space-y-3">
              {[
                ["1", "Sign in with Google or email"],
                ["2", "Smart Account created automatically — no MetaMask"],
                ["3", "Submit any text — hashed and stored on-chain"],
                ["4", "Gas paid by us — you pay nothing, ever"],
              ].map(([num, label]) => (
                <div key={num} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                    {num}
                  </span>
                  <span className="text-slate-400 text-sm">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={login}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Sign in with Google or Email
          </button>

          <p className="text-slate-600 text-xs">
            ERC-4337 Account Abstraction · Polygon Amoy · Biconomy + Privy + Pimlico
          </p>
        </div>
      </div>
    );
  }

  // ── LOGGED IN — SMART ACCOUNT INITIALISING ────────────────────
  if (authenticated && !isReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">
            {accountLoading
              ? "Setting up your Smart Account..."
              : "Connecting..."}
          </p>
          {accountError && (
            <div className="max-w-sm bg-red-950/50 border border-red-800 rounded-xl p-4">
              <p className="text-red-400 text-sm">{accountError}</p>
              <button
                onClick={initSmartAccount}
                className="mt-2 text-red-300 text-xs underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MAIN APP ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            Proof of Existence
          </h1>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Smart Account info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">
              Smart Account Active
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-slate-600 text-xs mb-1">Signed in as</p>
              <p className="text-slate-300 text-sm">
                {user?.google?.email || user?.email?.address || "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-slate-600 text-xs mb-1">Smart Account address</p>
              <p className="text-slate-300 text-xs font-mono break-all">
                {smartAccountAddress}
              </p>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-800">
            <p className="text-slate-600 text-xs">
              Same Google login on any device = same address.
              Gas is sponsored — your balance: 0 POL needed.
            </p>
          </div>
        </div>

        {/* Proof form */}
        {!result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-white font-semibold">Create a Proof</h2>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm">Creator name</label>
              <input
                type="text"
                value={creatorName}
                onChange={e => setCreatorName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 text-sm">Content to timestamp</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter any text — a document, a claim, an idea..."
                rows={5}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500 transition-colors text-sm resize-none"
              />
              <p className="text-slate-600 text-xs">
                A SHA-256 hash of this text is stored on Polygon Amoy.
                Original text never leaves your browser.
              </p>
            </div>

            {proofError && (
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-3">
                <p className="text-red-400 text-sm">{proofError}</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={proofLoading || !text.trim() || !creatorName.trim()}
              className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-semibold rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
            >
              {proofLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting UserOperation...</span>
                </>
              ) : (
                "Submit Proof — 0 Gas"
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-emerald-950/40 border border-emerald-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <h2 className="text-emerald-400 font-semibold text-lg">
                Proof confirmed on-chain
              </h2>
            </div>

            <div className="space-y-3">
              {[
                ["Creator",          result.creatorName],
                ["SHA-256 Hash",     result.dataHash],
                ["Transaction Hash", result.transactionHash],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-slate-500 text-xs mb-1">{label}</p>
                  <p className="text-slate-300 text-xs font-mono break-all">{value}</p>
                </div>
              ))}
            </div>

            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-3 bg-emerald-800/50 hover:bg-emerald-800 border border-emerald-700 text-emerald-300 text-sm font-medium rounded-xl text-center transition-colors"
            >
              View on Polygonscan →
            </a>

            <button
              onClick={() => { setText(""); setCreatorName(""); resetResult(); }}
              className="w-full py-3 text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Create another proof
            </button>
          </div>
        )}

      </div>
    </div>
  );
}