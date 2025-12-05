
import React, { useState, useEffect } from 'react';
import { User, Phone, Globe, MessageCircle, Building2, Smartphone, CreditCard, AlertCircle, ChevronDown, Check, Search, Mail } from 'lucide-react';
import { TransactionDetails, RecipientDetails, WithdrawalMethod } from '../types';

interface RecipientStepProps {
  details: TransactionDetails;
  updateDetails: (updates: Partial<TransactionDetails>) => void;
  onBack: () => void;
  onNext: () => void;
}

const UGANDAN_BANKS = [
  "Stanbic Bank",
  "Centenary Bank",
  "Absa Bank Uganda",
  "Equity Bank Uganda",
  "DFCU Bank",
  "Standard Chartered",
  "Bank of Baroda",
  "KCB Bank Uganda",
  "Housing Finance Bank",
  "PostBank Uganda"
];

const SOMALI_BANKS = [
  "Premier Bank",
  "IBS Bank",
  "Salaam Somali Bank",
  "Amal Bank",
  "Dahabshil Bank",
  "MyBank"
];

const BANK_DOMAINS: Record<string, string> = {
  "Stanbic Bank": "stanbicbank.co.ug",
  "Centenary Bank": "centenarybank.co.ug",
  "Absa Bank Uganda": "absa.co.ug",
  "Equity Bank Uganda": "equitygroupholdings.com",
  "DFCU Bank": "dfcugroup.com",
  "Standard Chartered": "sc.com",
  "Bank of Baroda": "bankofbaroda.ug",
  "KCB Bank Uganda": "kcbgroup.com",
  "Housing Finance Bank": "housingfinance.co.ug",
  "PostBank Uganda": "postbank.co.ug",
  "Premier Bank": "premierbank.so",
  "IBS Bank": "ibsbank.so",
  "Salaam Somali Bank": "salaamsomalibank.com",
  "Amal Bank": "amalbankso.so",
  "Dahabshil Bank": "dahabshiil.com",
  "MyBank": "mybank.so"
};

