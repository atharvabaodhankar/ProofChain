import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateProof from './pages/CreateProof';
import VerifyProof from './pages/VerifyProof';
import Dashboard from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-500/30 border-t-primary-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary-400/20"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-primary-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 cyber-grid">
      <Navbar />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateProof />} />
          <Route path="/verify" element={<VerifyProof />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
}

export default App;