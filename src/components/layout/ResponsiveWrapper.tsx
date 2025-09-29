import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  fullHeight?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full'
};

/**
 * Responsive Wrapper - Provides responsive behavior for specific sections
 *
 * Used for wrapping sections that need specific responsive behavior
 * while maintaining proper width constraints
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
  fullHeight = false,
  maxWidth = 'full',
}) => {
  return (
    <div
      className={cn(
        // Base layout
        'w-full',
        maxWidthClasses[maxWidth],

        // Height control
        fullHeight && 'h-screen min-h-screen',

        // Responsive layout
        'mx-auto',

        // Overflow control
        'overflow-x-hidden',

        // Box model
        'box-border',

        // Responsive padding - none for full-width layouts like chat
        maxWidth !== 'full' && 'px-4 sm:px-6 lg:px-8',

        className
      )}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: maxWidth === 'full' ? '100%' : undefined,
      }}
    >
      {children}
    </div>
  );
};