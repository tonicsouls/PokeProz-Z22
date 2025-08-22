import React, { useState, useEffect, useRef } from 'react';

interface HPBarProps {
  current: number;
  max: number;
}

export const HPBar: React.FC<HPBarProps> = ({ current, max }) => {
  const [displayValue, setDisplayValue] = useState(current);
  const percentage = max > 0 ? (current / max) * 100 : 0;
  
  let barColor = 'bg-green-500';
  if (percentage < 50) barColor = 'bg-yellow-500';
  if (percentage < 20) barColor = 'bg-red-600';

  const animationFrameRef = useRef<number | null>(null);
  const prevCurrentRef = useRef(current);

  useEffect(() => {
    const startValue = prevCurrentRef.current;
    const endValue = current;
    const duration = 500; // Corresponds to transition duration
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const newValue = Math.floor(startValue + (endValue - startValue) * progress);
      setDisplayValue(newValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        prevCurrentRef.current = current;
      }
    };

    if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
    };
  }, [current]);

  return (
    <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-900 my-1 relative">
      <div 
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${percentage}%` }}
      />
       <div className="absolute inset-0 flex items-center justify-end px-2 text-xs font-mono font-bold text-white" style={{textShadow: '1px 1px 2px black'}}>
        {displayValue} / {max}
      </div>
    </div>
  );
};