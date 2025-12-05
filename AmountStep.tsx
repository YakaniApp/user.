
import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, TrendingUp, RefreshCw, ChevronDown, Info } from 'lucide-react';
import { Currency, TransactionDetails } from '../types';

interface AmountStepProps {
  details: TransactionDetails;
  updateDetails: (updates: Partial<TransactionDetails>) => void;
  onNext: () => void;
}

// 1 USD = 3750 UGX (Selling)
// 1 USD = 3850 UGX (Buying - approximated for reverse calculation to include fees/spread)
const RATE_USD_TO_UGX = 3750; 
const RATE_UGX_TO_USD = 0.00026; // Approx 1/3850
const FEE_PERCENTAGE = 0.015; // 1.5% Transaction Fee

const AmountStep: React.FC<AmountStepProps> = ({ details, updateDetails, onNext }) => {
  const [inputAmount, setInputAmount] = useState<string>(details.amountSend ? details.amountSend.toString() : '');

  const isSomToUga = details.direction === 'SOM_TO_UGA';
  const currencySend = isSomToUga ? Currency.USD : Currency.UGX;
  const currencyReceive = isSomToUga ? Currency.UGX : Currency.USD;
  const currentRate = isSomToUga ? RATE_USD_TO_UGX : RATE_UGX_TO_USD;
  const currentRateDisplay = isSomToUga 
    ? `1 USD = ${RATE_USD_TO_UGX.toLocaleString()} UGX` 
    : `10,000 UGX = ${(10000 * RATE_UGX_TO_USD).toFixed(2)} USD`;

  // Calculate Fee
  const amountVal = parseFloat(inputAmount) || 0;
  const estimatedFee = amountVal * FEE_PERCENTAGE;

  useEffect(() => {
    const amount = parseFloat(inputAmount) || 0;
    updateDetails({
      amountSend: amount,
      amountReceive: amount * currentRate,
      currencySend: currencySend,
      currencyReceive: currencyReceive
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputAmount, details.direction]);

  const toggleDirection = () => {
    const newDirection = isSomToUga ? 'UGA_TO_SOM' : 'SOM_TO_UGA';
    
    // Reset recipient network when switching countries to avoid incompatible types
    // CRITICAL: Clear phone numbers to prevent validation errors with old country prefixes
    const newNetwork = newDirection === 'SOM_TO_UGA' ? 'MTN_UGANDA' : 'EVC_PLUS';
    
    updateDetails({
      direction: newDirection,
      senderPhone: '', // Reset sender phone
      recipient: {
          ...details.recipient,
          network: newNetwork as any,
          phone: '' // Reset recipient phone
      }
    });
    setInputAmount(''); // Clear amount on switch to avoid confusion with massive number diffs
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as Currency;
    if (selected !== currencySend) {
      toggleDirection();
    }
  };

  const handleNext = () => {
    if (parseFloat(inputAmount) > 0) {
      onNext();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
         <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {isSomToUga ? '🇸🇴 From Somalia to 🇺🇬 Uganda' : '🇺🇬 From Uganda to 🇸🇴 Somalia'}
         </h2>
         <button 
           onClick={toggleDirection}
           className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
         >
           <RefreshCw size={14} />
           Switch Direction
         </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
        <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Great Exchange Rate!</h4>
          <p className="text-blue-600 dark:text-blue-400 text-sm">Today's rate: {currentRateDisplay}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Send Amount */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">You Send</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 dark:text-gray-400 font-bold">{isSomToUga ? '$' : 'USh'}</span>
            </div>
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              className="block w-full pl-12 pr-28 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="0.00"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
               <div className="relative h-full">
                 <select
                    value={currencySend}
                    onChange={handleCurrencyChange}
                    className="h-full py-0 pl-4 pr-10 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 border-l border-gray-300 dark:border-gray-500 rounded-r-lg font-bold appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                 >
                   <option value={Currency.USD}>USD</option>
                   <option value={Currency.UGX}>UGX</option>
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
                    <ChevronDown size={14} strokeWidth={3} />
                 </div>
               </div>
            </div>
          </div>
          
          {/* Fee Display */}
          <div className="flex justify-between items-center mt-2 px-1">
             <span className="text-xs text-gray-400 dark:text-gray-500">Limit: {isSomToUga ? '$5,000' : 'USh 18M'}</span>
             <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-600">
                <Info size={12} className="text-gray-400 dark:text-gray-500" />
                <span>Est. Fee (1.5%): </span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                    {estimatedFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currencySend}
                </span>
             </div>
          </div>
        </div>

        <div className="flex justify-center -my-2 relative z-10">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full p-2 shadow-sm">
            <ArrowRightLeft className="text-emerald-500 w-5 h-5 transform rotate-90" />
          </div>
        </div>

        {/* Receive Amount */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Gets</label>
          <div className="relative rounded-md shadow-sm">
             <input
              type="text"
              readOnly
              value={details.amountReceive.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              className="block w-full pl-4 pr-16 py-3 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-lg text-lg font-semibold text-gray-700 dark:text-gray-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
               <span className="h-full py-3 px-4 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-l border-emerald-200 dark:border-emerald-800 rounded-r-lg font-bold flex items-center min-w-[4.5rem] justify-center">
                 {currencyReceive}
               </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleNext}
          disabled={!parseFloat(inputAmount)}
          className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all
            ${parseFloat(inputAmount) > 0 
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl translate-y-0' 
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'}`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default AmountStep;
