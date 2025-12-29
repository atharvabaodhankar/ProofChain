import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import CorsTest from './components/CorsTest';
import Home from './pages/Home';
import CreateProof from './pages/CreateProof';
import VerifyProof from './pages/VerifyProof';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500/30 border-t-indigo-500"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-indigo-400/20"></div>
          <div className="absolute inset-2 animate-pulse rounded-full bg-indigo-500/20 blur-sm"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-900/20 blur-[130px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-900/20 blur-[130px]"></div>
        <div className="absolute top-[30%] left-[50%] -translate-x-1/2 w-[40%] h-[40%] rounded-full bg-blue-900/10 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-[0.03] mix-blend-overlay"></div>
      </div>
      
      <Navbar />
      
      <main className="relative z-10 min-h-screen overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <Home />
              </PageTransition>
            } />
            <Route path="/create" element={
              <PageTransition>
                <CreateProof />
              </PageTransition>
            } />
            <Route path="/verify" element={
              <PageTransition>
                <VerifyProof />
              </PageTransition>
            } />
            <Route path="/dashboard" element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            } />
            <Route path="/history" element={
              <PageTransition>
                <History />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </main>
      
      {/* CORS Test Component (Development Only) */}
      {import.meta.env.DEV && <CorsTest />}
    </div>
  );
}

export default App;