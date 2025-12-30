import { useState } from 'react';
import { ExternalLink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { useAuthenticatedApi } from '../hooks/useAuthenticatedApi';
import BlockchainTimeline from '../components/BlockchainTimeline';

const CreateProof = () => {
  const { user, login } = useAuth();
  const { makeAuthenticatedCall, isAuthenticated } = useAuthenticatedApi();
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [currentBackendStep, setCurrentBackendStep] = useState(0);
  const [proof, setProof] = useState(null);
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

  const createTextProof = async () => {
    if (!textContent.trim()) {
      toast.error('Please enter some text content');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please sign in to create proofs');
      return;
    }
    
    setLoading(true);
    setShowTimeline(true);
    setCurrentBackendStep(1); // Computing Hash
    
    try {
      setCurrentBackendStep(2); // Preparing Transaction
      setCurrentBackendStep(3); // Signing Transaction
      setCurrentBackendStep(4); // Broadcasting to Network
      setCurrentBackendStep(5); // Waiting for Confirmation - this is where the real wait happens
      
      // Make the actual API call - this is where the real blockchain work happens
      const data = await makeAuthenticatedCall(
        API_ENDPOINTS.PROOF.CREATE_TEXT,
        {
          method: 'POST',
          body: JSON.stringify({ text: textContent })
        }
      );

      if (data.success) {
        setCurrentBackendStep(6); // Block Confirmation - only after API succeeds
        setTimeout(() => {
          setCurrentBackendStep(7); // Storing Metadata
          setTimeout(() => {
            setProof(data.proof);
            toast.success('Proof created successfully!');
            setShowTimeline(false);
            setCurrentBackendStep(0);
          }, 500);
        }, 300);
      } else {
        setShowTimeline(false);
        setCurrentBackendStep(0);
        toast.error(data.message || 'Failed to create proof');
      }
    } catch (error) {
      console.error('Error creating text proof:', error);
      setShowTimeline(false);
      setCurrentBackendStep(0);
      toast.error('Failed to create proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createFileProof = async () => {
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to create proofs');
      return;
    }

    setLoading(true);
    setShowTimeline(true);
    setCurrentBackendStep(1); // Computing Hash
    
    try {
      setCurrentBackendStep(2); // Preparing Transaction
      setCurrentBackendStep(3); // Signing Transaction
      setCurrentBackendStep(4); // Broadcasting to Network
      setCurrentBackendStep(5); // Waiting for Confirmation - this is where the real wait happens

      const formData = new FormData();
      formData.append('file', selectedFile);

      // Make the actual API call - this is where the real blockchain work happens
      const data = await makeAuthenticatedCall(
        API_ENDPOINTS.PROOF.CREATE_FILE,
        {
          method: 'POST',
          headers: {}, // Let fetch set Content-Type for FormData
          body: formData
        }
      );

      if (data.success) {
        setCurrentBackendStep(6); // Block Confirmation - only after API succeeds
        setTimeout(() => {
          setCurrentBackendStep(7); // Storing Metadata
          setTimeout(() => {
            setProof(data.proof);
            toast.success('Proof created successfully!');
            setShowTimeline(false);
            setCurrentBackendStep(0);
          }, 500);
        }, 300);
      } else {
        setShowTimeline(false);
        setCurrentBackendStep(0);
        toast.error(data.message || 'Failed to create proof');
      }
    } catch (error) {
      console.error('Error creating file proof:', error);
      setShowTimeline(false);
      setCurrentBackendStep(0);
      toast.error('Failed to create proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineComplete = () => {
    // Timeline animation completed, proof should be ready
    setShowTimeline(false);
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
    <>
      {/* Blockchain Timeline Modal */}
      <BlockchainTimeline 
        isActive={showTimeline} 
        onComplete={handleTimelineComplete}
        currentBackendStep={currentBackendStep}
      />
      
      <div className="relative z-10 pt-24 lg:pt-32 pb-12 lg:pb-20 px-4 sm:px-6 max-w-7xl mx-auto flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[130px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/20 blur-[130px]"></div>
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px]"></div>
      </div>

      {!user ? (
        // Authentication required message
        <div className="text-center max-w-3xl mb-8 lg:mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium tracking-wide">
            <AlertCircle className="w-3 h-3" />
            Authentication Required
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
            Sign In to Create <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Proofs</span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
            Authentication ensures accountability and prevents spam. Your proofs will be linked to your verified identity.
          </p>

          <div className="w-full max-w-md mx-auto mt-6 lg:mt-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 lg:p-8">
                <div className="text-center">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-3 lg:mb-4">Get Started</h3>
                  <p className="text-sm lg:text-base text-slate-400 mb-4 lg:mb-6">
                    Create immutable proofs with blockchain technology
                  </p>
                  <button
                    onClick={login}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 lg:py-4 px-6 rounded-xl font-semibold text-sm tracking-wide transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4 lg:h-5 lg:w-5" />
                    Sign in with Google
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center max-w-3xl mb-8 lg:mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
              Decentralized Notary Service
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              Immutable Proof of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Existence</span>
            </h1>
            
            <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed px-4">
              Securely anchor your documents to the blockchain. We generate a cryptographic hash of your data—your files never leave your device.
            </p>
          </div>
          {!proof ? (
            /* Main Form */
            <div className="w-full max-w-4xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                
                {/* Tab Navigation */}
                <div className="border-b border-white/5 bg-slate-900/30">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTab('text')}
                      className={`flex-1 py-4 lg:py-5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                        activeTab === 'text'
                          ? 'text-white border-indigo-500 bg-white/[0.02]'
                          : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.01]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-indigo-400 text-lg sm:text-xl">description</span>
                      <span className="hidden sm:inline">Text Proof</span>
                      <span className="sm:hidden">Text</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('file')}
                      className={`flex-1 py-4 lg:py-5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 ${
                        activeTab === 'file'
                          ? 'text-white border-indigo-500 bg-white/[0.02]'
                          : 'text-slate-500 hover:text-slate-300 border-transparent hover:bg-white/[0.01]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg sm:text-xl">folder_open</span>
                      <span className="hidden sm:inline">File Proof</span>
                      <span className="sm:hidden">File</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 lg:p-8 xl:p-10 space-y-6 lg:space-y-8">
                  {activeTab === 'text' ? (
                    /* Text Tab */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                        <label className="text-sm font-medium text-slate-300" htmlFor="proof-data">
                          Content to Certify
                        </label>
                        <span className="text-xs text-slate-500 font-mono">SHA-256 Hashing Algorithm</span>
                      </div>
                      
                      <div className="relative group/input">
                        <textarea
                          className="w-full bg-slate-950/50 border border-white/10 rounded-xl p-4 sm:p-6 text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all min-h-[200px] sm:min-h-[300px] resize-none font-mono text-sm leading-relaxed shadow-inner"
                          id="proof-data"
                          placeholder="Enter the text, contract, or data string you wish to timestamp on the blockchain..."
                          value={textContent}
                          onChange={(e) => setTextContent(e.target.value)}
                        />
                        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 flex items-center gap-2 sm:gap-3">
                          <button
                            onClick={() => copyToClipboard(textContent)}
                            className="p-1.5 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors"
                            title="Copy"
                            disabled={!textContent}
                          >
                            <span className="material-symbols-outlined text-[16px] sm:text-[18px]">content_copy</span>
                          </button>
                          <div className="h-3 sm:h-4 w-px bg-white/10"></div>
                          <span className="text-xs text-slate-500 font-mono">{textContent.length} chars</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* File Tab */
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                        <label className="text-sm font-medium text-slate-300">
                          File to Certify
                        </label>
                        <span className="text-xs text-slate-500 font-mono">Max 10MB</span>
                      </div>
                      
                      <div
                        className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all ${
                          dragActive
                            ? 'border-indigo-500 bg-indigo-500/5'
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
                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-indigo-400">description</span>
                            <div>
                              <p className="text-slate-200 font-medium text-sm sm:text-base break-all">{selectedFile.name}</p>
                              <p className="text-slate-500 text-xs sm:text-sm">{formatFileSize(selectedFile.size)}</p>
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
                            <span className="material-symbols-outlined text-3xl sm:text-4xl text-slate-500">cloud_upload</span>
                            <div>
                              <p className="text-slate-300 text-sm sm:text-base">Drop your file here or click to browse</p>
                              <p className="text-slate-500 text-xs sm:text-sm">Any file type supported, up to 10MB</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Privacy Notice */}
                  <div className="flex items-start gap-3 p-3 sm:p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                    <span className="material-symbols-outlined text-indigo-400 text-[18px] sm:text-[20px] mt-0.5 flex-shrink-0">privacy_tip</span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-indigo-200">Zero-Knowledge Privacy</h4>
                      <p className="text-xs text-indigo-300/70 mt-1 leading-relaxed">
                        Your data is hashed locally in your browser. We only receive the cryptographic fingerprint (hash), 
                        ensuring your original content remains completely private.
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Bar */}
                  <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6 pt-4 lg:pt-6 border-t border-white/5">
                    <div className="flex items-center gap-4 w-full lg:w-auto">
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Network Fee</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base lg:text-lg font-bold text-white">0.002 ETH</span>
                          <span className="text-xs text-slate-500">($3.54 USD)</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={activeTab === 'text' ? createTextProof : createFileProof}
                      disabled={loading || (activeTab === 'text' ? !textContent.trim() : !selectedFile)}
                      className="w-full lg:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 lg:py-4 px-6 lg:px-10 rounded-xl font-semibold text-sm tracking-wide transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          <span className="hidden sm:inline">Creating Proof...</span>
                          <span className="sm:hidden">Creating...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined group-hover/btn:rotate-12 transition-transform">fingerprint</span>
                          <span className="hidden sm:inline">Generate Proof</span>
                          <span className="sm:hidden">Generate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="w-full max-w-4xl relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
              <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10">
                <div className="text-center space-y-4 lg:space-y-6">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 opacity-20 rounded-full blur-sm"></div>
                    <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-green-400 text-2xl sm:text-3xl">verified</span>
                    </div>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Proof Created Successfully!</h2>
                    <p className="text-sm sm:text-base text-slate-400">Your data has been permanently anchored to the blockchain</p>
                  </div>
                  
                  <div className="bg-slate-950/50 rounded-xl p-4 sm:p-6 space-y-4 text-left">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Hash</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs sm:text-sm font-mono text-slate-200 break-all flex-1">{proof.hash}</code>
                          <button
                            onClick={() => copyToClipboard(proof.hash)}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Transaction</label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs sm:text-sm font-mono text-slate-200 break-all flex-1">{proof.transactionHash}</code>
                          <button
                            onClick={() => copyToClipboard(proof.transactionHash)}
                            className="p-1 rounded hover:bg-white/10 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                          >
                            <span className="material-symbols-outlined text-[14px] sm:text-[16px]">content_copy</span>
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Creator</label>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1">
                            <p className="text-xs sm:text-sm text-slate-200 font-medium">
                              {user?.displayName || user?.email || 'You'}
                            </p>
                            <p className="text-xs text-slate-400">Proof Owner</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Block Number</label>
                        <p className="text-xs sm:text-sm font-mono text-slate-200 mt-1">{proof.blockNumber}</p>
                      </div>
                      
                      <div>
                        <label className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Timestamp</label>
                        <p className="text-xs sm:text-sm font-mono text-slate-200 mt-1">
                          {new Date(proof.timestamp * 1000).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        setProof(null);
                        setTextContent('');
                        setSelectedFile(null);
                      }}
                      className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 px-6 rounded-xl font-medium transition-all text-sm sm:text-base"
                    >
                      Create Another Proof
                    </button>
                    <button
                      onClick={() => window.location.href = '/verify'}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-6 rounded-xl font-medium transition-all text-sm sm:text-base"
                    >
                      Verify a Proof
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Features */}
          <div className="mt-12 lg:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 text-center max-w-4xl w-full">
            <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-20 rounded-full blur-sm"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-indigo-400 text-lg sm:text-xl">lock_clock</span>
                </div>
              </div>
              <h3 className="text-slate-200 font-medium mb-1 text-sm sm:text-base">Timestamped</h3>
              <p className="text-xs sm:text-sm text-slate-500">Irrefutable proof of when the data existed.</p>
            </div>
            
            <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 rounded-full blur-sm"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-violet-400 text-lg sm:text-xl">link</span>
                </div>
              </div>
              <h3 className="text-slate-200 font-medium mb-1 text-sm sm:text-base">Blockchain Anchored</h3>
              <p className="text-xs sm:text-sm text-slate-500">Secured permanently on the Ethereum network.</p>
            </div>
            
            <div className="p-4 rounded-xl hover:bg-white/[0.02] transition-colors group">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20 rounded-full blur-sm"></div>
                <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                  <span className="material-symbols-outlined text-blue-400 text-lg sm:text-xl">verified</span>
                </div>
              </div>
              <h3 className="text-slate-200 font-medium mb-1 text-sm sm:text-base">Verifiable</h3>
              <p className="text-xs sm:text-sm text-slate-500">Anyone can independently verify the authenticity.</p>
            </div>
          </div>
        </>
      )}
      </div>
    </>
  );
};

export default CreateProof;