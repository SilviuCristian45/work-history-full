import { Block, ethers } from "ethers"
import { blockchainConfig } from "./config"
import { CONTRACT_ABI } from "./contract.abi"
import { v4 as uuidv4 } from "uuid";

export interface WorkRegistrationData {
  employeeCNP: string
  position: string
  salary: string
  startDate: string
  endDate?: string
  employer: string
}

export interface BlockchainTransaction {
  hash: string
  blockNumber?: number
  timestamp?: number
}

export class BlockchainClient {
  private provider: ethers.JsonRpcProvider
  private wallet: ethers.Wallet | undefined = undefined
  private contract: ethers.Contract

 constructor(privateKey: string | undefined) {
  this.provider = new ethers.JsonRpcProvider(blockchainConfig.rpcUrl);
  if (privateKey)
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
        Math.floor(new Date(data.startDate).getTime() / 1000),
        data.endDate ? Math.floor(new Date(data.endDate).getTime() / 1000) : 0,
        txHash,
        data.employer,
        { gasLimit: 2_000_000 } // ajustează după nevoie
      )

      console.log("[v0] Transaction sent. Hash:", tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      const event = receipt.logs.map( (it: any) => it)
      console.log(event)
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
  async authorizeWorkRegistration(employeeCNP: string, index: number, approved: boolean, authority: string): Promise<BlockchainTransaction> {
    try {
      console.log("[v0] Authorizing registration:", { employeeCNP, index, approved, authority })


      // Call smart contract method
      const tx = await this.contract.authorizeWork(employeeCNP, index, approved, authority)

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

      const readOnlyContract = new ethers.Contract(
        blockchainConfig.contractAddress,
        CONTRACT_ABI,
        this.provider
      );

      const history = await readOnlyContract.getWorkHistory(cnp);


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
    return this.wallet?.address || ''
  }
}

let employerClient: BlockchainClient
let authorityClient: BlockchainClient
let employeeClient: BlockchainClient

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

export function getEmployeeClient(): BlockchainClient {
  if (!employeeClient) {
      employeeClient = new BlockchainClient(undefined)
  }
  return employeeClient;
}