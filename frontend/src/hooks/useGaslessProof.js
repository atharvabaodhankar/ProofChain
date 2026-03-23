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

export function useGaslessProof(smartAccountClient, pimlicoClient) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [result,  setResult]  = useState(null);

  const submitProof = useCallback(async (text, creatorName) => {
    if (!smartAccountClient) throw new Error("Smart Account not ready.");
    if (!pimlicoClient)      throw new Error("Pimlico client not ready.");
    if (!text)               throw new Error("Text is required.");
    if (!creatorName)        throw new Error("Creator name is required.");

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // 1. Hash in browser
      const dataHash = await sha256(text);
      console.log("SHA-256 hash:", dataHash);

      // 2. Encode calldata
      const callData = encodeFunctionData({
        abi:          ABI,
        functionName: "createProof",
        args:         [dataHash, creatorName],
      });

      // 3. Fetch current gas prices from Pimlico
      //    This is what was missing — paymaster needs these to build the UserOp
      console.log("Fetching gas prices from Pimlico...");
      const gasPrice = await pimlicoClient.getUserOperationGasPrice();
      console.log("Gas price (fast):", gasPrice.fast);

      // 4. Send UserOperation with gas prices included
      //    Pimlico paymaster sponsors this on testnet — user pays 0 POL
      console.log("Sending UserOperation...");
      const txHash = await smartAccountClient.sendTransaction({
        to:                  CONTRACT_ADDRESS,
        data:                callData,
        maxFeePerGas:        gasPrice.fast.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.fast.maxPriorityFeePerGas,
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
  }, [smartAccountClient, pimlicoClient]);

  return { submitProof, loading, error, result };
}