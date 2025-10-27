'use client';

import { useState, useRef, useEffect, memo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  quality?: number;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  lazy?: boolean;
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fill = false,
  sizes,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  quality = 75,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc = '/images/placeholder.svg',
  lazy = true,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Carregar 50px antes de entrar na viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [lazy, priority, isInView]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Gerar blur placeholder simples se não fornecido
  const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  return (
    <div
      ref={imgRef}
      className={cn(
        'relative overflow-hidden',
        !isLoaded && 'animate-pulse bg-slate-200',
        className
      )}
      style={fill ? undefined : { width, height }}
    >
      {/* Placeholder enquanto não carrega */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
        >
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin" />
        </div>
      )}

      {/* Imagem principal */}
      {isInView && !hasError && (
        <Image
          src={src}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          sizes={sizes}
          priority={priority}
          quality={quality}
          loading={loading}
          placeholder={placeholder}
          blurDataURL={blurDataURL || defaultBlurDataURL}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          {...props}
        />
      )}

      {/* Imagem de fallback em caso de erro */}
      {hasError && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <Image
            src={fallbackSrc}
            alt="Imagem não encontrada"
            width={fill ? undefined : width || 100}
            height={fill ? undefined : height || 100}
            fill={fill}
            className="opacity-50"
          />
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;

// Hook para pré-carregar imagens
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const preloadImages = async (imagesToLoad: string[]) => {
    setLoading(true);
    
    const promises = imagesToLoad.map((url) => {
      return new Promise<string>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    });

    try {
      const loaded = await Promise.allSettled(promises);
      const successful = loaded
        .filter((result): result is PromiseFulfilledResult<string> => 
          result.status === 'fulfilled'
        )
        .map(result => result.value);
      
      setLoadedImages(prev => new Set([...prev, ...successful]));
    } catch (error) {
      console.error('Erro ao pré-carregar imagens:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    loadedImages,
    loading,
    preloadImages
  };
}

// Componente para avatar otimizado
export const OptimizedAvatar = memo(function OptimizedAvatar({
  src,
  alt,
  size = 40,
  className,
  fallbackInitials,
  ...props
}: {
  src?: string;
  alt: string;
  size?: number;
  className?: string;
  fallbackInitials?: string;
} & Omit<OptimizedImageProps, 'width' | 'height' | 'src' | 'alt'>) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-slate-200 text-slate-600 font-medium rounded-full',
          className
        )}
        style={{ width: size, height: size }}
      >
        {fallbackInitials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn('rounded-full', className)}
      onError={() => setHasError(true)}
      {...props}
    />
  );
});