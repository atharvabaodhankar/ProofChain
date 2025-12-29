import { useState } from 'react';
import { API_ENDPOINTS, apiCall } from '../config/api';

const CorsTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCors = async () => {
    setLoading(true);
    try {
      const result = await apiCall(API_ENDPOINTS.TEST.CORS);
      setTestResult({ success: true, data: result });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-slate-800/90 backdrop-blur-sm border border-slate-700 rounded-lg p-4 max-w-sm">
        <h3 className="text-white font-medium mb-2">CORS Test</h3>
        
        <button
          onClick={testCors}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          {loading ? 'Testing...' : 'Test CORS'}
        </button>
        
        {testResult && (
          <div className={`mt-2 p-2 rounded text-xs ${
            testResult.success 
              ? 'bg-green-900/50 text-green-300 border border-green-700' 
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}>
            {testResult.success ? (
              <div>
                <div className="font-medium">✅ CORS Working!</div>
                <div className="text-xs opacity-75 mt-1">
                  Origin: {testResult.data.origin || 'none'}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">❌ CORS Failed</div>
                <div className="text-xs opacity-75 mt-1">
                  {testResult.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorsTest;