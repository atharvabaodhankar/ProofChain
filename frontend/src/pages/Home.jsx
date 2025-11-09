import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Clock, Lock, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Shield className="h-16 w-16 text-primary-600 mx-auto mb-6" />
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Proof of Existence
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Prove that your data existed at a specific point in time using blockchain technology. 
              No wallets, no crypto knowledge required – just simple, secure proof.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/create" className="btn btn-primary text-lg px-8 py-3">
                Create Proof
              </Link>
              <Link to="/verify" className="btn btn-outline text-lg px-8 py-3">
                Verify Proof
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to create immutable proof of your data's existence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Upload Your Data
              </h3>
              <p className="text-gray-600">
                Upload any file or enter text. We compute a unique cryptographic hash of your content.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. Blockchain Timestamp
              </h3>
              <p className="text-gray-600">
                Your hash is recorded on the Ethereum blockchain with an immutable timestamp.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Get Your Proof
              </h3>
              <p className="text-gray-600">
                Receive a cryptographic proof that your data existed at that specific time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our Solution?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card">
              <Lock className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Privacy First
              </h3>
              <p className="text-gray-600">
                Only cryptographic hashes are stored. Your original data never leaves your device.
              </p>
            </div>

            <div className="card">
              <Zap className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Gas Fees
              </h3>
              <p className="text-gray-600">
                We handle all blockchain transactions. No need for wallets or cryptocurrency.
              </p>
            </div>

            <div className="card">
              <Clock className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Immutable Timestamps
              </h3>
              <p className="text-gray-600">
                Blockchain-backed proof that cannot be altered or backdated.
              </p>
            </div>

            <div className="card">
              <Shield className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cryptographically Secure
              </h3>
              <p className="text-gray-600">
                Uses SHA-256 hashing and Ethereum's security guarantees.
              </p>
            </div>

            <div className="card">
              <CheckCircle className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Verification
              </h3>
              <p className="text-gray-600">
                Anyone can verify your proof using the original data and our verification tool.
              </p>
            </div>

            <div className="card">
              <FileText className="h-8 w-8 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Any File Type
              </h3>
              <p className="text-gray-600">
                Support for documents, images, code, or any digital content.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your First Proof?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users who trust our platform for their proof of existence needs.
          </p>
          <Link to="/create" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Get Started Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;