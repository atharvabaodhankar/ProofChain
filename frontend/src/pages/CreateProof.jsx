import React, { useState } from 'react';
import { FileText, Upload, Hash, Clock, ExternalLink, Sparkles, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const CreateProof = () => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
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
      toast.error('Please enter some text');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/proof/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ text: textContent })
      });

      const data = await response.json();

      if (data.success) {
        setProof(data.proof);
        toast.success('🎉 Proof created successfully!');
      } else {
        toast.error(data.message || 'Failed to create proof');
      }
    } catch (error) {
      console.error('Error creating text proof:', error);
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

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/proof/file', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProof(data.proof);
        toast.success('🎉 Proof created successfully!');
      } else {
        toast.error(data.message || 'Failed to create proof');
      }
    } catch (error) {
      console.error('Error creating file proof:', error);
      toast.error('Failed to create proof. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('📋 Copied to clipboard!');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12 animate-slide-down">
        <div className="relative inline-block mb-6">
          <Hash className="h-16 w-16 text-primary-400 mx-auto floating-element" />
          <div className="absolute inset-0 h-16 w-16 bg-primary-400/20 rounded-full blur-xl mx-auto animate-pulse-slow"></div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
          Create Proof of Existence
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Generate an immutable proof that your data existed at this moment in time
        </p>
      </div>

      {!proof ? (
        <div className="card-glass max-w-4xl mx-auto animate-scale-in">
          {/* Tab Navigation */}
          <div className="flex border-b border-white/20 mb-8">
            {[
              { id: 'text', icon: FileText, label: 'Text Content' },
              { id: 'file', icon: Upload, label: 'File Upload' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-6 py-4 font-semibold text-lg border-b-2 transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400 bg-primary-500/10'
                    : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div className="animate-fade-in">
              <label className="block text-lg font-semibold text-white mb-4">
                Enter your text content
              </label>
              <div className="relative">
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter the text you want to prove existed..."
                  className="input h-40 resize-none text-lg"
                  disabled={loading}
                />
                <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                  {textContent.length} characters
                </div>
              </div>
              <p className="text-gray-400 mt-3 flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" />
                <span>Maximum 1MB of text content</span>
              </p>
              
              <button
                onClick={createTextProof}
                disabled={loading || !textContent.trim()}
                className="btn btn-primary w-full mt-8 text-lg py-4 group relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                    <span>Creating Proof...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                    <span>Create Proof</span>
                    <Hash className="h-5 w-5" />
                  </span>
                )}
              </button>
            </div>
          )}

          {/* File Tab */}
          {activeTab === 'file' && (
            <div className="animate-fade-in">
              <label className="block text-lg font-semibold text-white mb-4">
                Select or drop a file
              </label>
              
              <div 
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                  dragActive 
                    ? 'border-primary-400 bg-primary-500/10 scale-105' 
                    : 'border-white/30 hover:border-primary-400/50 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="relative">
                  <Upload className={`h-16 w-16 mx-auto mb-6 transition-all duration-300 ${
                    dragActive ? 'text-primary-400 scale-110' : 'text-gray-400'
                  }`} />
                  <div className="absolute inset-0 h-16 w-16 bg-primary-400/20 rounded-full blur-xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary-400 hover:text-primary-300 font-semibold text-lg transition-colors"
                >
                  Choose a file or drag & drop
                </label>
                
                <p className="text-gray-400 mt-3 flex items-center justify-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Maximum file size: 10MB</span>
                </p>
              </div>
              
              {selectedFile && (
                <div className="mt-6 p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20 animate-slide-up">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-3">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-lg">
                        {selectedFile.name}
                      </p>
                      <p className="text-gray-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              )}

              <button
                onClick={createFileProof}
                disabled={loading || !selectedFile}
                className="btn btn-primary w-full mt-8 text-lg py-4 group relative overflow-hidden"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
                    <span>Creating Proof...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center space-x-3">
                    <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                    <span>Create Proof</span>
                    <Hash className="h-5 w-5" />
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Proof Result */
        <div className="card-glass max-w-5xl mx-auto animate-scale-in">
          <div className="text-center mb-10">
            <div className="relative inline-block mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-6 w-20 h-20 mx-auto glow-effect">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-2xl animate-pulse-slow"></div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold gradient-text mb-4">
              Proof Created Successfully!
            </h2>
            <p className="text-xl text-gray-300">
              Your data has been timestamped on the blockchain
            </p>
          </div>

          <div className="space-y-8">
            <div className="gradient-border">
              <div className="gradient-border-content p-6">
                <label className="block text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-primary-400" />
                  <span>Content Hash (SHA-256)</span>
                </label>
                <div className="hash-display flex items-center justify-between group">
                  <span className="flex-1 text-primary-300">{proof.hash}</span>
                  <button
                    onClick={() => copyToClipboard(proof.hash)}
                    className="ml-4 p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/20 rounded-lg transition-all duration-300"
                  >
                    <Copy className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="gradient-border">
                <div className="gradient-border-content p-6">
                  <label className="block text-lg font-semibold text-white mb-3">
                    Transaction Hash
                  </label>
                  <div className="hash-display flex items-center justify-between">
                    <span className="flex-1 truncate text-secondary-300">{proof.transactionHash}</span>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(proof.transactionHash)}
                        className="p-2 text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/20 rounded-lg transition-all duration-300"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <a
                        href={`https://sepolia.etherscan.io/tx/${proof.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-secondary-400 hover:text-secondary-300 hover:bg-secondary-500/20 rounded-lg transition-all duration-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="gradient-border">
                <div className="gradient-border-content p-6">
                  <label className="block text-lg font-semibold text-white mb-3">
                    Block Number
                  </label>
                  <div className="hash-display text-accent-300 text-xl font-mono">
                    #{proof.blockNumber}
                  </div>
                </div>
              </div>
            </div>

            <div className="gradient-border">
              <div className="gradient-border-content p-6">
                <label className="block text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-accent-400" />
                  <span>Timestamp</span>
                </label>
                <div className="hash-display text-accent-300 text-xl">
                  {formatTimestamp(proof.timestamp)}
                </div>
              </div>
            </div>

            {proof.fileName && (
              <div className="gradient-border">
                <div className="gradient-border-content p-6">
                  <label className="block text-lg font-semibold text-white mb-3">
                    File Details
                  </label>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="grid md:grid-cols-3 gap-4 text-gray-300">
                      <div>
                        <span className="text-gray-400">Name:</span>
                        <p className="font-semibold text-white">{proof.fileName}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <p className="font-semibold text-white">{proof.fileType}</p>
                      </div>
                      <div>
                        <span className="text-gray-400">Size:</span>
                        <p className="font-semibold text-white">{(proof.fileSize / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 font-semibold mb-2">Important:</p>
                  <p className="text-yellow-100">
                    Save this information! You'll need the original content and this proof data to verify the existence later.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setProof(null);
                  setTextContent('');
                  setSelectedFile(null);
                }}
                className="btn btn-glass flex-1 text-lg py-3"
              >
                Create Another Proof
              </button>
              <button
                onClick={() => window.location.href = '/verify'}
                className="btn btn-primary flex-1 text-lg py-3"
              >
                Verify a Proof
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProof;