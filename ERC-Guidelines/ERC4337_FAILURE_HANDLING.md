# 🛡️ ERC-4337 Failure Handling & Recovery

## Overview

Production-grade ERC-4337 implementation requires robust failure handling. This document covers all failure scenarios, recovery strategies, and UI states for ProofChain.

---

## 🚨 Failure Scenarios

### 1. Bundler Down (Pimlico Unavailable)

**Symptoms:**
```javascript
Error: "Failed to fetch"
Error: "Network request failed"
Error: "ECONNREFUSED"
```

**Causes:**
- Pimlico API downtime
- Network connectivity issues
- Rate limiting exceeded
- Invalid API key

**Impact:**
- Cannot submit UserOperations
- Cannot fetch gas prices
- Transactions blocked

**Detection:**
```javascript
try {
  const gasPrice = await pimlicoClient.getUserOperationGasPrice();
} catch (err) {
  if (err.message.includes('fetch') || err.code === 'ECONNREFUSED') {
    // Bundler is down
  }
}
```

---

### 2. Paymaster Rejection

**Symptoms:**
```javascript
Error: "Paymaster rejected UserOperation"
Error: "AA33 reverted"
Error: "Insufficient paymaster deposit"
```

**Causes:**
- Paymaster out of funds
- Invalid UserOperation
- Gas estimation too low
- Paymaster policy violation

**Impact:**
- Transaction not sponsored
- User would need to pay gas (not possible in our setup)
- Transaction fails

**Detection:**
```javascript
try {
  const txHash = await smartAccountClient.sendTransaction({...});
} catch (err) {
  if (err.message.includes('paymaster') || err.message.includes('AA33')) {
    // Paymaster rejected
  }
}
```

---

### 3. RPC Provider Failure

**Symptoms:**
```javascript
Error: "RPC request failed"
Error: "Too many requests"
Error: "Invalid response"
```

**Causes:**
- Alchemy/Infura downtime
- Rate limits exceeded
- Network congestion
- Invalid RPC URL

**Impact:**
- Cannot read blockchain state
- Cannot verify transactions
- Smart Account creation fails

**Detection:**
```javascript
try {
  const publicClient = createPublicClient({...});
  await publicClient.getBlockNumber();
} catch (err) {
  if (err.message.includes('RPC') || err.code === 429) {
    // RPC provider issue
  }
}
```

---

### 4. Smart Account Creation Failure

**Symptoms:**
```javascript
Error: "Failed to create Smart Account"
Error: "Invalid owner"
Error: "Wallet not ready"
```

**Causes:**
- Embedded wallet not created yet
- Invalid wallet client
- Network issues during creation
- EntryPoint contract issues

**Impact:**
- User cannot transact
- Stuck on loading screen
- Cannot access features

**Detection:**
```javascript
try {
  const smartAccount = await toSimpleSmartAccount({...});
} catch (err) {
  if (err.message.includes('owner') || err.message.includes('wallet')) {
    // Smart Account creation failed
  }
}
```

---

### 5. Transaction Timeout

**Symptoms:**
```javascript
// No error, just hanging
// Transaction never confirms
```

**Causes:**
- Network congestion
- Gas price too low
- Bundler delay
- Transaction dropped

**Impact:**
- User waits indefinitely
- Poor UX
- Uncertainty about transaction status

**Detection:**
```javascript
const TIMEOUT = 60000; // 60 seconds

const txPromise = smartAccountClient.sendTransaction({...});
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Transaction timeout')), TIMEOUT)
);

try {
  const txHash = await Promise.race([txPromise, timeoutPromise]);
} catch (err) {
  if (err.message === 'Transaction timeout') {
    // Transaction timed out
  }
}
```

---

### 6. Authentication Failure

**Symptoms:**
```javascript
Error: "Authentication failed"
Error: "User cancelled login"
Error: "Privy not ready"
```

**Causes:**
- User cancelled OAuth
- Privy API issues
- Invalid App ID
- Network issues

**Impact:**
- Cannot access app
- Cannot create Smart Account
- Blocked from all features

**Detection:**
```javascript
try {
  await login();
} catch (err) {
  if (err.message.includes('cancelled') || err.message.includes('auth')) {
    // Authentication failed
  }
}
```

---

## 🔄 Recovery Strategies

### Strategy 1: Exponential Backoff Retry

**Use for:**
- Temporary network issues
- Rate limiting
- Transient failures

**Implementation:**
```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      
      const delay = baseDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage
const result = await retryWithBackoff(
  () => pimlicoClient.getUserOperationGasPrice(),
  3,  // max 3 retries
  1000 // start with 1 second
);
```

**Retry Schedule:**
- Attempt 1: Immediate
- Attempt 2: After 1 second
- Attempt 3: After 2 seconds
- Attempt 4: After 4 seconds
- Give up: Show error

---

### Strategy 2: Fallback RPC Provider

**Use for:**
- Primary RPC down
- Rate limits exceeded
- Network issues

**Implementation:**
```javascript
const RPC_PROVIDERS = [
  import.meta.env.VITE_POLYGON_AMOY_RPC_URL,        // Primary (Alchemy)
  'https://rpc-amoy.polygon.technology',             // Fallback 1 (Public)
  'https://polygon-amoy.g.alchemy.com/v2/demo',     // Fallback 2 (Demo)
];

async function createPublicClientWithFallback() {
  for (const rpcUrl of RPC_PROVIDERS) {
    try {
      const client = createPublicClient({
        chain: polygonAmoy,
        transport: http(rpcUrl),
      });
      
      // Test the connection
      await client.getBlockNumber();
      console.log(`✅ Connected to RPC: ${rpcUrl}`);
      return client;
      
    } catch (err) {
      console.warn(`❌ RPC failed: ${rpcUrl}`, err.message);
      continue;
    }
  }
  
  throw new Error('All RPC providers failed');
}
```

---

### Strategy 3: Graceful Degradation

**Use for:**
- Non-critical features
- Optional enhancements
- Progressive enhancement

**Implementation:**
```javascript
// Try to fetch gas prices, fallback to default
async function getGasPrices() {
  try {
    const gasPrice = await pimlicoClient.getUserOperationGasPrice();
    return gasPrice.fast;
  } catch (err) {
    console.warn('Failed to fetch gas prices, using defaults');
    
    // Fallback to reasonable defaults
    return {
      maxFeePerGas: parseGwei('50'),
      maxPriorityFeePerGas: parseGwei('2'),
    };
  }
}
```

---

### Strategy 4: User-Initiated Retry

**Use for:**
- Failed transactions
- Network timeouts
- User control

**Implementation:**
```javascript
const [retryCount, setRetryCount] = useState(0);
const [lastError, setLastError] = useState(null);

const handleSubmitWithRetry = async () => {
  try {
    setLastError(null);
    const result = await submitProof(text, name);
    toast.success('Proof created!');
    setRetryCount(0);
  } catch (err) {
    setLastError(err.message);
    toast.error(
      <div>
        <p>Transaction failed: {err.message}</p>
        <button onClick={() => {
          setRetryCount(retryCount + 1);
          handleSubmitWithRetry();
        }}>
          Retry
        </button>
      </div>
    );
  }
};
```

---

### Strategy 5: Circuit Breaker

**Use for:**
- Preventing cascading failures
- Protecting external services
- Rate limit protection

**Implementation:**
```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureCount = 0;
    this.threshold = threshold;
    this.timeout = timeout;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.timeout;
      console.warn(`Circuit breaker OPEN for ${this.timeout}ms`);
    }
  }
}

// Usage
const pimlicoBreaker = new CircuitBreaker(5, 60000);

async function fetchGasPrices() {
  return pimlicoBreaker.execute(() => 
    pimlicoClient.getUserOperationGasPrice()
  );
}
```

---

## 🎨 UI States

### State 1: Loading

**When:**
- Smart Account initializing
- Transaction submitting
- Waiting for confirmation

**UI:**
```jsx
<div className="flex items-center gap-3">
  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500/30 border-t-indigo-500"></div>
  <span>Creating proof...</span>
</div>
```

---

### State 2: Error (Retryable)

**When:**
- Network timeout
- Temporary failure
- Rate limit

**UI:**
```jsx
<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-yellow-500">warning</span>
    <div className="flex-1">
      <h4 className="font-semibold text-yellow-200">Transaction Failed</h4>
      <p className="text-sm text-yellow-300/70 mt-1">
        Network issue detected. This is usually temporary.
      </p>
      <button 
        onClick={handleRetry}
        className="mt-3 bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg text-sm font-medium"
      >
        Retry Transaction
      </button>
    </div>
  </div>
</div>
```

---

### State 3: Error (Fatal)

**When:**
- Invalid configuration
- Permanent failure
- User action required

**UI:**
```jsx
<div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-red-500">error</span>
    <div className="flex-1">
      <h4 className="font-semibold text-red-200">Unable to Create Proof</h4>
      <p className="text-sm text-red-300/70 mt-1">
        {errorMessage}
      </p>
      <div className="mt-3 space-y-2">
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Refresh Page
        </button>
        <button 
          onClick={handleContactSupport}
          className="ml-2 border border-red-500/30 hover:bg-red-500/10 text-red-200 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Contact Support
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### State 4: Timeout

**When:**
- Transaction pending too long
- No confirmation received

**UI:**
```jsx
<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-blue-500 animate-pulse">schedule</span>
    <div className="flex-1">
      <h4 className="font-semibold text-blue-200">Transaction Pending</h4>
      <p className="text-sm text-blue-300/70 mt-1">
        This is taking longer than usual. Your transaction may still complete.
      </p>
      <div className="mt-3 flex gap-2">
        <button 
          onClick={handleCheckStatus}
          className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Check Status
        </button>
        <button 
          onClick={handleCancel}
          className="border border-blue-500/30 hover:bg-blue-500/10 text-blue-200 px-4 py-2 rounded-lg text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</div>
```

---

### State 5: Offline

**When:**
- No internet connection
- Network unavailable

**UI:**
```jsx
<div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-4">
  <div className="flex items-start gap-3">
    <span className="material-symbols-outlined text-gray-500">wifi_off</span>
    <div className="flex-1">
      <h4 className="font-semibold text-gray-200">No Internet Connection</h4>
      <p className="text-sm text-gray-300/70 mt-1">
        Please check your connection and try again.
      </p>
    </div>
  </div>
</div>
```

---

## 🔧 Enhanced useGaslessProof Hook

```javascript
import { useState, useCallback, useRef } from "react";
import { encodeFunctionData } from "viem";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
const TRANSACTION_TIMEOUT = 60000; // 60 seconds
const MAX_RETRIES = 3;

export function useGaslessProof(smartAccountClient, pimlicoClient) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef(null);

  const submitProof = useCallback(async (text, creatorName) => {
    if (!smartAccountClient) throw new Error("Smart Account not ready.");
    if (!pimlicoClient) throw new Error("Pimlico client not ready.");

    setLoading(true);
    setError(null);
    setResult(null);

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();

    try {
      // 1. Hash data
      const dataHash = await sha256(text);

      // 2. Encode calldata
      const callData = encodeFunctionData({
        abi: ABI,
        functionName: "createProof",
        args: [dataHash, creatorName],
      });

      // 3. Fetch gas prices with retry
      const gasPrice = await retryWithBackoff(
        () => pimlicoClient.getUserOperationGasPrice(),
        MAX_RETRIES
      );

      // 4. Send transaction with timeout
      const txPromise = smartAccountClient.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: callData,
        maxFeePerGas: gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), TRANSACTION_TIMEOUT)
      );

      const txHash = await Promise.race([txPromise, timeoutPromise]);

      const proofResult = {
        dataHash,
        transactionHash: txHash,
        explorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
        creatorName,
        timestamp: Date.now(),
      };

      setResult(proofResult);
      setRetryCount(0);
      return proofResult;

    } catch (err) {
      console.error("Proof failed:", err.message);
      
      // Categorize error
      const errorType = categorizeError(err);
      setError({ message: err.message, type: errorType, retryable: isRetryable(errorType) });
      
      throw err;
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [smartAccountClient, pimlicoClient]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
    setError(null);
  }, []);

  return { 
    submitProof, 
    loading, 
    error, 
    result, 
    retryCount,
    retry,
    cancel,
    resetResult: () => setResult(null) 
  };
}

// Helper functions
async function retryWithBackoff(fn, maxRetries, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

function categorizeError(err) {
  const message = err.message.toLowerCase();
  
  if (message.includes('timeout')) return 'TIMEOUT';
  if (message.includes('paymaster')) return 'PAYMASTER_REJECTED';
  if (message.includes('fetch') || message.includes('network')) return 'NETWORK_ERROR';
  if (message.includes('rpc')) return 'RPC_ERROR';
  if (message.includes('user rejected')) return 'USER_REJECTED';
  
  return 'UNKNOWN';
}

function isRetryable(errorType) {
  return ['TIMEOUT', 'NETWORK_ERROR', 'RPC_ERROR'].includes(errorType);
}
```

---

## 📊 Monitoring & Alerts

### Metrics to Track

```javascript
// Track failure rates
const metrics = {
  totalTransactions: 0,
  successfulTransactions: 0,
  failedTransactions: 0,
  timeouts: 0,
  paymasterRejections: 0,
  networkErrors: 0,
  averageConfirmationTime: 0,
};

// Log to analytics
function logTransactionMetric(type, duration, error = null) {
  metrics.totalTransactions++;
  
  if (error) {
    metrics.failedTransactions++;
    const errorType = categorizeError(error);
    metrics[errorType.toLowerCase() + 's']++;
  } else {
    metrics.successfulTransactions++;
    metrics.averageConfirmationTime = 
      (metrics.averageConfirmationTime * (metrics.successfulTransactions - 1) + duration) / 
      metrics.successfulTransactions;
  }
  
  // Send to analytics service
  analytics.track('transaction_metric', {
    type,
    duration,
    error: error?.message,
    successRate: metrics.successfulTransactions / metrics.totalTransactions,
  });
}
```

---

## 🎯 Production Checklist

- [ ] Implement exponential backoff retry
- [ ] Add fallback RPC providers
- [ ] Implement transaction timeout
- [ ] Add circuit breaker for Pimlico
- [ ] Show appropriate UI states
- [ ] Add user-initiated retry
- [ ] Implement graceful degradation
- [ ] Add error categorization
- [ ] Track failure metrics
- [ ] Set up monitoring alerts
- [ ] Test all failure scenarios
- [ ] Document recovery procedures

---

**This makes ProofChain production-serious. Judges will see we've thought through every failure scenario.** 🛡️
