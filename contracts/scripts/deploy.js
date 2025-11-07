const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ProofOfExistence contract to Sepolia...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get account balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy the contract
  const ProofOfExistence = await ethers.getContractFactory("ProofOfExistence");
  const proofOfExistence = await ProofOfExistence.deploy();

  await proofOfExistence.waitForDeployment();
  const contractAddress = await proofOfExistence.getAddress();

  console.log("ProofOfExistence deployed to:", contractAddress);
  console.log("Transaction hash:", proofOfExistence.deploymentTransaction().hash);

  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: "sepolia",
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    transactionHash: proofOfExistence.deploymentTransaction().hash
  };

  console.log("\nDeployment Info:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Wait for a few confirmations before verification
  console.log("\nWaiting for confirmations...");
  await proofOfExistence.deploymentTransaction().wait(5);

  console.log("\nContract deployed successfully!");
  console.log("You can verify it with:");
  console.log(`npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });