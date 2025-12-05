
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Activity, 
  DollarSign, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle,
  Lock,
  Plus,
  Save,
  Download,
  X,
  Smartphone,
  Globe,
  ArrowRight,
  Send,
  MessageCircle
} from 'lucide-react';
import { TransactionRecord, Currency } from '../types';

interface AdminDashboardProps {
  history: TransactionRecord[];
  onAddTransaction: (record: TransactionRecord) => void;
  onUpdateStatus: (id: string, status: TransactionRecord['status']) => void;
}

type SortField = 'timestamp' | 'amount' | 'fees';
type SortDirection = 'asc' | 'desc';

// Simple Reusable Chart Component
const SimpleChart = ({ 
    title, 
    data, 
    type, 
    colorClass, 
    prefix = '' 
}: { 
    title: string, 
    data: { label: string, value: number }[], 
    type: 'line' | 'bar', 
    colorClass: string,
    prefix?: string
}) => {
  const maxVal = Math.max(...data.map(d => d.value), 1) * 1.1; 

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-64">
       <div className="flex justify-between items-center mb-6">
           <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">{title}</h3>
           <div className="bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-xs text-gray-500 dark:text-gray-400 font-medium">
               Last 7 Days
           </div>
       </div>
       
       <div className="flex-grow relative flex items-end gap-2 sm:gap-4 px-2">
           {data.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                 <div className="relative w-full flex items-end justify-center h-[85%]">
                     <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-200">
                         {prefix}{d.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                     </div>
                     <div 
                       className={`w-full max-w-[24px] sm:max-w-[32px] rounded-t-md opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out ${colorClass}`}
                       style={{ height: `${(d.value / maxVal) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
                     ></div>
                 </div>
                 <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
              </div>
           ))}
       </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ history, onAddTransaction, onUpdateStatus }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);

  // Manual Transaction Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTxn, setNewTxn] = useState<{
      amount: string;
      senderName: string;
      currency: Currency;
  }>({ amount: '', senderName: '', currency: Currency.USD });

  // Processing state for approval buttons
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Filtering & Sorting State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter] = useState<'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'>('ALL');
  const [sortConfig] = useState<{ field: SortField; direction: SortDirection }>({ 
    field: 'timestamp', 
    direction: 'desc' 
  });

  // --- Real Analytics Calculations ---
  
  // 1. Generate Last 7 Days Labels
  const getLast7Days = () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push(d);
      }
      return days;
  };

  const last7Days = getLast7Days();

  // 2. Calculate Volume per Day
  const volumeData = last7Days.map(day => {
      const dateStr = day.toISOString().split('T')[0];
      const dayTotal = history
          .filter(t => t.timestamp.startsWith(dateStr) && t.status === 'SUCCESS')
          .reduce((acc, curr) => acc + (curr.currencySend === Currency.USD ? curr.amountSend : curr.amountSend / 3750), 0);
      
      return {
          label: day.toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayTotal
      };
  });

  // 3. Calculate Revenue (Fees) per Day
  const revenueData = last7Days.map(day => {
      const dateStr = day.toISOString().split('T')[0];
      const dayFees = history
          .filter(t => t.timestamp.startsWith(dateStr) && t.status === 'SUCCESS')
          .reduce((acc, curr) => acc + (curr.currencySend === Currency.USD ? curr.fees : curr.fees / 3750), 0);
      
      return {
          label: day.toLocaleDateString('en-US', { weekday: 'short' }),
          value: dayFees
      };
  });

  // 4. Totals
  const totalRevenue = history.reduce((acc, curr) => acc + (curr.currencySend === Currency.USD ? curr.fees : curr.fees / 3750), 0);
  const totalVolume = history.reduce((acc, curr) => acc + (curr.currencySend === Currency.USD ? curr.amountSend : curr.amountSend / 3750), 0);
  const activeUsers = new Set(history.map(h => h.senderPhone)).size + 120; // +120 existing base

  // Handlers
  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      // Simple hardcoded PIN - 1123
      if (pin === '1123') {
          setIsAuthenticated(true);
      } else {
          setLoginError(true);
          setPin('');
      }
  };

  const handleExport = () => {
      if (history.length === 0) {
          alert("No data to export");
          return;
      }

      // Convert history to CSV
      const headers = ["ID", "Date", "Direction", "Sender", "Recipient", "Amount Sent", "Currency", "Fee", "Status", "Ref"];
      const rows = history.map(txn => [
          txn.transactionId,
          new Date(txn.timestamp).toLocaleDateString(),
          txn.direction,
          `"${txn.senderName}"`, 
          `"${txn.recipient.fullName}"`,
          txn.amountSend,
          txn.currencySend,
          txn.fees.toFixed(2),
          txn.status,
          txn.senderTransactionRef || "N/A"
      ]);

      const csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ledger_backup_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const submitManualTransaction = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(newTxn.amount);
      if (!amount || !newTxn.senderName) return;

      const newRecord: TransactionRecord = {
          transactionId: 'MAN-' + Date.now().toString().slice(-6),
          status: 'SUCCESS', // Manual entries are usually completed
          message: 'Manually recorded by Admin',
          estimatedArrival: 'Instant',
          fees: amount * 0.015,
          timestamp: new Date().toISOString(),
          amountSend: amount,
          currencySend: newTxn.currency,
          amountReceive: newTxn.currency === Currency.USD ? amount * 3750 : amount / 3850,
          currencyReceive: newTxn.currency === Currency.USD ? Currency.UGX : Currency.USD,
          recipient: { fullName: 'Unknown (Manual)', phone: 'N/A', withdrawalMethod: 'MOBILE_MONEY' },
          senderName: newTxn.senderName,
          senderPhone: 'Manual Entry',
          notifyOnWhatsapp: false,
          direction: newTxn.currency === Currency.USD ? 'SOM_TO_UGA' : 'UGA_TO_SOM'
      };

      onAddTransaction(newRecord);
      setShowAddModal(false);
      setNewTxn({ amount: '', senderName: '', currency: Currency.USD });
  };

  const handleApproveClick = async (id: string) => {
      setProcessingId(id);
      // Simulate a small delay for UI feedback before calling the actual update
      await new Promise(resolve => setTimeout(resolve, 500));
      onUpdateStatus(id, 'SUCCESS');
      setProcessingId(null);
  };

  const filteredTransactions = useMemo(() => {
    let result = [...history];

    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        result = result.filter(txn => 
            txn.transactionId.toLowerCase().includes(lowerTerm) ||
            txn.senderName.toLowerCase().includes(lowerTerm) ||
            txn.recipient.fullName.toLowerCase().includes(lowerTerm)
        );
    }

    if (statusFilter !== 'ALL') {
        result = result.filter(txn => txn.status === statusFilter);
    }

    result.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [history, searchTerm, statusFilter, sortConfig]);


  // LOGIN SCREEN
  if (!isAuthenticated) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-sm text-center">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Access</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Enter PIN to access system dashboard</p>
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                          <input 
                            type="password" 
                            value={pin}
                            onChange={(e) => { setPin(e.target.value); setLoginError(false); }}
                            className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 dark:bg-gray-900 dark:text-white"
                            maxLength={4}
                            placeholder="••••"
                            autoFocus
                          />
                      </div>
                      {loginError && <p className="text-red-500 text-xs font-bold">Incorrect PIN. Try 1123.</p>}
                      <button 
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
                      >
                          Unlock Dashboard
                      </button>
                  </form>
              </div>
          </div>
      );
  }

  // DASHBOARD
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <LayoutDashboard className="text-emerald-600 dark:text-emerald-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400">System overview and manual entry ledger.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
             <button 
                onClick={handleExport}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
                title="Download Backup"
             >
                 <Download size={16} /> Backup Data
             </button>
             <button 
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-colors shadow-md"
             >
                 <Plus size={16} /> Record Order
             </button>
             <button 
                onClick={() => setIsAuthenticated(false)}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-bold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
             >
                 Lock
             </button>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">Record Transaction</h3>
                      <button onClick={() => setShowAddModal(false)}><X size={20} className="text-gray-400" /></button>
                  </div>
                  <form onSubmit={submitManualTransaction} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Sender Name</label>
                          <input 
                            type="text" 
                            required 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={newTxn.senderName}
                            onChange={e => setNewTxn({...newTxn, senderName: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Amount</label>
                            <input 
                                type="number" 
                                required 
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newTxn.amount}
                                onChange={e => setNewTxn({...newTxn, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Currency</label>
                            <select 
                                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                value={newTxn.currency}
                                onChange={e => setNewTxn({...newTxn, currency: e.target.value as Currency})}
                            >
                                <option value={Currency.USD}>USD</option>
                                <option value={Currency.UGX}>UGX</option>
                            </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 flex justify-center items-center gap-2">
                          <Save size={18} /> Save Record
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <DollarSign size={20} />
                  </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                  <TrendingUp size={12} /> {history.length > 0 ? '+100%' : '0%'} this week
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Volume</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">${totalVolume.toLocaleString()}</h3>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                      <Activity size={20} />
                  </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">{history.length} Transactions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Active Users</p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{activeUsers.toLocaleString()}</h3>
                  </div>
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                      <Users size={20} />
                  </div>
              </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-5 rounded-xl text-white shadow-md flex flex-col justify-between h-32 relative overflow-hidden">
              <div className="relative z-10">
                  <p className="text-xs font-bold text-emerald-100 uppercase tracking-wide">Profit Margin</p>
                  <h3 className="text-2xl font-bold mt-1">1.5% Fee</h3>
                  <p className="text-xs text-emerald-200 mt-1">Current Exchange Rate Spread: 100 UGX</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                  <DollarSign size={100} />
              </div>
          </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SimpleChart 
            title="Transaction Volume (USD)" 
            type="bar" 
            data={volumeData} 
            colorClass="bg-blue-500" 
            prefix="$"
          />
          <SimpleChart 
            title="Revenue from Fees (USD)" 
            type="bar" 
            data={revenueData} 
            colorClass="bg-emerald-500"
            prefix="$" 
          />
      </div>

      {/* Transaction Feed */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="font-bold text-gray-900 dark:text-white">Transaction Ledger</h2>
              <div className="flex items-center gap-2">
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ID, Sender..." 
                        className="pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                  </div>
              </div>
          </div>
          
          <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">
                      <tr>
                          <th className="p-4">Status</th>
                          <th className="p-4">Direction</th>
                          <th className="p-4">Sender</th>
                          <th className="p-4">Recipient</th>
                          <th className="p-4 text-right">Amount</th>
                          <th className="p-4 text-right">Fee</th>
                          <th className="p-4 text-center">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                      {filteredTransactions.length === 0 ? (
                          <tr>
                              <td colSpan={7} className="p-8 text-center text-gray-500 dark:text-gray-400">
                                  {searchTerm ? 'No transactions match.' : 'No transactions yet. Add one manually.'}
                              </td>
                          </tr>
                      ) : (
                        filteredTransactions.map((txn, idx) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                  <td className="p-4">
                                      <div className="flex flex-col gap-1">
                                          {txn.status === 'SUCCESS' ? (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 w-fit">
                                                  <CheckCircle size={12} /> Success
                                              </span>
                                          ) : txn.status === 'PENDING' || txn.status === 'WAITING_VERIFICATION' ? (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800 w-fit">
                                                  <Clock size={12} /> Pending
                                              </span>
                                          ) : (
                                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800 w-fit">
                                                  <XCircle size={12} /> Failed
                                              </span>
                                          )}
                                          
                                          {/* HINT FOR ADMIN */}
                                          <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                              {txn.direction === 'SOM_TO_UGA' ? (
                                                  <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-1 rounded">Check your Phone (Somalia)</span>
                                              ) : (
                                                  <span className="text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 px-1 rounded">Ask Wife (Uganda)</span>
                                              )}
                                          </div>
                                      </div>
                                  </td>
                                  <td className="p-4">
                                      <div className="flex items-center gap-2">
                                          {txn.direction === 'SOM_TO_UGA' ? (
                                              <>
                                                  <span className="text-xl">🇸🇴</span>
                                                  <ArrowRight size={12} className="text-gray-400" />
                                                  <span className="text-xl">🇺🇬</span>
                                              </>
                                          ) : (
                                              <>
                                                  <span className="text-xl">🇺🇬</span>
                                                  <ArrowRight size={12} className="text-gray-400" />
                                                  <span className="text-xl">🇸🇴</span>
                                              </>
                                          )}
                                      </div>
                                      <div className="text-[10px] text-gray-400 mt-1 font-mono">{txn.transactionId}</div>
                                  </td>
                                  <td className="p-4">
                                      <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                          {txn.senderName}
                                          {/* WhatsApp Indicator */}
                                          {txn.notifyOnWhatsapp && (
                                              <span title="User requested WhatsApp updates" className="text-[#25D366] animate-pulse cursor-help">
                                                  <MessageCircle size={14} fill="#25D366" className="text-white" />
                                              </span>
                                          )}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">{txn.senderPhone}</div>
                                  </td>
                                  <td className="p-4">
                                      <div className="font-bold text-gray-900 dark:text-white">{txn.recipient.fullName}</div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <div className="font-bold text-gray-900 dark:text-white">
                                          {txn.amountSend.toLocaleString()} {txn.currencySend}
                                      </div>
                                  </td>
                                  <td className="p-4 text-right">
                                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                                          +{txn.fees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                      </span>
                                  </td>
                                  <td className="p-4 text-center">
                                      {(txn.status === 'PENDING' || txn.status === 'WAITING_VERIFICATION') && (
                                          <button 
                                            onClick={() => handleApproveClick(txn.transactionId)}
                                            disabled={processingId === txn.transactionId}
                                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1 mx-auto"
                                            title="Approve & Notify via WhatsApp"
                                          >
                                              {processingId === txn.transactionId ? (
                                                  <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                  </svg>
                                              ) : (
                                                  <>
                                                    <CheckCircle size={14} />
                                                    Approve
                                                  </>
                                              )}
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
