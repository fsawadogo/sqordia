import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterProps {
  end: number;
  start?: number;
  duration?: number;
  delay?: number;
  formatter?: (value: number) => string;
}

export const useAnimatedCounter = ({
  end, 
  start = 0, 
  duration = 1000,
  delay = 0,
  formatter = (value: number) => Math.round(value).toString()
}: UseAnimatedCounterProps) => {
  const [count, setCount] = useState(start);
  const countRef = useRef(start);
  const startTimeRef = useRef<number | null>(null);
  const requestRef = useRef<number>();
  
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (delay > 0) {
      timeoutId = setTimeout(() => startAnimation(), delay);
    } else {
      startAnimation();
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
    
    function startAnimation() {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easeOutQuad for smoother ending
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      
      const currentCount = start + (end - start) * easeProgress;
      countRef.current = currentCount;
      setCount(currentCount);
      
      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    }
  }, [start, end, duration, delay]);
  
  return formatter(count);
};