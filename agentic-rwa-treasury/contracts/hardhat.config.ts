import "dotenv/config";
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 500 },
          evmVersion: "cancun",
        },
      },
      production: {
        version: "0.8.24",
        settings: {
          optimizer: { enabled: true, runs: 1_000 },
          evmVersion: "cancun",
          viaIR: true,
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    localhost: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
    },
    xlayerTestnet: {
      type: "http",
      chainType: "generic",
      url: process.env.XLAYER_TESTNET_RPC_URL ?? "https://testrpc.xlayer.tech/terigon",
      accounts: deployerPrivateKey ? [deployerPrivateKey] : [],
    },
  },
});
