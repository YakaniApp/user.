import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, CheckCircle, Shield, User, Mail, Calendar, AlertCircle } from 'lucide-react';
import { Notification } from '../types';

interface RegistrationProps {
    onNotify: (message: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void;
}

const Registration: React.FC<RegistrationProps> = ({ onNotify }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    dob: '',
    phone: '',
    nationality: 'Somalia',
    idType: 'National ID',
  });
  
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const idInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'id') setIdFile(file);
      else setSelfieFile(file);
    }
  };

  const removeFile = (type: 'id' | 'selfie') => {
    if (type === 'id') {
      setIdFile(null);
      if (idInputRef.current) idInputRef.current.value = '';
    } else {
      setSelfieFile(null);
      if (selfieInputRef.current) selfieInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API upload and verification
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      // Trigger the global notification
      onNotify('Documents Approved! Limit increased to $5,000.', 'SUCCESS');
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto text-center animate-fade-in my-8 border border-emerald-100 dark:border-emerald-900">
        <div className="flex justify-center mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-5 rounded-full">
            <CheckCircle className="w-20 h-20 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Documents Submitted!</h2>
        <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-md mx-auto">
          Your documents have been securely uploaded. Our team will verify your identity within 2-4 hours. You will receive an SMS confirmation on <span className="font-bold text-gray-900 dark:text-white">{formData.phone}</span> once approved.
        </p>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 mb-8 text-left border border-emerald-200 dark:border-emerald-800">
           <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400 mt-0.5" />
              <div>
                 <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">What happens next?</h4>
                 <ul className="text-sm text-emerald-700 dark:text-emerald-400 mt-1 space-y-1 list-disc list-inside">
                    <li>AI Verification checks for document validity.</li>
                    <li>Compliance team reviews your details.</li>
                    <li>Your limit will be increased to $5,000/day.</li>
                 </ul>
              </div>
           </div>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Your Account</h1>
        <p className="text-gray-500 dark:text-gray-400">Complete the KYC (Know Your Customer) process to start sending money securely.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Progress Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Bank-Grade Security</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 px-2 py-1 rounded border border-gray-200 dark:border-gray-600">
                Encrypted & Secure
            </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
            
            {/* Section 1: Personal Info */}
            <section className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Legal Name</label>
                        <input 
                            type="text" 
                            name="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="As shown on ID"
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input 
                                type="email" 
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                placeholder="name@example.com"
                            />
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <input 
                                type="date" 
                                name="dob"
                                required
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <input 
                            type="tel" 
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                            placeholder="+252 ... / +256 ..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
                        <select 
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="Somalia">Somalia 🇸🇴</option>
                            <option value="Uganda">Uganda 🇺🇬</option>
                            <option value="Kenya">Kenya 🇰🇪</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Section 2: Documents */}
            <section className="space-y-4">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Document Upload
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* ID Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type of ID</label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {['National ID', 'Passport', "Driver's License"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, idType: type }))}
                                    className={`
                                        py-2 px-1 text-xs rounded-lg border transition-all font-medium
                                        ${formData.idType === type 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500' 
                                            : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}
                                    `}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div 
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-48
                                ${idFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-750'}
                            `}
                            onClick={() => !idFile && idInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                hidden 
                                ref={idInputRef} 
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileChange(e, 'id')}
                            />
                            
                            {idFile ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <FileText className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2" />
                                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate max-w-[200px]">{idFile.name}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{(idFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile('id'); }}
                                        className="mt-3 text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full mb-3">
                                        <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload {formData.idType}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or PDF</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Selfie Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Selfie Verification</label>
                        <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs px-3 py-2 rounded-lg mb-2 flex items-start gap-2">
                            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                            Take a photo holding your ID next to your face.
                        </div>

                        <div 
                            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all h-48
                                ${selfieFile ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-750'}
                            `}
                            onClick={() => !selfieFile && selfieInputRef.current?.click()}
                        >
                            <input 
                                type="file" 
                                hidden 
                                ref={selfieInputRef} 
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, 'selfie')}
                            />
                             {selfieFile ? (
                                <div className="relative w-full h-full flex flex-col items-center justify-center">
                                    <Camera className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mb-2" />
                                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate max-w-[200px]">{selfieFile.name}</p>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400">{(selfieFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeFile('selfie'); }}
                                        className="mt-3 text-xs bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 px-3 py-1 rounded-full hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full mb-3">
                                        <Camera className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Selfie</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Clear photo of face + ID</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button 
                    type="submit"
                    disabled={isSubmitting || !idFile || !selfieFile}
                    className="w-full bg-emerald-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-800 disabled:bg-gray-300 disabled:dark:bg-gray-600 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-xl"
                >
                    {isSubmitting ? (
                        <>
                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                           </svg>
                           Verifying Documents...
                        </>
                    ) : (
                        'Submit for Verification'
                    )}
                </button>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                    By clicking submit, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>

        </form>
      </div>
    </div>
  );
};

export default Registration;