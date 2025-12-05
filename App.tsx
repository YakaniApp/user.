
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import AmountStep from './components/AmountStep';
import RecipientStep from './components/RecipientStep';
import ReviewStep from './components/ReviewStep';
import Receipt from './components/Receipt';
import CommunityChat from './components/CommunityChat';
import Registration from './components/Registration';
import Wallet from './components/Wallet';
import NotificationToast from './components/NotificationToast';
import AIGuide from './components/AIGuide';
import AdminDashboard from './components/AdminDashboard';
import { TransactionDetails, Currency, TransactionResult, View, Notification, TransactionRecord } from './types';
import { processTransactionWithGemini } from './services/geminiService';
import { notifySenderOfCompletion, notifyRecipientOfFunds } from './services/whatsappService';
import { notifyAdminOfNewRequest, sendReceiptToUser } from './services/emailService';

const initialDetails: TransactionDetails = {
  amountSend: 0,
  currencySend: Currency.USD,
  amountReceive: 0,
  currencyReceive: Currency.UGX,
  recipient: {
    fullName: '',
    phone: '',
    withdrawalMethod: 'MOBILE_MONEY',
    network: 'MTN_UGANDA'
  },
  senderName: '',
  senderPhone: '',
  senderEmail: '',
  notifyOnWhatsapp: false,
  direction: 'SOM_TO_UGA',
  senderTransactionRef: ''
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('TRANSFER');
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<TransactionDetails>(initialDetails);
  const [result, setResult] = useState<TransactionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Secret Admin Trigger
  const [secretClickCount, setSecretClickCount] = useState(0);
  
  // Initialize history from Local Storage if available
  const [history, setHistory] = useState<TransactionRecord[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('txn_history');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // Apply Theme Effect
  useEffect(() => {
    if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Persist History Effect
  useEffect(() => {
    localStorage.setItem('txn_history', JSON.stringify(history));
  }, [history]);

  const updateDetails = (updates: Partial<TransactionDetails>) => {
    setDetails(prev => ({ ...prev, ...updates }));
  };

  const addNotification = (message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSecretAdminTrigger = () => {
    setSecretClickCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 5) {
            setCurrentView('ADMIN');
            addNotification("Secure Vault Access Detected", "INFO");
            return 0; // Reset
        }
        return newCount;
    });
  };

  // Function for Admin to manually record a transaction
  const handleManualTransactionAdd = (record: TransactionRecord) => {
      setHistory(prev => [record, ...prev]);
      addNotification('Manual Transaction Recorded Successfully', 'SUCCESS');
  };

  // Function for Admin to update status (Approve/Reject)
  const handleTransactionUpdate = async (id: string, newStatus: TransactionRecord['status']) => {
    const txnIndex = history.findIndex(t => t.transactionId === id);
    if (txnIndex === -1) return;

    const txn = history[txnIndex];
    const updatedTxn = { ...txn, status: newStatus };
    
    // Update State
    const newHistory = [...history];
    newHistory[txnIndex] = updatedTxn;
    setHistory(newHistory);

    // Trigger Notifications on Success
    if (newStatus === 'SUCCESS') {
        addNotification(`Processing approval for ${id}...`, 'INFO');
        
        try {
            // Send to Sender (WhatsApp/SMS)
            await notifySenderOfCompletion(updatedTxn);
            
            // Send to Recipient (SMS/WhatsApp)
            await notifyRecipientOfFunds(updatedTxn);
            
            addNotification(`Transaction Approved! Notifications sent.`, 'SUCCESS');
        } catch (error) {
            console.error("Notification API Error:", error);
            addNotification("Approved locally, but notification API failed.", 'ERROR');
        }
    }
  };

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const handleConfirm = async () => {
    setIsProcessing(true);
    // Simulate AI Processing time + Network latency
    try {
      const res = await processTransactionWithGemini(details);
      setResult(res);
      
      // Save to History for Admin
      const record: TransactionRecord = {
          ...details,
          ...res,
          timestamp: new Date().toISOString()
      };
      setHistory(prev => [record, ...prev]);

      // 1. Notify Admin via Email (yakanicash@gmail.com)
      notifyAdminOfNewRequest(record).catch(console.error);

      // 2. Send Receipt Email to User (if email provided)
      if (details.senderEmail) {
         sendReceiptToUser(record).catch(console.error);
      }

      addNotification('Request Submitted! Admin is verifying your payment.', 'SUCCESS');
      handleNext();
    } catch (e) {
      console.error(e);
      addNotification("Transaction failed. Please try again.", 'ERROR');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setDetails(initialDetails);
    setResult(null);
    setStep(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <NotificationToast notifications={notifications} removeNotification={removeNotification} />

      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-5xl">
        
        {currentView === 'TRANSFER' && (
          <div className="max-w-2xl mx-auto">
            {step < 4 && (
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
                  {details.direction === 'SOM_TO_UGA' ? 'Send Money to Uganda' : 'Send Money to Somalia'}
                </h1>
                <p className="text-center text-gray-500 dark:text-gray-400">Manual Agent Transfer System</p>
                <StepIndicator currentStep={step} />
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 transition-all duration-300 border border-transparent dark:border-gray-700">
              {step === 1 && (
                <AmountStep 
                  details={details} 
                  updateDetails={updateDetails} 
                  onNext={handleNext} 
                />
              )}
              
              {step === 2 && (
                <RecipientStep 
                  details={details} 
                  updateDetails={updateDetails} 
                  onBack={handleBack} 
                  onNext={handleNext} 
                />
              )}

              {step === 3 && (
                <ReviewStep 
                  details={details} 
                  onBack={handleBack} 
                  onConfirm={handleConfirm}
                  isProcessing={isProcessing}
                  updateDetails={updateDetails}
                />
              )}

              {step === 4 && result && (
                <Receipt 
                  details={details} 
                  result={result}
                  onReset={handleReset}
                />
              )}
            </div>

            {step === 1 && (
               <div className="mt-8 text-center">
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                     Exchange rates are updated daily. Transfers typically arrive within minutes.
                     <br/>Powered by <span className="font-semibold text-emerald-600 dark:text-emerald-500">Google Gemini</span> security monitoring.
                  </p>
               </div>
            )}
          </div>
        )}

        {currentView === 'CHAT' && (
             <div className="max-w-2xl mx-auto">
                <CommunityChat />
             </div>
        )}
        
        {currentView === 'REGISTER' && <Registration onNotify={addNotification} />}

        {currentView === 'WALLET' && <Wallet />}

        {currentView === 'ADMIN' && (
            <AdminDashboard 
                history={history} 
                onAddTransaction={handleManualTransactionAdd} 
                onUpdateStatus={handleTransactionUpdate}
            />
        )}

      </main>
      
      <footer className="bg-slate-900 dark:bg-black text-slate-400 py-8 mt-auto border-t border-gray-800">
         <div className="container mx-auto px-4 text-center space-y-2">
            <p className="text-sm">&copy; {new Date().getFullYear()} SomalUganda Remit. All rights reserved.</p>
            <div className="text-xs text-slate-500 dark:text-slate-600">
              <p 
                onClick={handleSecretAdminTrigger} 
                className="cursor-default select-none hover:text-slate-300 transition-colors"
              >
                Admin Contact / Vault:
              </p>
              <p className="font-mono mt-1">🇸🇴 +252 771 957 722 &nbsp;|&nbsp; 🇺🇬 +256 779 334 452</p>
            </div>
         </div>
      </footer>

      <AIGuide />
    </div>
  );
};

export default App;
