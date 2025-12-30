import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BlockchainTimeline = ({ isActive, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    {
      id: 1,
      title: "Computing Hash",
      description: "Generating SHA-256 cryptographic fingerprint of your data",
      icon: "fingerprint",
      duration: 1500,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: 2,
      title: "Preparing Transaction",
      description: "Creating blockchain transaction with your proof data",
      icon: "description",
      duration: 2000,
      color: "from-purple-500 to-violet-500"
    },
    {
      id: 3,
      title: "Signing Transaction",
      description: "Cryptographically signing with our secure wallet",
      icon: "key",
      duration: 1000,
      color: "from-indigo-500 to-blue-500"
    },
    {
      id: 4,
      title: "Broadcasting to Network",
      description: "Sending transaction to Ethereum Sepolia testnet",
      icon: "wifi",
      duration: 2500,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: 5,
      title: "Waiting for Confirmation",
      description: "Miners are validating and including in next block",
      icon: "hourglass_empty",
      duration: 3000,
      color: "from-orange-500 to-red-500"
    },
    {
      id: 6,
      title: "Block Confirmation",
      description: "Transaction confirmed and permanently recorded",
      icon: "verified",
      duration: 1500,
      color: "from-green-500 to-teal-500"
    },
    {
      id: 7,
      title: "Storing Metadata",
      description: "Saving proof details to our secure database",
      icon: "storage",
      duration: 1000,
      color: "from-violet-500 to-purple-500"
    }
  ];

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    let timeoutId;
    let stepIndex = 0;

    const processStep = () => {
      if (stepIndex < steps.length) {
        setCurrentStep(stepIndex);
        
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex]);
          stepIndex++;
          
          if (stepIndex < steps.length) {
            processStep();
          } else {
            // All steps completed
            setTimeout(() => {
              onComplete?.();
            }, 500);
          }
        }, steps[stepIndex].duration);
      }
    };

    processStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isActive, onComplete]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 rounded-full blur-sm"></div>
            <div className="relative w-full h-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-blue-400 text-2xl animate-pulse">link</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Creating Blockchain Proof</h2>
          <p className="text-slate-400 text-sm">Your data is being permanently timestamped on the blockchain</p>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(index);
            const isCurrent = currentStep === index;
            const isPending = index > currentStep;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex items-center gap-4 p-4 rounded-xl transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : isCurrent 
                    ? 'bg-white/5 border border-white/20 shadow-lg' 
                    : 'bg-slate-800/30 border border-slate-700/30'
                }`}
              >
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
                )}

                {/* Step Icon */}
                <div className={`relative w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : isCurrent 
                    ? `bg-gradient-to-r ${step.color} opacity-90 shadow-lg` 
                    : 'bg-slate-700/50 border border-slate-600'
                }`}>
                  {isCompleted ? (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="material-symbols-outlined text-green-400 text-xl"
                    >
                      check_circle
                    </motion.span>
                  ) : (
                    <span className={`material-symbols-outlined text-xl ${
                      isCurrent ? 'text-white animate-pulse' : 'text-slate-500'
                    }`}>
                      {step.icon}
                    </span>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-semibold transition-colors duration-500 ${
                      isCompleted 
                        ? 'text-green-400' 
                        : isCurrent 
                        ? 'text-white' 
                        : 'text-slate-400'
                    }`}>
                      {step.title}
                    </h3>
                    
                    {isCurrent && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                    )}
                  </div>
                  
                  <p className={`text-sm transition-colors duration-500 ${
                    isCompleted 
                      ? 'text-green-300/80' 
                      : isCurrent 
                      ? 'text-slate-300' 
                      : 'text-slate-500'
                  }`}>
                    {step.description}
                  </p>

                  {/* Progress Bar for Current Step */}
                  {isCurrent && (
                    <div className="mt-2 w-full bg-slate-700/50 rounded-full h-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: step.duration / 1000, ease: "linear" }}
                        className={`h-full bg-gradient-to-r ${step.color} rounded-full`}
                      />
                    </div>
                  )}
                </div>

                {/* Step Number */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isCurrent 
                    ? 'bg-white text-slate-900' 
                    : 'bg-slate-600 text-slate-400'
                }`}>
                  {step.id}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <span className="material-symbols-outlined text-blue-400 text-lg">info</span>
            <span>This process ensures your proof is permanently and immutably recorded</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BlockchainTimeline;