// contracts/hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../.env" });

const REQUIRED_ENV = ["PRIVATE_KEY", "POLYGON_AMOY_RPC_URL"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing env var: ${key}`);
  }
});

const PRIVATE_KEY = process.env.PRIVATE_KEY.startsWith("0x")
  ? process.env.PRIVATE_KEY
  : "0x" + process.env.PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  networks: {
    hardhat: {
      chainId: 31337,
    },
    amoy: {
      url: process.env.POLYGON_AMOY_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 80002,
      gasPrice: "auto",
    },
  },

  etherscan: {
    apiKey: {
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL:     "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com",
        },
      },
    ],
  },
};