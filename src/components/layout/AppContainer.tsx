import React from 'react';
import { cn } from '@/lib/utils';

interface AppContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Global App Container - Provides responsive layout wrapper for the entire application
 *
 * Features:
 * - Full responsive design (mobile-first)
 * - Proper width constraints across all breakpoints
 * - Overflow control to prevent horizontal scrolling
 * - Flex layout optimization for modern browsers
 * - Dark mode support
 */
export const AppContainer: React.FC<AppContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        // Base layout
        'w-full min-h-screen',

        // Width constraints - prevents overflow on any screen size
        'max-w-full',

        // Overflow control
        'overflow-x-hidden',

        // Responsive layout
        'relative',

        // Box model
        'box-border',

        // Background gradient with responsive support
        'bg-gradient-to-br from-slate-50 via-white to-slate-100',
        'dark:from-slate-950 dark:via-slate-900 dark:to-slate-800',

        // Additional responsive utilities
        'antialiased',

        className
      )}
      style={{
        // Force proper box-sizing
        boxSizing: 'border-box',
        // Ensure proper width calculation
        width: '100%',
        maxWidth: '100%',
        // Prevent flex issues
        display: 'block',
      }}
    >
      {/* Inner content wrapper with responsive padding */}
      <div
        className={cn(
          'w-full h-full min-h-screen',
          'max-w-full',
          'overflow-x-hidden',
          'relative',
          'box-border'
        )}
        style={{
          boxSizing: 'border-box',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {children}
      </div>
    </div>
  );
};