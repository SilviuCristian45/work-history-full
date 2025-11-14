// Smart Contract ABI
// Replace this with your actual smart contract ABI from your deployed contract
export const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_employerWallet",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_authorityWallet",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "employeeCNP",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum WorkHistoryRegistry.WorkStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "WorkAuthorized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "employeeCNP",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        }
      ],
      "name": "WorkRegistered",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "authorityWallet",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "employeeCNP",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "index",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "approve",
          "type": "bool"
        }
      ],
      "name": "authorizeWork",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "employeeWorkEntries",
      "outputs": [
        {
          "internalType": "string",
          "name": "position",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "salary",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endDate",
          "type": "uint256"
        },
        {
          "internalType": "enum WorkHistoryRegistry.WorkStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bytes32",
          "name": "txHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "employerWallet",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "employeeCNP",
          "type": "string"
        }
      ],
      "name": "getWorkHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "position",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "salary",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "startDate",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "endDate",
              "type": "uint256"
            },
            {
              "internalType": "enum WorkHistoryRegistry.WorkStatus",
              "name": "status",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "txHash",
              "type": "bytes32"
            }
          ],
          "internalType": "struct WorkHistoryRegistry.WorkEntry[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "employeeCNP",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "position",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "salary",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "startDate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "endDate",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "txHash",
          "type": "bytes32"
        }
      ],
      "name": "registerWork",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ] as const;