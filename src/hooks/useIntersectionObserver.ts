import { useState, useEffect, useRef, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  triggerOnce?: boolean;
}

export const useIntersectionObserver = <T extends Element>(
  options: UseIntersectionObserverOptions = {}
): [RefObject<T>, boolean] => {
  const { 
    root = null, 
    rootMargin = '0px', 
    threshold = 0,
    triggerOnce = false
  } = options;
  
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const element = ref.current;
    
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementInView = entry.isIntersecting;
        
        // If triggerOnce is true, only update state if it's not already true
        if (!triggerOnce || (triggerOnce && !isInView)) {
          setIsInView(isElementInView);
        }
        
        // If triggerOnce is true and element is in view, disconnect the observer
        if (triggerOnce && isElementInView) {
          observer.disconnect();
        }
      },
      { root, rootMargin, threshold }
    );
    
    observer.observe(element);
    
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [root, rootMargin, threshold, triggerOnce]);
  
  return [ref, isInView];
};