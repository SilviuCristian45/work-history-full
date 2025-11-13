// Blockchain configuration
export const blockchainConfig = {
  rpcUrl: process.env.BLOCKCHAIN_RPC_URL || "http://your-digitalocean-vps:8545",
  walletPrivateKey: process.env.BLOCKCHAIN_WALLET_PRIVATE_KEY || "",
  contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || "",
}

// Validate configuration
export function validateBlockchainConfig() {
  if (!blockchainConfig.walletPrivateKey) {
    throw new Error("BLOCKCHAIN_WALLET_PRIVATE_KEY environment variable is required")
  }

  if (!blockchainConfig.rpcUrl) {
    throw new Error("BLOCKCHAIN_RPC_URL environment variable is required")
  }

  if (!blockchainConfig.contractAddress) {
    throw new Error("BLOCKCHAIN_CONTRACT_ADDRESS environment variable is required")
  }
}
