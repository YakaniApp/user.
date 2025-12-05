
import React, { useState } from 'react';
import { ShieldCheck, User, Phone, Copy, AlertTriangle, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';
import { TransactionDetails } from '../types';

interface ReviewStepProps {
  details: TransactionDetails;
  updateDetails: (updates: Partial<TransactionDetails>) => void;
  onBack: () => void;
  onConfirm: () => void;
  isProcessing: boolean;
}

// YOUR NUMBERS
const AGENT_NUMBERS = {
  SOMALIA: '+252 771 957 722', // You (Receive Dollars here)
  UGANDA: '+256 779 334 452'   // Wife (Receive Shillings here)
};

const ReviewStep: React.FC<ReviewStepProps> = ({ details, updateDetails, onBack, onConfirm, isProcessing }) => {
  const [transactionRef, setTransactionRef] = useState('');
  const [copied, setCopied] = useState(false);
  
  const isSomToUga = details.direction === 'SOM_TO_UGA';
  const recipientPrefix = isSomToUga ? '+256' : '+252';
  
  // Calculate Fee (1.5%)
  const fee = details.amountSend * 0.015;
  const totalToPay = details.amountSend + fee;

  // LOGIC: 
  // If moving SOM -> UGA, Customer pays YOU in Somalia (USD).
  // If moving UGA -> SOM, Customer pays WIFE in Uganda (UGX).
  const agentNumber = isSomToUga ? AGENT_NUMBERS.SOMALIA : AGENT_NUMBERS.UGANDA;
  const agentLocation = isSomToUga ? 'Somalia Office (You)' : 'Uganda Office (Wife)';
  const paymentMethodName = isSomToUga ? 'EVC Plus / Zaad' : 'MTN / Airtel Money';

  const handleCopy = (text: string) => {
    // Basic fallback for copy if navigator.clipboard is blocked (http vs https)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text.replace(/\s/g, '')).then(() => {
            showCopyFeedback();
        }).catch(() => {
            // Fallback
            showCopyFeedback();
        });
    } else {
        showCopyFeedback();
    }
  };

  const showCopyFeedback = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmClick = () => {
    updateDetails({ senderTransactionRef: transactionRef });
    onConfirm();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Warning / Instruction Header */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex gap-3">
         <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
         <div>
            <h3 className="font-bold text-orange-900 dark:text-orange-100">Action Required</h3>
            <p className="text-sm text-orange-800 dark:text-orange-300">
               {isSomToUga 
                 ? "Send Dollars to our Somalia number below. We will instruct our Uganda office to pay the recipient."
                 : "Send Shillings to our Uganda number below. We will release Dollars in Somalia once confirmed."
               }
            </p>
         </div>
      </div>

      {/* Payment Instruction Card */}
      <div className="bg-white dark:bg-gray-800 border-2 border-emerald-500 rounded-2xl shadow-lg overflow-hidden relative">
         <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
            STEP 1: PAY AGENT
         </div>
         
         <div className="p-6 space-y-4">
             <div className="text-center">
                 <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Amount to Send</p>
                 <div className="text-4xl font-black text-gray-900 dark:text-white mt-1">
                    {totalToPay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-lg text-gray-500">{details.currencySend}</span>
                 </div>
             </div>

             <div className="flex justify-center">
                <ArrowDown className="text-gray-300 animate-bounce" />
             </div>

             <div className="bg-gray-50 dark:bg-gray-750 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                 <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-2">
                    Send manually via <span className="font-bold text-gray-800 dark:text-gray-200">{paymentMethodName}</span> to:
                 </p>
                 <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 relative">
                     <div className="flex items-center gap-3">
                        <Phone className="text-emerald-600" size={20} />
                        <div>
                            <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{agentNumber}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{agentLocation}</p>
                        </div>
                     </div>
                     <button 
                        onClick={() => handleCopy(agentNumber)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors relative"
                        title="Copy Number"
                     >
                        {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                        {copied && (
                            <span className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-sm animate-fade-in whitespace-nowrap">
                                Copied!
                            </span>
                        )}
                     </button>
                 </div>
             </div>
         </div>
      </div>

      {/* Confirmation Input */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-bold px-3 py-1 rounded-bl-xl">
            STEP 2: CONFIRM
         </div>
         
         <div className="p-6">
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                 Enter Transaction ID / Reference
             </label>
             <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                 Copy the ID from the SMS you received after sending money to the number above.
             </p>
             <input 
                type="text" 
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. CI2309... or 4492..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl text-lg font-mono focus:ring-2 focus:ring-emerald-500 dark:bg-gray-900 dark:text-white"
             />
         </div>
      </div>

      {/* Recipient Summary (Collapsed/Small) */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
         <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 px-2">
             <span>Receiver: <span className="font-bold text-gray-800 dark:text-gray-200">{details.recipient.fullName}</span></span>
             <span>{recipientPrefix} {details.recipient.phone}</span>
         </div>
      </div>

      <div className="flex gap-4 pt-2">
        <button
          onClick={onBack}
          disabled={isProcessing}
          className="flex-1 py-4 px-6 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleConfirmClick}
          disabled={isProcessing || transactionRef.length < 4}
          className={`flex-1 py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all flex justify-center items-center gap-2
            ${isProcessing || transactionRef.length < 4
                ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl'}`}
        >
          {isProcessing ? (
            <>
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               Verifying...
            </>
          ) : (
             <>
                <span>I have Sent Money</span>
                <ArrowRight size={20} />
             </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ReviewStep;
