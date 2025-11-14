import { Block, ethers } from "ethers"
import { blockchainConfig } from "./config"
import { CONTRACT_ABI } from "./contract.abi"
import { v4 as uuidv4 } from "uuid";

export interface WorkRegistrationData {
  employeeCNP: string
  employerAddress: string
  position: string
  salary: string
  startDate: string
  endDate?: string
}

export interface BlockchainTransaction {
  hash: string
  blockNumber?: number
  timestamp?: number
}

export class BlockchainClient {
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet
  private contract: ethers.Contract

 constructor(privateKey: string) {
  this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
  this.wallet = new ethers.Wallet(privateKey, this.provider);
  this.contract = new ethers.Contract(blockchainConfig.contractAddress, CONTRACT_ABI, this.wallet);
}

  /**
   * Register work entry on blockchain
   */
  async registerWork(data: WorkRegistrationData): Promise<BlockchainTransaction> {
    try {
      console.log("[v0] Registering work on blockchain:", data)

      const uniqueId = uuidv4();
      const txHash = ethers.keccak256(ethers.toUtf8Bytes(uniqueId));

      const tx = await this.contract.registerWork(
        data.employeeCNP,
        data.position,
        ethers.parseUnits(data.salary, 0), // Convert salary to BigInt
        new Date(data.startDate).getTime(),
        data.endDate ? new Date(data.endDate).getTime() : 0,
        txHash
      )

      console.log("[v0] Transaction sent. Hash:", tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      console.log("[v0] Transaction confirmed. Block:", receipt.blockNumber)

      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("[v0] Failed to register work on blockchain:", error)
      throw new Error("Failed to register work on blockchain")
    }
  }

  /**
   * Authorize work registration on blockchain
   */
  async authorizeWorkRegistration(registrationHash: string, approved: boolean): Promise<BlockchainTransaction> {
    try {
      console.log("[v0] Authorizing registration:", { registrationHash, approved })

      // Call smart contract method
      const tx = await this.contract.authorizeWorkRegistration(registrationHash, approved)

      console.log("[v0] Authorization transaction sent. Hash:", tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      console.log("[v0] Authorization confirmed. Block:", receipt.blockNumber)

      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error("[v0] Failed to authorize registration on blockchain:", error)
      throw new Error("Failed to authorize registration on blockchain")
    }
  }

  /**
   * Get work history for employee from blockchain
   */
  async getEmployeeHistory(cnp: string): Promise<any[]> {
    try {
      console.log("[v0] Getting employee history from blockchain for CNP:", cnp)

      // Call smart contract view method
      const history = await this.contract.getEmployeeHistory(cnp)

      console.log("[v0] Retrieved history:", history)

      return history
    } catch (error) {
      console.error("[v0] Failed to get employee history from blockchain:", error)
      throw new Error("Failed to get employee history from blockchain")
    }
  }

  /**
   * Get transaction details from blockchain
   */
  async getTransaction(hash: string): Promise<any> {
    try {
      console.log("[v0] Getting transaction details for hash:", hash)

      const tx = await this.provider.getTransaction(hash)

      console.log("[v0] Transaction details:", tx)

      return tx
    } catch (error) {
      console.error("[v0] Failed to get transaction from blockchain:", error)
      throw new Error("Failed to get transaction from blockchain")
    }
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.address
  }
}

let employerClient: BlockchainClient
let authorityClient: BlockchainClient

export function getEmployerBlockchainClient(): BlockchainClient {
  if (!employerClient) {
    employerClient =  new BlockchainClient(process.env.EMPLOYER_PRIVATE_KEY || '');
  }
  return employerClient
}

export function getAuthorityClient(): BlockchainClient {
  if (!authorityClient) {
    authorityClient =  new BlockchainClient(process.env.AUTHORITY_PRIVATE_KEY || '');
  }
  return authorityClient
}