const BankLogo = ({ name }: { name: string }) => {
  const [imgError, setImgError] = useState(false);
  const domain = BANK_DOMAINS[name];

  const colors = [
    { bg: '#fee2e2', text: '#b91c1c' }, // red
    { bg: '#dbeafe', text: '#1d4ed8' }, // blue
    { bg: '#dcfce7', text: '#15803d' }, // green
    { bg: '#f3e8ff', text: '#7e22ce' }, // purple
    { bg: '#ffedd5', text: '#c2410c' }, // orange
  ];
  
  const charCode = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  const theme = colors[charCode % colors.length];

  if (domain && !imgError) {
    return (
      <img 
        src={`https://logo.clearbit.com/${domain}`} 
        alt={`${name} logo`}
        className="w-9 h-9 rounded-full object-contain bg-white border border-gray-100 dark:border-gray-700 p-0.5 flex-shrink-0"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
      <circle cx="18" cy="18" r="18" fill={theme.bg} />
      <text x="18" y="23" textAnchor="middle" fill={theme.text} fontSize="12" fontWeight="800" fontFamily="sans-serif">
        {name.substring(0, 2).toUpperCase()}
      </text>
    </svg>
  );
}

const RecipientStep: React.FC<RecipientStepProps> = ({ details, updateDetails, onBack, onNext }) => {
  const [recipient, setRecipient] = useState<RecipientDetails>(details.recipient);
  const [senderName, setSenderName] = useState(details.senderName);
  const [senderPhone, setSenderPhone] = useState(details.senderPhone);
  const [senderEmail, setSenderEmail] = useState(details.senderEmail || '');
  const [notifyOnWhatsapp, setNotifyOnWhatsapp] = useState(details.notifyOnWhatsapp);
  const [showBankList, setShowBankList] = useState(false);
  const [bankSearchTerm, setBankSearchTerm] = useState('');

  const isSomToUga = details.direction === 'SOM_TO_UGA';
  
  useEffect(() => {
    if (isSomToUga) {
       if (recipient.network && !['MTN_UGANDA', 'AIRTEL_UGANDA'].includes(recipient.network)) {
          setRecipient(prev => ({ ...prev, network: 'MTN_UGANDA' }));
       }
    } else {
       if (recipient.network && !['EVC_PLUS', 'ZAAD', 'SAHAL'].includes(recipient.network)) {
          setRecipient(prev => ({ ...prev, network: 'EVC_PLUS' }));
       }
    }
    if (recipient.withdrawalMethod === 'BANK_TRANSFER' && !recipient.bankName) {
        setRecipient(prev => ({ ...prev, bankName: isSomToUga ? UGANDAN_BANKS[0] : SOMALI_BANKS[0] }));
    }
  }, [isSomToUga, recipient.withdrawalMethod]);


  const cleanPhone = (phone: string) => phone.replace(/\D/g, '');

  const getPhoneValidationError = (phone: string, isSomali: boolean): string | null => {
    const cleaned = cleanPhone(phone);
    if (!cleaned) return null;

    if (isSomali) {
        if (cleaned.length !== 9) return `Must be 9 digits (Current: ${cleaned.length})`;
        const prefix = cleaned.substring(0, 2);
        const validPrefixes = ['61', '62', '63', '64', '65', '66', '67', '68', '69', '77'];
        if (!validPrefixes.includes(prefix)) {
            return "Invalid prefix. Use 61, 62, 63, 68...";
        }
    } else {
        if (cleaned.length !== 9) return `Must be 9 digits (Current: ${cleaned.length})`;
        if (!cleaned.startsWith('7')) {
            return "Must start with 7 (e.g., 77, 70, 75)";
        }
    }
    return null;
  };

  const isSenderPhoneValid = (phone: string) => !getPhoneValidationError(phone, isSomToUga);
  const isRecipientPhoneValid = (phone: string) => !getPhoneValidationError(phone, !isSomToUga);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, isSender: boolean) => {
    let val = e.target.value.replace(/\D/g, '');
    const isTargetUganda = (isSomToUga && !isSender) || (!isSomToUga && isSender);
    
    if (isTargetUganda) {
        if (val.startsWith('256') && val.length > 3) val = val.substring(3);
        if (val.startsWith('0') && val.length > 1) val = val.substring(1);
        if (val.length > 9) val = val.substring(0, 9);
    } else {
        if (val.startsWith('252') && val.length > 3) val = val.substring(3);
        if (val.startsWith('0') && val.length > 1) val = val.substring(1);
        if (val.length > 9) val = val.substring(0, 9);
    }

    if (isSender) {
        setSenderPhone(val);
    } else {
        setRecipient({ ...recipient, phone: val });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetails({ recipient, senderName, senderPhone, senderEmail, notifyOnWhatsapp });
    onNext();
  };

  const handleMethodChange = (method: WithdrawalMethod) => {
    const defaultBank = isSomToUga ? UGANDAN_BANKS[0] : SOMALI_BANKS[0];
    setRecipient(prev => ({ 
      ...prev, 
      withdrawalMethod: method,
      bankName: method === 'BANK_TRANSFER' ? prev.bankName || defaultBank : undefined
    }));
  };

  const isFormValid = () => {
    const common = recipient.fullName && senderName && isSenderPhoneValid(senderPhone);
    if (!common) return false;
    
    if (recipient.withdrawalMethod === 'MOBILE_MONEY') {
      return recipient.network && isRecipientPhoneValid(recipient.phone);
    } else {
      return recipient.bankName && recipient.accountNumber && recipient.accountNumber.length > 5 && isRecipientPhoneValid(recipient.phone);
    }
  };

  const banksList = isSomToUga ? UGANDAN_BANKS : SOMALI_BANKS;
  const filteredBanks = banksList.filter(bank => 
    bank.toLowerCase().includes(bankSearchTerm.toLowerCase())
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        
        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
           <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
             Sender Details ({isSomToUga ? 'Somalia' : 'Uganda'})
           </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="e.g. Ahmed Nur"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Phone Number</label>
          <div className="flex gap-2">
             <div className="w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 font-medium">
                {isSomToUga ? '🇸🇴 +252' : '🇺🇬 +256'}
             </div>
             <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => handlePhoneChange(e, true)}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                    ${senderPhone && !isSenderPhoneValid(senderPhone) ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-300 dark:border-gray-600'}
                  `}
                  placeholder={isSomToUga ? "61 555 1234" : "77 123 4567"}
                />
             </div>
          </div>
          {senderPhone && !isSenderPhoneValid(senderPhone) && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
              <AlertCircle size={12} />
              {getPhoneValidationError(senderPhone, isSomToUga)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="For email receipts"
            />
          </div>
        </div>

        <div 
           className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
             notifyOnWhatsapp 
               ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 shadow-sm' 
               : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
           }`}
           onClick={() => setNotifyOnWhatsapp(!notifyOnWhatsapp)}
        >
           <div className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${notifyOnWhatsapp ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
             <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${notifyOnWhatsapp ? 'translate-x-5' : 'translate-x-0'}`} />
           </div>
           
           <div className="flex-1">
             <div className="flex items-center gap-2">
                <MessageCircle size={18} className={notifyOnWhatsapp ? "text-emerald-700 dark:text-emerald-400" : "text-gray-400"} />
                <span className={`font-semibold text-sm ${notifyOnWhatsapp ? 'text-emerald-900 dark:text-emerald-200' : 'text-gray-700 dark:text-gray-300'}`}>
                  Get WhatsApp Status Updates
                </span>
             </div>
             <p className={`text-xs mt-1 ${notifyOnWhatsapp ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
               Receive updates on {isSomToUga ? '+252' : '+256'} {senderPhone || '...'}.
             </p>
           </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4 pt-4">
           <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
             Recipient Details ({isSomToUga ? 'Uganda' : 'Somalia'})
           </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
           <div 
             onClick={() => handleMethodChange('MOBILE_MONEY')}
             className={`relative cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all ${
               recipient.withdrawalMethod === 'MOBILE_MONEY' 
                 ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500' 
                 : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-emerald-300 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
           >
             <div className={`p-3 rounded-full ${recipient.withdrawalMethod === 'MOBILE_MONEY' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                <Smartphone className="w-6 h-6" />
             </div>
             <div>
                <span className={`block font-bold ${recipient.withdrawalMethod === 'MOBILE_MONEY' ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-300'}`}>Mobile Money</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {isSomToUga ? 'Instant (MTN/Airtel)' : 'Instant (EVC/Zaad)'}
                </span>
             </div>
             {recipient.withdrawalMethod === 'MOBILE_MONEY' && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                   <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800"></div>
                </div>
             )}
           </div>
           
           <div 
             onClick={() => handleMethodChange('BANK_TRANSFER')}
             className={`relative cursor-pointer rounded-xl border p-4 flex items-center gap-4 transition-all ${
               recipient.withdrawalMethod === 'BANK_TRANSFER' 
                 ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500' 
                 : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-emerald-300 hover:bg-gray-50 dark:hover:bg-gray-700'
             }`}
           >
             <div className={`p-3 rounded-full ${recipient.withdrawalMethod === 'BANK_TRANSFER' ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700 dark:text-emerald-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                <Building2 className="w-6 h-6" />
             </div>
             <div>
                <span className={`block font-bold ${recipient.withdrawalMethod === 'BANK_TRANSFER' ? 'text-emerald-900 dark:text-emerald-100' : 'text-gray-700 dark:text-gray-300'}`}>Bank Deposit</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Direct to any bank account</span>
             </div>
             {recipient.withdrawalMethod === 'BANK_TRANSFER' && (
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                   <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800"></div>
                </div>
             )}
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Name</label>
           <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={recipient.fullName}
              onChange={(e) => setRecipient({ ...recipient, fullName: e.target.value })}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder={isSomToUga ? "e.g. Grace Nakato" : "e.g. Abdi Ali"}
            />
          </div>
        </div>

        {recipient.withdrawalMethod === 'MOBILE_MONEY' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Network</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={recipient.network}
                  onChange={(e) => setRecipient({ ...recipient, network: e.target.value as any })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                >
                  {isSomToUga ? (
                    <>
                      <option value="MTN_UGANDA">MTN Mobile Money</option>
                      <option value="AIRTEL_UGANDA">Airtel Money</option>
                    </>
                  ) : (
                    <>
                      <option value="EVC_PLUS">EVC Plus (Hormuud)</option>
                      <option value="ZAAD">ZAAD (Telesom)</option>
                      <option value="SAHAL">Sahal (Golis)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
              <div className="flex gap-2">
                 <div className="w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 font-medium">
                    {isSomToUga ? '🇺🇬 +256' : '🇸🇴 +252'}
                 </div>
                 <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={recipient.phone}
                      onChange={(e) => handlePhoneChange(e, false)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                        ${recipient.phone && !isRecipientPhoneValid(recipient.phone) ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder={isSomToUga ? "77 123 4567" : "61 555 1234"}
                    />
                 </div>
              </div>
               {recipient.phone && !isRecipientPhoneValid(recipient.phone) && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} />
                  {getPhoneValidationError(recipient.phone, !isSomToUga)}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Bank</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                      setShowBankList(!showBankList);
                      setBankSearchTerm('');
                  }}
                  className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-3 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
                >
                  <span className="flex items-center gap-3">
                    {recipient.bankName ? (
                        <>
                           <BankLogo name={recipient.bankName} />
                           <span className="block truncate font-medium text-gray-900 dark:text-white">{recipient.bankName}</span>
                        </>
                    ) : (
                        <span className="block truncate text-gray-500 dark:text-gray-400 ml-1">Choose a bank...</span>
                    )}
                  </span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </button>

                {showBankList && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowBankList(false)} />
                    <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 shadow-xl rounded-xl ring-1 ring-black ring-opacity-5 overflow-hidden flex flex-col animate-fade-in border border-gray-100 dark:border-gray-700">
                        <div className="p-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                                    placeholder="Search bank name..."
                                    value={bankSearchTerm}
                                    onChange={(e) => setBankSearchTerm(e.target.value)}
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <ul className="max-h-52 overflow-auto py-1">
                            {filteredBanks.length > 0 ? (
                                filteredBanks.map((bank) => (
                                <li
                                    key={bank}
                                    className={`${
                                    recipient.bankName === bank ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-900 dark:text-gray-200'
                                    } cursor-pointer select-none relative py-3 pl-3 pr-9 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0`}
                                    onClick={() => {
                                        setRecipient({ ...recipient, bankName: bank });
                                        setShowBankList(false);
                                    }}
                                >
                                    <div className="flex items-center">
                                        <BankLogo name={bank} />
                                        <span className={`ml-3 block truncate ${recipient.bankName === bank ? 'font-bold text-emerald-900 dark:text-emerald-100' : 'font-medium text-gray-700 dark:text-gray-200'}`}>
                                            {bank}
                                        </span>
                                    </div>

                                    {recipient.bankName === bank && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-600 dark:text-emerald-400">
                                        <Check className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    )}
                                </li>
                                ))
                            ) : (
                                <li className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 italic">
                                    No banks found matching "{bankSearchTerm}"
                                </li>
                            )}
                        </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
              <div className="relative">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={recipient.accountNumber || ''}
                  onChange={(e) => setRecipient({ ...recipient, accountNumber: e.target.value })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter bank account number"
                />
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Recipient Phone (For Notification)</label>
              <div className="flex gap-2">
                 <div className="w-24 flex-shrink-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-300 font-medium">
                    {isSomToUga ? '🇺🇬 +256' : '🇸🇴 +252'}
                 </div>
                 <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={recipient.phone}
                      onChange={(e) => handlePhoneChange(e, false)}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-emerald-500 focus:border-emerald-500 transition-colors dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                        ${recipient.phone && !isRecipientPhoneValid(recipient.phone) ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-300 dark:border-gray-600'}
                      `}
                      placeholder={isSomToUga ? "77 123 4567" : "61 555 1234"}
                    />
                 </div>
              </div>
               {recipient.phone && !isRecipientPhoneValid(recipient.phone) && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 animate-pulse">
                  <AlertCircle size={12} />
                  {getPhoneValidationError(recipient.phone, !isSomToUga)}
                </p>
              )}
            </div>
          </>
        )}

      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-4 px-6 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`flex-1 py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transition-all
            ${isFormValid() 
                ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl' 
                : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'}`}
        >
          Review
        </button>
      </div>
    </form>
  );
};

export default RecipientStep;
