const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deploying ProofOfExistence to Polygon Amoy");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deployer :", deployer.address);
  console.log("Balance  :", ethers.formatEther(balance), "POL");
  console.log("");

  // Deploy
  const ProofOfExistence = await ethers.getContractFactory("ProofOfExistence");
  console.log("Deploying contract...");
  const contract = await ProofOfExistence.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();

  console.log("");
  console.log("✅ Deployed successfully!");
  console.log("Contract address :", contractAddress);
  console.log("Transaction hash :", deployTx.hash);
  console.log("Explorer         :", `https://amoy.polygonscan.com/address/${contractAddress}`);
  console.log("");

  // Wait 5 blocks then verify
  console.log("Waiting for 5 confirmations before verification...");
  await deployTx.wait(5);
  console.log("5 confirmations reached.");
  console.log("");

  // Save deployment info to a JSON file
  const deploymentInfo = {
    contractAddress,
    deployer:        deployer.address,
    transactionHash: deployTx.hash,
    network:         "polygonAmoy",
    chainId:         80002,
    deployedAt:      new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "../deployment.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("Deployment info saved to contracts/deployment.json");
  console.log("");

  // Tell them exactly what to copy into .env
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Copy this into your .env file:");
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});