export interface WorkRegistration {
  id: string
  employeeCNP: string
  employerId: string
  position: string
  salary: number
  startDate: string
  endDate?: string
  txHash: string
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Employee {
  id: string
  employerId: string
  employeeCNP: string
  employeeName: string
  currentPosition?: string
  currentSalary?: number
  hireDate?: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

export interface BlockchainError {
  code: string
  message: string
  details?: any
}
