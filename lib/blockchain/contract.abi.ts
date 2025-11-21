// Smart Contract ABI
// Replace this with your actual smart contract ABI from your deployed contract
export const CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: "string",
        name: "employeeCNP",
        type: "string",
      },
      {
        internalType: "string",
        name: "employerAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "position",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "salary",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "startDate",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endDate",
        type: "uint256",
      },
    ],
    name: "registerWork",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "registrationHash",
        type: "string",
      },
      {
        internalType: "bool",
        name: "approved",
        type: "bool",
      },
    ],
    name: "authorizeWorkRegistration",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "cnp",
        type: "string",
      },
    ],
    name: "getEmployeeHistory",
    outputs: [
      {
        internalType: "string[]",
        name: "",
        type: "string[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const
