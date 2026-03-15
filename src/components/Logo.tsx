import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  className?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  useImage?: boolean;
}

const LOGO_URL = "https://primary.jwwb.nl/public/i/m/x/temp-jszjykaojetbmrgovpoe/image-high-82icb0.png?enable-io=true&width=350";

const sizeDimensions = {
  sm: { width: 100, height: 35 },
  md: { width: 150, height: 53 },
  lg: { width: 200, height: 71 }
};

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  subText = 'PROPERTY MANAGEMENT', 
  size = 'md',
  onClick,
  useImage = true
}) => {
  const dims = sizeDimensions[size];

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <motion.div
      onClick={handleLogoClick}
      className={`flex flex-col items-start cursor-pointer group ${className}`}
      role="button"
      aria-label="Christiano Vincenti Home"
      whileHover={{ opacity: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={LOGO_URL}
        alt="Christiano Property Management"
        width={dims.width}
        height={dims.height}
        className="object-contain brightness-[1.2] grayscale hover:grayscale-0 transition-all duration-700"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {subText && (
        <span
          className="text-primary/70 mt-1.5 micro-type"
          style={{
            fontSize: size === 'sm' ? '6px' : size === 'md' ? '8px' : '10px'
          }}
        >
          {subText}
        </span>
      )}
    </motion.div>
  );
};
