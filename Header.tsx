
import React from 'react';
import { Menu, MessageCircle, UserPlus, Wallet, Moon, Sun } from 'lucide-react';
import { View } from '../types';
import Logo from './Logo';

interface HeaderProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, isDarkMode, toggleTheme }) => {
  return (
    <nav className="bg-emerald-700 dark:bg-emerald-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => onNavigate('TRANSFER')}
          >
            <div className="bg-white dark:bg-gray-800 p-1 rounded-full shadow-md group-hover:scale-105 transition-transform duration-200">
              <Logo className="h-8 w-8" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-white">SomalUganda Remit</span>
            <span className="font-bold text-xl tracking-tight sm:hidden text-white">SU Remit</span>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-emerald-600 dark:hover:bg-emerald-800 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-emerald-100" />}
            </button>
            
            <button 
              onClick={() => onNavigate('TRANSFER')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'TRANSFER' ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-600 dark:hover:bg-emerald-800'
              }`}
            >
              Send Money
            </button>

            <button 
              onClick={() => onNavigate('WALLET')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'WALLET' ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-600 dark:hover:bg-emerald-800'
              }`}
            >
              <Wallet size={16} />
              <span className="hidden sm:inline">My Wallet</span>
            </button>
            
            <button 
              onClick={() => onNavigate('CHAT')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'CHAT' ? 'bg-emerald-800 shadow-inner' : 'hover:bg-emerald-600 dark:hover:bg-emerald-800'
              }`}
            >
              <MessageCircle size={16} />
              <span className="hidden sm:inline">Community</span>
            </button>
            
            <div className="hidden md:block">
               <button 
                 onClick={() => onNavigate('REGISTER')}
                 className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-sm border transition-colors ${
                    currentView === 'REGISTER' 
                    ? 'bg-emerald-900 border-emerald-500 text-white' 
                    : 'bg-emerald-800 border-emerald-600 text-emerald-100 hover:bg-emerald-600 dark:hover:bg-emerald-800'
                 }`}
               >
                 <UserPlus size={16} />
                 Register
               </button>
            </div>
          </div>

          <div className="md:hidden">
             <button 
                onClick={() => onNavigate(currentView === 'REGISTER' ? 'TRANSFER' : 'REGISTER')}
                className="p-2 rounded-md hover:bg-emerald-600 dark:hover:bg-emerald-800 focus:outline-none"
             >
                <Menu className="h-6 w-6" />
             </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
