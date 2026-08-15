import React from 'react';
import { getStressColor } from '../utils/colors';

interface Props {
  category: string;
  actionableInsight: string;
  tacticalIntent: string;
  stressScore: number;
}

const TacticalDirectiveCard: React.FC<Props> = ({ category, actionableInsight, tacticalIntent, stressScore }) => {
  const dynamicColor = getStressColor(stressScore);

  if (!actionableInsight) return null;

  return (
    <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 overflow-hidden backdrop-blur-xl flex-none">
      <div 
        className="absolute top-0 inset-x-0 h-[2px]" 
        style={{ backgroundImage: `linear-gradient(to right, transparent, ${dynamicColor}80, transparent)` }} 
      />
      
      <div className="flex flex-col gap-4">
        {/* category pill */}
        <div>
          <span 
            className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-widest font-mono rounded"
            style={{ backgroundColor: `${dynamicColor}20`, color: dynamicColor, border: `1px solid ${dynamicColor}40` }}
          >
            {category || 'GENERAL'}
          </span>
        </div>
        
        {/* main instruction text */}
        <h3 className="text-lg font-black text-white uppercase tracking-wide leading-snug">
          {actionableInsight}
        </h3>
        
        {/* additional context */}
        <div className="pt-3 border-t border-white/10">
          <p className="text-xs text-white/60 font-mono leading-relaxed">
            {tacticalIntent}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TacticalDirectiveCard;
