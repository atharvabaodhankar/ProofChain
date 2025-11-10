import React, { useState } from 'react';
import { FileText, Upload, Hash, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const CreateProof = () => {
  const { getAuthHeaders } = useAuth();
  const [activeTab, setActiveTab] = useState('text');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState(null);

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
        toast.success('Proof created successfully!');
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
        toast.success('Proof created successfully!');
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
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Create Proof of Existence
        </h1>
        <p className="text-lg text-gray-600">
          Generate an immutable proof that your data existed at this moment in time
        </p>
      </div>

      {!proof ? (
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
          </div>

          {/* Text Tab */}
          {activeTab === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your text content
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Enter the text you want to prove existed..."
                className="input h-32 resize-none"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Maximum 1MB of text content
              </p>
              <button
                onClick={createTextProof}
                disabled={loading || !textContent.trim()}
                className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Hash className="h-4 w-4" />
                    <span>Create Proof</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* File Tab */}
          {activeTab === 'file' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a file
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
                  Maximum file size: 10MB
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
                onClick={createFileProof}
                disabled={loading || !selectedFile}
                className="btn btn-primary w-full mt-4 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Hash className="h-4 w-4" />
                    <span>Create Proof</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Proof Result */
        <div className="card max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Hash className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Proof Created Successfully!
            </h2>
            <p className="text-gray-600">
              Your data has been timestamped on the blockchain
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Hash (SHA-256)
              </label>
              <div className="hash-display flex items-center justify-between">
                <span className="flex-1">{proof.hash}</span>
                <button
                  onClick={() => copyToClipboard(proof.hash)}
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
                  <span className="flex-1 truncate">{proof.transactionHash}</span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${proof.transactionHash}`}
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
                  {proof.blockNumber}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Timestamp</span>
              </label>
              <div className="hash-display">
                {formatTimestamp(proof.timestamp)}
              </div>
            </div>

            {proof.fileName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Details
                </label>
                <div className="bg-gray-50 p-3 rounded border">
                  <p><strong>Name:</strong> {proof.fileName}</p>
                  <p><strong>Type:</strong> {proof.fileType}</p>
                  <p><strong>Size:</strong> {(proof.fileSize / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Important:</strong> Save this information! You'll need the original content 
              and this proof data to verify the existence later.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setProof(null);
                  setTextContent('');
                  setSelectedFile(null);
                }}
                className="btn btn-outline flex-1"
              >
                Create Another Proof
              </button>
              <button
                onClick={() => window.location.href = '/verify'}
                className="btn btn-primary flex-1"
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