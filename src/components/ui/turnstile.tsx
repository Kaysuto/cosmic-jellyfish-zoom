import React from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, params: TurnstileOptions) => string | undefined;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  tabindex?: number;
  'response-field'?: boolean;
  'response-field-name'?: string;
  size?: 'normal' | 'compact' | 'invisible';
  retry?: 'auto' | 'never';
  'retry-interval'?: number;
  'refresh-expired'?: 'auto' | 'manual' | 'never';
}

interface TurnstileProps extends TurnstileOptions {
  onSuccess?: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
  onTimeout?: () => void;
}

export interface TurnstileRef {
  reset: () => void;
  getResponse: () => string;
}

const Turnstile = React.forwardRef<TurnstileRef, TurnstileProps>((
  { 
    sitekey, 
    onSuccess, 
    onError, 
    onExpire, 
    onTimeout, 
    ...rest 
  }, 
  ref
) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const widgetIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const renderTurnstile = () => {
      if (containerRef.current && window.turnstile) {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey,
          callback: onSuccess,
          'error-callback': onError,
          'expired-callback': onExpire,
          'timeout-callback': onTimeout,
          ...rest,
        });
        if (widgetId) {
          widgetIdRef.current = widgetId;
        }
      }
    };

    if (window.turnstile) {
      renderTurnstile();
    } else {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
      script.async = true;
      script.defer = true;
      (window as any).onloadTurnstileCallback = renderTurnstile;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        delete (window as any).onloadTurnstileCallback;
      };
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
    };
  }, [sitekey, onSuccess, onError, onExpire, onTimeout, rest]);

  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const getResponse = (): string => {
    if (widgetIdRef.current && window.turnstile) {
      return window.turnstile.getResponse(widgetIdRef.current) || '';
    }
    return '';
  };

  // Exposer les méthodes via ref si nécessaire
  React.useImperativeHandle(ref, () => ({
    reset,
    getResponse,
  }));

  return <div ref={containerRef} />;
});

Turnstile.displayName = 'Turnstile';

export default Turnstile;