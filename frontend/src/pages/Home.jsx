import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, FileText, CheckCircle, Clock, Lock, Zap, Sparkles, ArrowRight, Star, Globe, Users } from 'lucide-react';

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

  const steps = [
    {
      icon: FileText,
      title: "Upload Your Data",
      description: "Upload any file or enter text. We compute a unique cryptographic hash of your content.",
      delay: "0s"
    },
    {
      icon: Shield,
      title: "Blockchain Timestamp",
      description: "Your hash is recorded on the Ethereum blockchain with an immutable timestamp.",
      delay: "0.2s"
    },
    {
      icon: CheckCircle,
      title: "Get Your Proof",
      description: "Receive a cryptographic proof that your data existed at that specific time.",
      delay: "0.4s"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative inline-block mb-8">
              <Shield className="h-24 w-24 text-primary-400 mx-auto mb-6 floating-element" />
              <div className="absolute inset-0 h-24 w-24 bg-primary-400/20 rounded-full blur-2xl mx-auto animate-pulse-slow"></div>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="gradient-text">Proof</span>
              <br />
              <span className="text-white text-shadow">of Existence</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Prove that your data existed at a specific point in time using 
              <span className="gradient-text font-semibold"> blockchain technology</span>. 
              No wallets, no crypto knowledge required – just simple, secure proof.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link 
                to="/create" 
                className="btn btn-primary text-xl px-10 py-4 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                  <span>Create Proof</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                to="/verify" 
                className="btn btn-glass text-xl px-10 py-4 group"
              >
                <span className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <span>Verify Proof</span>
                </span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { icon: Users, label: "Active Users", value: "10K+", color: "text-blue-400" },
                { icon: Shield, label: "Proofs Created", value: "50K+", color: "text-purple-400" },
                { icon: Globe, label: "Countries", value: "120+", color: "text-green-400" }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className="card-glass text-center hover-lift"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-3`} />
                  <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-gray-300 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold gradient-text mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Simple steps to create immutable proof of your data's existence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="text-center group animate-slide-up"
                style={{ animationDelay: step.delay }}
              >
                <div className="relative mb-8">
                  <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-6 w-24 h-24 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 glow-effect">
                    <step.icon className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-primary-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-accent-500 to-orange-500 text-white text-sm font-bold w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:gradient-text transition-all duration-300">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-32 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold gradient-text mb-6">
              Why Choose ProofChain?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built with cutting-edge technology for maximum security and ease of use
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="card group hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative mb-6">
                  <div className={`bg-gradient-to-r ${feature.color} rounded-xl p-4 w-16 h-16 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:gradient-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-secondary-600/20 to-accent-600/20 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="card-glass">
            <Star className="h-16 w-16 text-yellow-400 mx-auto mb-6 animate-pulse" />
            
            <h2 className="text-4xl md:text-6xl font-bold gradient-text mb-6">
              Ready to Create Your First Proof?
            </h2>
            
            <p className="text-xl text-gray-300 mb-10 leading-relaxed">
              Join thousands of users who trust our platform for their proof of existence needs.
              <br />
              <span className="text-primary-400 font-semibold">Start securing your digital legacy today.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                to="/create" 
                className="btn btn-primary text-xl px-12 py-4 group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Sparkles className="h-6 w-6 group-hover:animate-spin" />
                  <span>Get Started Now</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link 
                to="/verify" 
                className="btn btn-glass text-xl px-12 py-4"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;