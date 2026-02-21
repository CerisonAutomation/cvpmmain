import React from 'react';

interface LogoProps {
  className?: string;
  subText?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  subText = 'PROPERTY MANAGEMENT', 
  size = 'md',
  onClick
}) => {
  const sizeClasses = {
    sm: { main: 'text-xl sm:text-2xl', sub: 'text-[6px] sm:text-[7px] mt-0.5' },
    md: { main: 'text-3xl sm:text-4xl', sub: 'text-[8px] sm:text-[9px] mt-1' },
    lg: { main: 'text-5xl sm:text-6xl', sub: 'text-[10px] sm:text-[11px] mt-2' }
  };

  const handleLogoClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div 
      onClick={handleLogoClick}
      className={`flex flex-col items-start cursor-pointer group transition-all duration-500 select-none ${className}`}
      role="button"
      aria-label="Christiano Vincenti Home"
    >
      <span
        className={`text-foreground leading-none group-hover:text-primary transition-colors duration-500 ${sizeClasses[size].main}`}
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          letterSpacing: '0.015em',
        }}
      >
        Christiano Vincenti
      </span>
      <span
        className={`text-primary/70 ${sizeClasses[size].sub}`}
        style={{
          fontFamily: "'Raleway', sans-serif",
          fontWeight: 200,
          letterSpacing: '0.45em',
          textTransform: 'uppercase',
        }}
      >
        {subText}
      </span>
    </div>
  );
};
