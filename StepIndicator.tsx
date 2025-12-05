import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
}

const steps = ['Amount', 'Recipient', 'Review', 'Receipt'];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 rounded-full"></div>
        <div 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-emerald-500 -z-10 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={step} className="flex flex-col items-center gap-2">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 border-2
                  ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                  ${isActive ? 'bg-white dark:bg-gray-900 border-emerald-500 text-emerald-500' : ''}
                  ${!isActive && !isCompleted ? 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500' : ''}
                `}
              >
                {isCompleted ? <Check size={16} /> : stepNum}
              </div>
              <span className={`text-xs font-medium ${isActive || isCompleted ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;