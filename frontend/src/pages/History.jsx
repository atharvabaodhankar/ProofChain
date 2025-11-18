import React from 'react';
import { Clock, FileText, Shield, ExternalLink } from 'lucide-react';

const History = () => {
  return (
    <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
          Activity History
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
          Your Proof <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-violet-400">History</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          Track all your proof creation and verification activities in one place.
        </p>
      </div>

      {/* Coming Soon */}
      <div className="relative group max-w-4xl mx-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-12">
          <div className="text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 opacity-20 rounded-full blur-sm"></div>
              <div className="relative w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center shadow-lg">
                <Clock className="h-10 w-10 text-violet-400" />
              </div>
            </div>
            
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">History Coming Soon</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                We're building a comprehensive history dashboard where you'll be able to view all your proof creation and verification activities, 
                complete with timestamps, transaction details, and easy access to your blockchain records.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <FileText className="h-8 w-8 text-violet-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Proof Timeline</h3>
                <p className="text-slate-500 text-sm">Chronological view of all your proofs</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <Shield className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Verification Logs</h3>
                <p className="text-slate-500 text-sm">Track when others verify your proofs</p>
              </div>
              
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <ExternalLink className="h-8 w-8 text-pink-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Blockchain Links</h3>
                <p className="text-slate-500 text-sm">Direct links to transaction records</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default History;