
import React, { useState } from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, History, Building2, Smartphone, ShieldCheck, AlertCircle, ChevronDown, Lock, Headphones, MessageCircle, CheckCircle, HelpCircle, Copy, Phone, X, Globe } from 'lucide-react';

const Wallet: React.FC = () => {
  const [balance, setBalance] = useState(1250.00);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'BANK' | 'MOBILE'>('BANK');
  const [withdrawCountry, setWithdrawCountry] = useState<'SOM' | 'UGA'>('SOM');
  const [withdrawDetails, setWithdrawDetails] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount");
        return;
    }

    if (amount > balance) {
        alert("Insufficient funds");
        return;
    }

    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
        setBalance(prev => prev - amount);
        setIsProcessing(false);
        setShowWithdraw(false);
        
        const destination = withdrawMethod === 'BANK' 
            ? (withdrawCountry === 'SOM' ? 'Bank Registered Number' : 'Bank Account') 
            : 'Mobile Money';
            
        setSuccessMsg(`Request received! Admin is manually processing your withdrawal of $${amount}. Funds will be sent to your ${destination} shortly.`);
        setWithdrawAmount('');
        setWithdrawDetails('');
        
        // Clear success message after 8 seconds
        setTimeout(() => setSuccessMsg(''), 8000);
    }, 2000);
  };

  const handleSupportChat = () => {
      // Updated to Uganda number ending in 452
      window.open('https://wa.me/256779334452?text=Hello%2C%20I%20have%20an%20inquiry%20regarding%20my%20wallet%20balance%20or%20transactions.', '_blank');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-2xl mx-auto my-6 animate-fade-in space-y-6 relative">
      
      {/* Wallet Header Card */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 dark:from-emerald-900 dark:to-emerald-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-32 h-32 bg-black opacity-10 rounded-full"></div>

        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-emerald-100 font-medium text-sm flex items-center gap-2">
                        <WalletIcon size={16} /> Total Balance
                    </h2>
                    <h1 className="text-4xl font-bold mt-1">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                </div>
                <div className="bg-emerald-900/30 backdrop-blur-sm p-2 rounded-lg border border-emerald-500/30">
                    <ShieldCheck className="text-emerald-300 w-6 h-6" />
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                    onClick={() => setShowWithdraw(true)}
                    className="flex-1 bg-white text-emerald-800 dark:bg-gray-100 dark:text-emerald-900 py-3 px-4 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <ArrowUpRight size={18} /> Withdraw Funds
                </button>
                <button 
                    onClick={() => setShowTopUp(true)}
                    className="flex-1 bg-emerald-900/40 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-emerald-900/60 transition-colors flex items-center justify-center gap-2 backdrop-blur-sm border border-emerald-500/30"
                >
                    <ArrowDownLeft size={18} /> Top Up Wallet
                </button>
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-200 bg-black/10 p-2 rounded-lg inline-flex">
                <Lock size={12} />
                <span>Funds are securely stored in the Admin Vault.</span>
            </div>
        </div>
      </div>

      {successMsg && (
          <div className="bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800 text-green-700 dark:text-emerald-300 px-4 py-4 rounded-xl flex items-start gap-3 animate-fade-in shadow-sm">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                  <p className="font-bold text-sm">Withdrawal Initiated</p>
                  <p className="text-sm opacity-90">{successMsg}</p>
              </div>
          </div>
      )}

      {/* Admin Contact / Vault Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm flex items-start gap-4">
        <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
            <Headphones size={24} />
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">Admin Support & Deposits</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                To deposit funds or for inquiries, please contact the admin directly. Your funds are effectively stored with the Admin's registered mobile numbers.
            </p>
            <div className="space-y-1 text-sm font-medium">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🇸🇴 Somalia:</span>
                    <a href="tel:+252771957722" className="text-emerald-700 dark:text-emerald-400 hover:underline font-mono">+252 771 957 722</a>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <span>🇺🇬 Uganda / WhatsApp:</span>
                    <a href="tel:+256779334452" className="text-emerald-700 dark:text-emerald-400 hover:underline font-mono">+256 779 334 452</a>
                </div>
            </div>
            <button 
                onClick={handleSupportChat}
                className="mt-3 flex items-center gap-2 text-sm font-bold text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
            >
                <MessageCircle size={16} /> Chat with Admin
            </button>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-lg relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                 <button 
                    onClick={() => setShowTopUp(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                 >
                    <X size={20} />
                 </button>

                 <div className="flex items-center gap-3 mb-6">
                     <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                         <ArrowDownLeft size={24} />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl text-gray-900 dark:text-white">How to Top Up</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Deposit funds to your wallet manually</p>
                     </div>
                 </div>

                 <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-800 dark:text-blue-200 flex gap-2">
                           <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                           <span>Currently, all deposits are processed manually by our verified agents.</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center flex-shrink-0">1</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Send Money to Agent</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Transfer the amount you want to deposit to one of these numbers:</p>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🇸🇴</span>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Somalia (EVC/Zaad)</p>
                                                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">+252 771 957 722</p>
                                            </div>
                                        </div>
                                        <button onClick={() => copyToClipboard('+252771957722')} className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"><Copy size={16}/></button>
                                    </div>

                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🇺🇬</span>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">Uganda (MTN/Airtel)</p>
                                                <p className="font-mono text-sm text-gray-800 dark:text-gray-200">+256 779 334 452</p>
                                            </div>
                                        </div>
                                        <button onClick={() => copyToClipboard('+256779334452')} className="text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"><Copy size={16}/></button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center flex-shrink-0">2</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Send Proof of Payment</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Take a screenshot of the transaction or copy the message ID. Send this to the Admin via WhatsApp.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center flex-shrink-0">3</div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Wallet Credited</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    The admin will verify and credit your wallet within <span className="font-semibold text-emerald-700 dark:text-emerald-400">5-15 minutes</span>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSupportChat}
                        className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-bold transition-all flex justify-center items-center gap-2 shadow-md"
                    >
                        <MessageCircle size={20} />
                        Contact Admin on WhatsApp
                    </button>
                 </div>
              </div>
          </div>
      )}

      {/* Withdrawal Modal */}
      {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md relative animate-in zoom-in-95 duration-200">
                 <button 
                    onClick={() => setShowWithdraw(false)} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 bg-gray-100 dark:bg-gray-700 rounded-full transition-colors"
                 >
                    <X size={20} />
                 </button>

                 <div className="flex items-center gap-3 mb-6">
                     <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                         <ArrowUpRight size={24} />
                     </div>
                     <div>
                         <h3 className="font-bold text-xl text-gray-900 dark:text-white">Withdraw Funds</h3>
                         <p className="text-xs text-gray-500 dark:text-gray-400">Safe & secure payout by Admin</p>
                     </div>
                 </div>

                 <form onSubmit={handleWithdraw} className="space-y-5">
                     
                     {/* Country Selection for Withdrawal */}
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination Country</label>
                        <div className="grid grid-cols-2 gap-3">
                             <div 
                                 onClick={() => setWithdrawCountry('SOM')}
                                 className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${withdrawCountry === 'SOM' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                             >
                                 <span className="text-xl">🇸🇴</span>
                                 <span className="text-sm font-bold dark:text-gray-200">Somalia</span>
                             </div>
                             <div 
                                 onClick={() => setWithdrawCountry('UGA')}
                                 className={`cursor-pointer border rounded-xl p-3 flex items-center justify-center gap-2 transition-all ${withdrawCountry === 'UGA' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                             >
                                 <span className="text-xl">🇺🇬</span>
                                 <span className="text-sm font-bold dark:text-gray-200">Uganda</span>
                             </div>
                        </div>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Withdrawal Method</label>
                         <div className="grid grid-cols-2 gap-3">
                             <div 
                                 onClick={() => setWithdrawMethod('BANK')}
                                 className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${withdrawMethod === 'BANK' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                             >
                                 <Building2 size={24} className="dark:text-gray-200"/>
                                 <span className="text-xs font-bold dark:text-gray-200">Bank Account</span>
                             </div>
                             <div 
                                 onClick={() => setWithdrawMethod('MOBILE')}
                                 className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center gap-2 transition-all ${withdrawMethod === 'MOBILE' ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500' : 'bg-white dark:bg-gray-750 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                             >
                                 <Smartphone size={24} className="dark:text-gray-200"/>
                                 <span className="text-xs font-bold dark:text-gray-200">Mobile Money</span>
                             </div>
                         </div>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount ($)</label>
                         <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-bold">$</span>
                            <input 
                                type="number"
                                required
                                min="1"
                                max={balance}
                                step="0.01"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-semibold text-lg bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                placeholder="0.00"
                            />
                         </div>
                         <div className="flex justify-between mt-1">
                             <span className="text-xs text-gray-500 dark:text-gray-400">Available: ${balance.toFixed(2)}</span>
                             {parseFloat(withdrawAmount) > balance && <span className="text-xs text-red-500 font-medium">Insufficient funds</span>}
                         </div>
                     </div>

                     <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                             {withdrawMethod === 'BANK' 
                                ? (withdrawCountry === 'SOM' ? 'Bank Registered Phone Number' : 'Bank Account Number') 
                                : 'Mobile Money Number'}
                         </label>
                         <input 
                            type={withdrawMethod === 'BANK' && withdrawCountry === 'UGA' ? 'text' : 'tel'}
                            required
                            value={withdrawDetails}
                            onChange={(e) => setWithdrawDetails(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                            placeholder={withdrawMethod === 'BANK' 
                                ? (withdrawCountry === 'SOM' ? "+252 61..." : "e.g. 903000...")
                                : (withdrawCountry === 'SOM' ? "+252 61..." : "+256 77...")
                            }
                         />
                         {withdrawMethod === 'BANK' && (
                             <p className="text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 p-2 rounded mt-2 flex items-start gap-2">
                                 <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                 {withdrawCountry === 'SOM' ? (
                                     <span>For Somalia: Enter the phone number registered with your bank. The Admin will manually process this transfer to your registered line.</span>
                                 ) : (
                                     <span>For Uganda: Enter your Bank Account Number. The Admin will process this transfer manually via bank deposit.</span>
                                 )}
                             </p>
                         )}
                     </div>

                     <button 
                        type="submit"
                        disabled={isProcessing || !withdrawAmount || !withdrawDetails || parseFloat(withdrawAmount) > balance}
                        className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold hover:bg-emerald-800 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 shadow-lg"
                     >
                         {isProcessing ? (
                            <>
                               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Processing...
                            </>
                         ) : 'Confirm Withdrawal'}
                     </button>
                 </form>
              </div>
          </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2 bg-gray-50/50 dark:bg-gray-750">
              <History size={18} className="text-gray-500 dark:text-gray-400" />
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Recent Activity</h3>
          </div>
          
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                          <ArrowDownLeft size={16} />
                      </div>
                      <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Received from Admin</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Today, 10:30 AM</p>
                      </div>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">+$150.00</span>
              </div>

              <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full text-red-600 dark:text-red-400">
                          <ArrowUpRight size={16} />
                      </div>
                      <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Withdrawal to Premier Bank</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Yesterday, 2:15 PM</p>
                      </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-gray-100">-$450.00</span>
              </div>
              
               <div className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full text-green-600 dark:text-green-400">
                          <ArrowDownLeft size={16} />
                      </div>
                      <div>
                          <p className="font-bold text-sm text-gray-800 dark:text-gray-200">Deposit via Hawala Agent</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">Oct 24, 9:00 AM</p>
                      </div>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400">+$2,000.00</span>
              </div>
          </div>
      </div>

      {/* Floating Support Bubble */}
      <button
        onClick={handleSupportChat}
        className="fixed bottom-6 right-6 bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl hover:bg-emerald-700 transition-all z-50 flex items-center gap-2 group hover:pr-5 animate-bounce-subtle"
        title="Wallet Support"
      >
        <div className="relative">
            <MessageCircle className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-emerald-600"></div>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-bold text-sm">
          Wallet Help
        </span>
      </button>

    </div>
  );
};

export default Wallet;
