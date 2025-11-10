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
          success: true,
          verified: data.exists,
          proof: data.proof,
          hash: data.hash
        });
        
        if (data.exists) {
          toast.success('Proof found!');
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

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Verify Proof of Existence
        </h1>
        <p className="text-lg text-gray-600">
          Check if your data has been previously timestamped on the blockchain
        </p>
      </div>

      {!verification ? (
        <div className="card max-w-2xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('text')}
              className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'text'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setActiveTab('file')}
              className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'file'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>File</span>
            </button>
            <button
              onClick={() => setActiveTab('hash')}
              className={`flex items-center space-x-2 px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'hash'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Hash</span>
            </button>
          </div>

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter the original text content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter the exact text you want to verify..."
                className="input h-32 resize-none"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                The text must match exactly what was originally submitted
              </p>
              <button
                onClick={verifyTextProof}
                disabled={loading || !textContent.trim()}
                className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Verify Proof</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* File Tab */}
          {activeTab === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select the original file
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary-600 hover:text-primary-700 font-medium"
                >
                  Choose a file
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  The file must be identical to the original
                </p>
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <p className="text-sm font-medium text-gray-900">
                    Selected: {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}

              <button
                onClick={verifyFileProof}
                disabled={loading || !selectedFile}
                className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Verify Proof</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Hash Tab */}
          {activeTab === 'hash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter SHA-256 hash
              </label>
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                placeholder="Enter the 64-character SHA-256 hash..."
                className="input font-mono"
                disabled={loading}
                maxLength={64}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter the exact hash from your proof certificate
              </p>
              <button
                onClick={verifyByHash}
                disabled={loading || !hashInput.trim() || hashInput.length !== 64}
                className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Verify Hash</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Verification Result */
        <div className="card max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className={`rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center ${
              verification.verified 
                ? 'bg-green-100' 
                : 'bg-red-100'
            }`}>
              {verification.verified ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {verification.verified ? 'Proof Verified!' : 'No Proof Found'}
            </h2>
            <p className="text-gray-600">
              {verification.verified 
                ? 'This content was previously timestamped on the blockchain'
                : 'No proof exists for this content on the blockchain'
              }
            </p>
          </div>

          {verification.verified && verification.proof && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Hash (SHA-256)
                </label>
                <div className="hash-display flex items-center justify-between">
                  <span className="flex-1">{verification.proof.hash}</span>
                  <button
                    onClick={() => copyToClipboard(verification.proof.hash)}
                    className="ml-2 text-primary-600 hover:text-primary-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Hash
                  </label>
                  <div className="hash-display flex items-center justify-between">
                    <span className="flex-1 truncate">{verification.proof.transactionHash}</span>
                    <a
                      href={`https://sepolia.etherscan.io/tx/${verification.proof.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Block Number
                  </label>
                  <div className="hash-display">
                    {verification.proof.blockNumber}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Timestamp</span>
                </label>
                <div className="hash-display">
                  {formatTimestamp(verification.proof.timestamp)}
                </div>
              </div>

              {verification.proof.creator && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Created By
                  </label>
                  <div className="hash-display">
                    {verification.proof.creator}
                  </div>
                </div>
              )}

              {verification.proof.fileName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File Details
                  </label>
                  <div className="bg-gray-50 p-3 rounded border">
                    <p><strong>Name:</strong> {verification.proof.fileName}</p>
                    <p><strong>Type:</strong> {verification.proof.fileType}</p>
                    <p><strong>Size:</strong> {(verification.proof.fileSize / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {!verification.verified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Hash:</strong> {verification.hash || 'N/A'}
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                This content has not been previously timestamped. You can create a proof for it now.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setVerification(null);
                  setTextContent('');
                  setSelectedFile(null);
                  setHashInput('');
                }}
                className="btn btn-outline flex-1"
              >
                Verify Another
              </button>
              {!verification.verified && (
                <button
                  onClick={() => window.location.href = '/create'}
                  className="btn btn-primary flex-1"
                >
                  Create Proof
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyProof;