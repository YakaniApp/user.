
export enum Currency {
  USD = 'USD',
  SOS = 'SOS',
  UGX = 'UGX'
}

export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
}

export type WithdrawalMethod = 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type TransferDirection = 'SOM_TO_UGA' | 'UGA_TO_SOM';

export interface RecipientDetails {
  fullName: string;
  phone: string;
  withdrawalMethod: WithdrawalMethod;
  network?: 'MTN_UGANDA' | 'AIRTEL_UGANDA' | 'EVC_PLUS' | 'ZAAD' | 'SAHAL';
  bankName?: string;
  accountNumber?: string;
}

export interface TransactionDetails {
  amountSend: number;
  currencySend: Currency;
  amountReceive: number;
  currencyReceive: Currency;
  recipient: RecipientDetails;
  senderName: string;
  senderPhone: string;
  senderEmail?: string; // Added email field
  notifyOnWhatsapp: boolean;
  direction: TransferDirection;
  senderTransactionRef?: string;
}

export interface TransactionResult {
  transactionId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'WAITING_VERIFICATION';
  message: string;
  estimatedArrival: string;
  fees: number;
}

export interface TransactionRecord extends TransactionDetails, TransactionResult {
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  avatarColor?: string;
}

export interface Notification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'INFO';
  message: string;
}

export type View = 'TRANSFER' | 'CHAT' | 'REGISTER' | 'WALLET' | 'ADMIN';
