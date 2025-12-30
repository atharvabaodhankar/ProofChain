import React, { useState, useEffect } from 'react';

const BlockchainTimeline = ({ isActive, onComplete, currentBackendStep }) => {
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 1,
      title: "Computing Hash",
      description: "Generating SHA-256 cryptographic fingerprint",
      icon: "fingerprint"
    },
    {
      id: 2,
      title: "Preparing Transaction",
      description: "Creating blockchain transaction",
      icon: "description"
    },
    {
      id: 3,
      title: "Signing Transaction",
      description: "Cryptographically signing with secure wallet",
      icon: "key"
    },
    {
      id: 4,
      title: "Broadcasting to Network",
      description: "Sending to Ethereum Sepolia testnet",
      icon: "wifi"
    },
    {
      id: 5,
      title: "Waiting for Confirmation",
      description: "Miners validating and including in block",
      icon: "hourglass_empty"
    },
    {
      id: 6,
      title: "Block Confirmation",
      description: "Transaction confirmed and recorded",
      icon: "verified"
    },
    {
      id: 7,
      title: "Storing Metadata",
      description: "Saving proof details to database",
      icon: "storage"
    }
  ];

  useEffect(() => {
    if (!isActive) {
      setCompletedSteps([]);
      return;
    }

    // Update completed steps based on backend progress
    if (currentBackendStep > 0) {
      const newCompletedSteps = [];
      for (let i = 0; i < currentBackendStep - 1; i++) {
        newCompletedSteps.push(i);
      }
      setCompletedSteps(newCompletedSteps);
    }
  }, [isActive, currentBackendStep]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Simple purple gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-indigo-900/20"></div>
      
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Simple header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">link</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Creating Blockchain Proof</h2>
          <p className="text-sm text-slate-400">Your data is being permanently timestamped</p>
        </div>

        {/* Clean timeline */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentBackendStep === index + 1;

            return (
              <div key={step.id} className="relative flex items-center gap-4">
                {/* Timeline connector */}
                {index < steps.length - 1 && (
                  <div 
                    className={`absolute left-5 top-10 w-0.5 h-8 transition-colors duration-500 ${
                      isCompleted ? 'bg-green-500' : isCurrent ? 'bg-purple-500' : 'bg-slate-600'
                    }`}
                  />
                )}

                {/* Step icon */}
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">{step.icon}</span>
                  )}
                  
                  {/* Simple loading indicator for current step */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-purple-300/30 border-t-purple-300 animate-spin"></div>
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm transition-colors duration-500 ${
                    isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-xs transition-colors duration-500 ${
                    isCompleted ? 'text-green-300/70' : isCurrent ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {step.description}
                  </p>
                  
                  {/* Simple progress bar for current step */}
                  {isCurrent && (
                    <div className="mt-2 w-full bg-slate-700 rounded-full h-1">
                      <div className="h-1 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Simple footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-400">
            Ensuring permanent and immutable record
          </p>
        </div>
      </div>

      <style jsx>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: .5;
          }
        }
      `}</style>
    </div>
  );
};

export default BlockchainTimeline;

export default BlockchainTimeline;