export type CreditStatus = 'none' | 'pending' | 'sent' | 'rejected'
export type OnboardingStatus = 'pending' | 'completed'
export type View = 'overview' | 'transactions' | 'settings' | 'credit-history' | 'bank-accounts' | 'payout-history' | 'cards'

export interface Transaction {
  id: string
  type: 'credit' | 'withdrawal' | 'pending' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'
  amount: number
  currency?: 'USD' | 'NGN' // CRITICAL: Use this field to display correct currency
  date: string
  status: 'completed' | 'pending' | 'rejected'
  description: string
}

export interface Activity {
  id: string
  type: 'credit_request' | 'payout_request' | 'credit' | 'withdrawal' | 'payout' | 'deposit' | 'card_funding' | 'transfer_earnings_to_wallet' | 'card_purchase'
  amount: number
  currency?: 'USD' | 'NGN' // CRITICAL: Use this field to display correct currency
  amountInNgn?: number
  netAmount?: number
  date: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  description: string
  referenceId?: string
}

export interface BankAccount {
  id: string
  accountNumber: string
  accountName: string
  bankName: string
  bankCode: string
  isVerified: boolean
  isPrimary: boolean
  createdAt: string
}

export interface Payout {
  id: string
  amount: number
  amountInNgn: number
  processingFee: number
  netAmount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  requestedAt: string
  processedAt?: string | null
  completedAt?: string | null
  rejectionReason?: string | null
  bankAccount?: {
    accountNumber: string
    accountName: string
    bankName: string
    bankCode: string
  }
}

export interface Card {
  id: string
  cardNumber: string
  cardType: 'virtual' | 'physical'
  currency: string
  status: 'active' | 'frozen' | 'closed'
  balance: number
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
  createdAt: string
}

export interface CardTransaction {
  id: string
  cardId: string
  userId: string
  type: 'purchase' | 'funding' | 'refund' | 'reversal' | 'fee'
  amount: number
  currency: string
  merchantName?: string
  description: string
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  reference?: string
  createdAt: string
}
