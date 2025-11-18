import React, { useEffect, useState } from 'react';
import { Shield, FileText, CheckCircle, Clock, Lock, Zap, Sparkles, ArrowRight, Star, Globe, Users } from 'lucide-react';
import AnimatedLink from '../components/AnimatedLink';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Lock,
      title: "Privacy First",
      description: "Only cryptographic hashes are stored. Your original data never leaves your device.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "No Gas Fees",
      description: "We handle all blockchain transactions. No need for wallets or cryptocurrency.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Clock,
      title: "Immutable Timestamps",
      description: "Blockchain-backed proof that cannot be altered or backdated.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Cryptographically Secure",
      description: "Uses SHA-256 hashing and Ethereum's security guarantees.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CheckCircle,
      title: "Easy Verification",
      description: "Anyone can verify your proof using the original data and our verification tool.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: FileText,
      title: "Any File Type",
      description: "Support for documents, images, code, or any digital content.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto mb-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium tracking-wide mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
          Decentralized Notary Service
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
          Prove Your Data <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400">Existed</span>
        </h1>
        
        <p className="text-xl text-slate-400 max-w-3xl mx-auto font-light leading-relaxed mb-8">
          Create immutable, timestamped proofs of your documents, contracts, and digital assets using blockchain technology. 
          Your data stays private while the proof lives forever.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <AnimatedLink
            to="/create"
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-4 px-8 rounded-xl font-semibold text-lg tracking-wide transform active:scale-[0.98] transition-all flex items-center gap-2 group"
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform">fingerprint</span>
            Create Proof
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </AnimatedLink>
          
          <AnimatedLink
            to="/verify"
            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 py-4 px-8 rounded-xl font-semibold text-lg transition-all flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Verify Proof
          </AnimatedLink>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group p-6 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-2"
          >
            <div className="relative w-12 h-12 rounded-xl mb-4 group-hover:scale-110 transition-transform">
              {/* Glass morphism background with subtle gradient */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-20 rounded-xl blur-sm`}></div>
              <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex items-center justify-center shadow-lg">
                <feature.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="text-center mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6">
            <div className="text-4xl font-bold text-white mb-2">10,000+</div>
            <div className="text-slate-400">Proofs Created</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-white mb-2">99.9%</div>
            <div className="text-slate-400">Uptime</div>
          </div>
          <div className="p-6">
            <div className="text-4xl font-bold text-white mb-2">24/7</div>
            <div className="text-slate-400">Verification</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
          <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-slate-400 mb-6">
              Join thousands of users who trust ProofChain to secure their digital assets.
            </p>
            <AnimatedLink
              to="/create"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 py-3 px-8 rounded-xl font-semibold transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              Create Your First Proof
            </AnimatedLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;