import React, { useState } from 'react';
import { FileText, Upload, Search, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const VerifyProof = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const verifyTextProof = async () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/proof/verify/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: textContent })
      });

      const data = await response.json();
      if (data.success) {
        setVerification(data);
        if (data.verified) {
          toast.success('Proof verified successfully!');
        } else {
          toast.error('No proof found for this content');
        }
      } else {
        toast.error(data.message || 'Failed to verify proof');
      }
    } catch (error) {
      console.error('Error verifying text proof:', error);
      toast.error('Failed to verify proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyFileProof = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/proof/verify/file', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setVerification(data);
        if (data.verified) {
          toast.success('Proof verified successfully!');
        } else {
          toast.error('No proof found for this file');
        }
      } else {
        toast.error(data.message || 'Failed to verify proof');
      }
    } catch (error) {
      console.error('Error verifying file proof:', error);
      toast.error('Failed to verify proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyByHash = async () => {
    if (!hashInput.trim()) {
      toast.error('Please enter a hash');
      return;
    }

    if (hashInput.length !== 64) {
      toast.error('Please enter a valid SHA-256 hash (64 characters)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/proof/hash/${hashInput}`);
      const data = await response.json();

      if (data.success) {
        setVerification({
          verified: data.exists,
          proof: data.proof,
          hash: hashInput
        });
        if (data.exists) {
          toast.success('Proof verified successfully!');
        } else {
          toast.error('No proof found for this hash');
        }
      } else {
        toast.error(data.message || 'Failed to verify proof');
      }
    } catch (error) {
      console.error('Error verifying hash:', error);
      toast.error('Failed to verify proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  return (
    <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center max-w-3xl mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Verification Service
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
          Verify Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-400">Existence</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Check if your data has been previously timestamped on the blockchain. Verification is free and available to everyone.
        </p>
      </div>

      {!verification ? (
        /* Main Form */
        <div className="w-full max-w-4xl relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
            
            {/* Tab Navigation */}
            <div className="border-b border-white/5 bg-slate-900/30">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('text')}
                  className={`flex-1 py-5 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'text'
                      ? 'text-white border-green-500 bg-white/[0.02]'
                      : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <span className="material-symbols-outlined text-green-400">description</span>
                  Verify Text
                </button>
                <button
                  onClick={() => setActiveTab('file')}
                  className={`flex-1 py-5 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'file'
                      ? 'text-white border-green-500 bg-white/[0.02]'
                      : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <span className="material-symbols-outlined">folder_open</span>
                  Verify File
                </button>
                <button
                  onClick={() => setActiveTab('hash')}
                  className={`flex-1 py-5 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'hash'
                      ? 'text-white border-green-500 bg-white/[0.02]'
                      : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.01]'
                  }`}
                >
                  <span className="material-symbols-outlined">tag</span>
                  Verify Hash
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 md:p-10 space-y-8">
              {activeTab === 'text' ? (
                /* Text Tab */
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-300" htmlFor="verify-text">
                      Text Content to Verify
                    </label>
                    <span className="text-xs text-slate-500 font-mono">Enter original content</span>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-6 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all min-h-[300px] resize-none font-mono text-sm leading-relaxed shadow-inner"
                      id="verify-text"
                      placeholder="Paste the original text content you want to verify..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">{textContent.length} characters</span>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'file' ? (
                /* File Tab */
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-300">
                      File to Verify
                    </label>
                    <span className="text-xs text-slate-500 font-mono">Max 10MB</span>
                  </div>
                  
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      dragActive
                        ? 'border-green-500 bg-green-500/5'
                        : 'border-white/20 hover:border-white/30'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="*/*"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-3">
                        <span className="material-symbols-outlined text-4xl text-green-400">description</span>
                        <div>
                          <p className="text-slate-200 font-medium">{selectedFile.name}</p>
                          <p className="text-slate-500 text-sm">{formatFileSize(selectedFile.size)}</p>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-xs text-slate-500 hover:text-slate-300 underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <span className="material-symbols-outlined text-4xl text-slate-500">cloud_upload</span>
                        <div>
                          <p className="text-slate-300">Drop your file here or click to browse</p>
                          <p className="text-slate-500 text-sm">Upload the original file to verify its proof</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Hash Tab */
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-sm font-medium text-slate-300" htmlFor="verify-hash">
                      SHA-256 Hash to Verify
                    </label>
                    <span className="text-xs text-slate-500 font-mono">64 characters</span>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-6 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all font-mono text-sm"
                      id="verify-hash"
                      placeholder="Enter the SHA-256 hash (e.g., a1b2c3d4e5f6...)"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      maxLength={64}
                    />
                    <div className="absolute bottom-4 right-4 flex items-center gap-3">
                      <span className="text-xs text-slate-500 font-mono">{hashInput.length}/64</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Verification</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-white">Free</span>
                      <span className="text-xs text-slate-500">Always</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={activeTab === 'text' ? verifyTextProof : activeTab === 'file' ? verifyFileProof : verifyByHash}
                  disabled={loading || (activeTab === 'text' ? !textContent.trim() : activeTab === 'file' ? !selectedFile : !hashInput.trim())}
                  className="w-full md:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 py-4 px-10 rounded-xl font-semibold text-sm tracking-wide transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                      Verifying...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined group-hover/btn:scale-110 transition-transform">verified</span>
                      Verify Proof
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Verification Result */
        <div className="w-full max-w-4xl relative group">
          <div className={`absolute -inset-1 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000 ${
            verification.verified 
              ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500'
          }`}></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 md:p-10">
            <div className="text-center space-y-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                verification.verified ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                {verification.verified ? (
                  <CheckCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400" />
                )}
              </div>
              
              <div>
                <h2 className={`text-3xl font-bold mb-2 ${
                  verification.verified ? 'text-green-400' : 'text-red-400'
                }`}>
                  {verification.verified ? 'Proof Verified!' : 'No Proof Found'}
                </h2>
                <p className="text-slate-400">
                  {verification.verified 
                    ? 'This data has been timestamped on the blockchain'
                    : 'No proof of existence found for this data'
                  }
                </p>
              </div>

              {verification.verified && verification.proof && (
                <div className="bg-slate-950/50 rounded-xl p-6 space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hash</label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-sm font-mono text-slate-200 break-all">{verification.proof.hash || verification.hash}</code>
                        <button
                          onClick={() => copyToClipboard(verification.proof.hash || verification.hash)}
                          className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">content_copy</span>
                        </button>
                      </div>
                    </div>
                    
                    {verification.proof.transactionHash && (
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-sm font-mono text-slate-200 break-all">{verification.proof.transactionHash}</code>
                          <button
                            onClick={() => copyToClipboard(verification.proof.transactionHash)}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {verification.proof.blockNumber && (
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Block Number</label>
                        <p className="text-sm font-mono text-slate-200 mt-1">{verification.proof.blockNumber}</p>
                      </div>
                    )}
                    
                    {verification.proof.timestamp && (
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Timestamp</label>
                        <p className="text-sm font-mono text-slate-200 mt-1">
                          {new Date(verification.proof.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={() => {
                    setVerification(null);
                    setTextContent('');
                    setSelectedFile(null);
                    setHashInput('');
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-xl font-medium transition-all"
                >
                  Verify Another
                </button>
                <button
                  onClick={() => window.location.href = '/create'}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-6 rounded-xl font-medium transition-all"
                >
                  Create a Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center max-w-4xl w-full">
        <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
          <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-green-400">verified</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Instant Verification</h3>
          <p className="text-sm text-slate-500">Get results immediately from the blockchain.</p>
        </div>
        
        <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
          <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-blue-400">public</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Public Verification</h3>
          <p className="text-sm text-slate-500">Anyone can verify proofs without an account.</p>
        </div>
        
        <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
          <div className="w-12 h-12 mx-auto bg-slate-900 rounded-full flex items-center justify-center border border-white/5 mb-4 shadow-lg group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-violet-400">security</span>
          </div>
          <h3 className="text-slate-200 font-medium mb-1">Cryptographically Secure</h3>
          <p className="text-sm text-slate-500">Backed by blockchain immutability.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyProof;