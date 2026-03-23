import { useState, useCallback } from "react";
import { encodeFunctionData }    from "viem";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const ABI = [
  {
    name:   "createProof",
    type:   "function",
    inputs: [
      { name: "_dataHash",    type: "bytes32" },
      { name: "_creatorName", type: "string"  },
    ],
  },
];

async function sha256(text) {
  const encoded    = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray  = Array.from(new Uint8Array(hashBuffer));
  return "0x" + hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function useGaslessProof(smartAccountClient) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);

  const submitProof = useCallback(async (text, creatorName) => {
    if (!smartAccountClient) throw new Error("Smart Account not ready.");
    if (!text)               throw new Error("Text is required.");
    if (!creatorName)        throw new Error("Creator name is required.");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Hash in browser — never leaves the device
      const dataHash = await sha256(text);
      console.log("SHA-256 hash:", dataHash);

      // 2. Encode contract calldata
      const callData = encodeFunctionData({
        abi:          ABI,
        functionName: "createProof",
        args:         [dataHash, creatorName],
      });

      // 3. Send UserOperation
      //    permissionless handles: build UserOp → sign → send to bundler
      //    Pimlico paymaster sponsors gas automatically on testnet
      console.log("Sending UserOperation...");

      const txHash = await smartAccountClient.sendTransaction({
        to:   CONTRACT_ADDRESS,
        data: callData,
      });

      console.log("✅ Confirmed on chain:", txHash);

      const proofResult = {
        dataHash,
        transactionHash: txHash,
        explorerUrl:     `https://amoy.polygonscan.com/tx/${txHash}`,
        creatorName,
        timestamp:       Date.now(),
      };

      setResult(proofResult);
      return proofResult;

    } catch (err) {
      console.error("Proof failed:", err.message);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [smartAccountClient]);

  return { submitProof, loading, error, result };
}