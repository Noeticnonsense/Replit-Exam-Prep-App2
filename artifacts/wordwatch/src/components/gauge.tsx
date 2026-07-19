import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  label: string;
}

export function Gauge({ value, label }: GaugeProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  let color = "text-green-500 border-green-500/20 bg-green-500/10";
  let ringColor = "text-green-500";
  
  if (value > 70 || label.includes('ai')) {
    color = "text-red-500 border-red-500/20 bg-red-500/10";
    ringColor = "text-red-500";
  } else if (value > 30 || label === 'mixed') {
    color = "text-amber-500 border-amber-500/20 bg-amber-500/10";
    ringColor = "text-amber-500";
  }

  return (
    <div className="flex flex-col items-center animate-in zoom-in duration-700">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
          <circle
            className="text-muted stroke-current"
            strokeWidth="10"
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
          />
          <circle
            className={`${ringColor} stroke-current transition-all duration-[2000ms] ease-out drop-shadow-md`}
            strokeWidth="10"
            strokeLinecap="round"
            cx="70"
            cy="70"
            r={radius}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <span className="text-3xl font-serif font-bold text-foreground tracking-tight">
            {Math.round(value)}<span className="text-lg text-muted-foreground font-sans font-normal ml-0.5">%</span>
          </span>
        </div>
      </div>
      <span className={`mt-6 px-5 py-1.5 rounded-full text-sm font-serif font-medium border shadow-sm ${color} uppercase tracking-wider`}>
        {label.replace('-', ' ')}
      </span>
    </div>
  );
}
