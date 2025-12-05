
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => {
  return (
    <svg 
      viewBox="0 0 200 200" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SomalUganda Remit Logo"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Shield Background */}
      <path d="M100 190C100 190 180 150 180 50H20L20 50C20 150 100 190 100 190Z" fill="#10B981" />
      
      {/* Shield Shading (Right side darker for 3D effect) */}
      <path d="M100 190C100 190 20 150 20 50H100V190Z" fill="#047857" fillOpacity="0.4" />

      {/* Gold Border / Protection */}
      <path d="M100 185C100 185 175 145 175 55H25L25 55C25 145 100 185 100 185Z" stroke="#F59E0B" strokeWidth="6" fill="none" />
      
      {/* "Hands" Protecting (Stylized golden curve) */}
      <path d="M45 135Q100 175 155 135" stroke="#FCD34D" strokeWidth="12" strokeLinecap="round" />

      {/* Dollar Sign */}
      <text x="100" y="125" fontSize="90" fontWeight="900" textAnchor="middle" fill="white" style={{ fontFamily: 'Arial, sans-serif' }}>$</text>
      
      {/* Top Sparkle/Shine */}
      <path d="M100 15L106 30L120 35L106 40L100 55L94 40L80 35L94 30L100 15Z" fill="#FCD34D" filter="url(#glow)" />
    </svg>
  );
};

export default Logo;
