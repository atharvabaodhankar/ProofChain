const hre = require("hardhat");

async function main() {
  const provider = hre.ethers.provider;
  const signers = await hre.ethers.getSigners();
  const deployer = signers[0];
  const balance = await provider.getBalance(deployer.address);
  const network = await provider.getNetwork();

  console.log("Wallet  :", deployer.address);
  console.log("Balance :", hre.ethers.formatEther(balance), "POL");
  console.log("ChainId :", network.chainId.toString());
}

main().catch(function(e) {
  console.error(e);
  process.exit(1);
});