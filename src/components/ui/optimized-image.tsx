import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fallback?: string;
  placeholder?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  width,
  height,
  sizes = '100vw',
  priority = false,
  fallback,
  placeholder
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer pour le lazy loading
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Générer les sources pour différents formats
  const generateSources = (imageSrc: string) => {
    const baseName = imageSrc.replace(/\.[^/.]+$/, '');
    const extension = imageSrc.split('.').pop();

    const sources = [];

    // AVIF (meilleure compression)
    if (extension !== 'avif') {
      sources.push({
        srcset: `${baseName}.avif`,
        type: 'image/avif'
      });
    }

    // WebP (bonne compatibilité)
    if (extension !== 'webp') {
      sources.push({
        srcset: `${baseName}.webp`,
        type: 'image/webp'
      });
    }

    // Format original comme fallback
    sources.push({
      srcset: imageSrc,
      type: `image/${extension}`
    });

    return sources;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    if (fallback) {
      setIsLoaded(true);
    }
  };

  const finalSrc = hasError && fallback ? fallback : src;
  const sources = generateSources(finalSrc);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && placeholder && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${placeholder})` }}
        />
      )}

      {/* Image optimisée */}
      {isInView && (
        <picture>
          {sources.slice(0, -1).map((source, index) => (
            <source
              key={index}
              srcSet={source.srcset}
              type={source.type}
            />
          ))}
          <img
            ref={imgRef}
            src={sources[sources.length - 1].srcset}
            alt={alt}
            width={width}
            height={height}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              width: width ? `${width}px` : 'auto',
              height: height ? `${height}px` : 'auto'
            }}
          />
        </picture>
      )}

      {/* Skeleton loader */}
      {!isLoaded && !placeholder && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* Erreur de chargement */}
      {hasError && !fallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <span className="text-sm">Erreur de chargement</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
