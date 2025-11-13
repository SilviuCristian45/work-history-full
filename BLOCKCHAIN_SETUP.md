# Blockchain Setup Guide

This application requires a blockchain RPC endpoint to store work registration data immutably.

## Required Environment Variables

Add these to your Vercel project environment variables:

1. **BLOCKCHAIN_RPC_URL**: Your Digital Ocean VPS blockchain RPC endpoint
   - Example: `http://your-vps-ip:8545`
   - This should point to your Ethereum-compatible blockchain node

2. **BLOCKCHAIN_WALLET_PRIVATE_KEY**: Private key for the backend wallet
   - This wallet will sign all blockchain transactions
   - Keep this secret and never expose it to the frontend
   - The wallet should have sufficient gas/tokens to execute transactions

3. **BLOCKCHAIN_CONTRACT_ADDRESS**: Your smart contract address (optional)
   - If you're using a smart contract for work registrations
   - Leave empty if storing data directly in transactions

4. **BLOCKCHAIN_CHAIN_ID**: Your blockchain network chain ID
   - Default: `1337` for local development
   - Update this for your specific blockchain network

## Backend Wallet Management

The backend uses a single wallet to interact with the blockchain on behalf of users. This approach:

- Simplifies the user experience (users don't need wallets)
- Allows the backend to manage gas fees
- Ensures all transactions are properly authorized

## Security Considerations

1. **Private Key Storage**: Store the wallet private key securely in Vercel environment variables
2. **Transaction Validation**: All transactions are validated before being sent to the blockchain
3. **Rate Limiting**: Consider implementing rate limiting for blockchain operations
4. **Wallet Funding**: Ensure the backend wallet always has sufficient balance

## Testing

For local development, you can use:
- Ganache: Local Ethereum blockchain
- Hardhat Network: Ethereum development environment
- Your own test blockchain on Digital Ocean

## Integration Points

The blockchain service integrates with the following endpoints:
- `POST /api/work-registrations/register` - Register new work entry
- `POST /api/work-registrations/authorize` - Authorize work registration
- `GET /api/work-registrations/history/:cnp` - Get employee history

## Transaction Flow

1. **Register Work**:
   - Employer submits work registration through UI
   - Backend creates blockchain transaction
   - Transaction hash is stored in Supabase with metadata
   - Status is set to "pending"

2. **Authorize Registration**:
   - Authority reviews registration
   - Authority approves/rejects
   - Backend creates authorization transaction
   - Status is updated to "approved" or "rejected"

3. **View History**:
   - Employee/Authority requests history
   - Backend queries blockchain and Supabase
   - Combined data is returned to frontend
