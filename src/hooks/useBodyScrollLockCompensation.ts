import { useEffect, useRef } from 'react';

export const useBodyScrollLockCompensation = (elementRef: React.RefObject<HTMLElement>) => {
  const observer = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const targetElement = elementRef.current;
    if (!targetElement) return;

    const compensate = () => {
      const bodyPaddingRight = document.body.style.paddingRight;
      if (document.body.style.overflow === 'hidden' && bodyPaddingRight) {
        targetElement.style.paddingRight = bodyPaddingRight;
      } else {
        targetElement.style.paddingRight = '';
      }
    };

    observer.current = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'style') {
          compensate();
        }
      });
    });

    observer.current.observe(document.body, { attributes: true });
    
    compensate();

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
      if (targetElement) {
        targetElement.style.paddingRight = '';
      }
    };
  }, [elementRef]);
};