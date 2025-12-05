
import React, { useState } from 'react';
import { Clock, Share2, Home, Download, MessageCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { TransactionDetails, TransactionResult } from '../types';
import Logo from './Logo';

interface ReceiptProps {
  details: TransactionDetails;
  result: TransactionResult;
  onReset: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ details, result, onReset }) => {
  const isSomToUga = details.direction === 'SOM_TO_UGA';
  const senderPrefix = isSomToUga ? '+252' : '+256';
  // Use Uganda number for WhatsApp support in all cases as requested
  const adminPhone = '256779334452'; 
  
  const handleWhatsAppShare = () => {
    const text = `
*NEW MONEY TRANSFER REQUEST*
--------------------------------
*ID:* ${result.transactionId}
*Sender:* ${details.senderName}
*Phone:* ${senderPrefix} ${details.senderPhone}
*Amount Sent:* ${details.amountSend} ${details.currencySend}
*Ref Code:* ${details.senderTransactionRef}
--------------------------------
*Recipient:* ${details.recipient.fullName}
*Destination:* ${details.recipient.withdrawalMethod}
*Amount to Receive:* ${details.amountReceive} ${details.currencyReceive}
--------------------------------
Please process this urgently.
    `.trim();

    const url = `https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="text-center animate-fade-in space-y-6">
      
      <div className="flex justify-center">
         <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/50 p-4 relative">
            <Clock className="w-16 h-16 text-yellow-600 dark:text-yellow-400" />
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 rounded-full p-1 shadow-md">
                <Logo className="w-8 h-8" />
            </div>
         </div>
      </div>
      
      <div>
         <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted</h2>
         <p className="text-gray-500 dark:text-gray-400">Admin is verifying your payment reference.</p>
         
         <div onClick={handleWhatsAppShare} className="mt-4 inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-xl font-bold shadow-lg hover:bg-[#20bd5a] transition-transform hover:scale-105 cursor-pointer animate-pulse">
            <MessageCircle size={20} />
            <span>Send Proof to Admin on WhatsApp</span>
         </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 text-left relative overflow-hidden">
         {/* Decorative pattern */}
         <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/20 rounded-full opacity-50 z-0"></div>
         <div className="absolute top-4 right-4 z-10 opacity-20">
             <Logo className="w-16 h-16" />
         </div>
         
         <div className="relative z-10 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-blue-200">
                    Your reference <strong>{details.senderTransactionRef}</strong> is currently in the verification queue. Once matched with our bank records, the funds will be released to the recipient.
                </p>
            </div>

            <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-4 mt-2">
               <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">System ID</p>
                  <p className="font-mono font-medium text-gray-800 dark:text-gray-200">{result.transactionId}</p>
               </div>
               <div className="text-right">
                   <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
                   <p className="font-medium text-gray-800 dark:text-gray-200">{new Date().toLocaleDateString()}</p>
               </div>
            </div>

            <div className="py-2">
               <div className="flex justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Sent Amount</span>
                  <span className="font-bold text-gray-900 dark:text-white">{details.amountSend.toFixed(2)} {details.currencySend}</span>
               </div>
               <div className="flex justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Fees</span>
                  <span className="font-bold text-gray-900 dark:text-white">{isSomToUga ? '$' : 'USh'} {result.fees.toLocaleString()}</span>
               </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500 dark:text-gray-400">Exchange Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                      {isSomToUga ? '1 USD = 3,750 UGX' : '10,000 UGX = 2.60 USD'}
                  </span>
               </div>
               <div className="border-t border-gray-100 dark:border-gray-700 my-3"></div>
               <div className="flex justify-between items-center">
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">Recipient Gets</span>
                  <div className="text-right">
                     <span className="block font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                         {details.amountReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })} {details.currencyReceive}
                     </span>
                     <span className="text-[10px] text-emerald-600 dark:text-emerald-500 uppercase">
                        {details.recipient.withdrawalMethod === 'BANK_TRANSFER' ? `via ${details.recipient.bankName}` : 'via Mobile Money'}
                     </span>
                  </div>
               </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 mt-4">
               <p className="text-sm text-gray-600 dark:text-gray-300 italic">"{result.message}"</p>
               <p className="text-xs text-gray-400 mt-2 text-right">- Admin Verification Team</p>
            </div>
         </div>
      </div>

      <button 
         onClick={onReset}
         className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
      >
         <Home className="w-5 h-5" /> Return to Home
      </button>

    </div>
  );
};

export default Receipt;
