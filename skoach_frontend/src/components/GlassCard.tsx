import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'low' | 'medium' | 'high';
}

const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = "", 
  intensity = 'medium' 
}) => {
  // 블러 및 배경 투명도 강도 설정
  const blurStyles = {
    low: "backdrop-blur-sm bg-white/20",
    medium: "backdrop-blur-md bg-white/30",
    high: "backdrop-blur-xl bg-white/40"
  };

  return (
    <div className={`${blurStyles[intensity]} border border-white/40 rounded-3xl shadow-xl transition-all duration-500 ${className}`}>
      {children}
    </div>
  );
};

export default GlassCard;