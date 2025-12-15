/**
 * Consolidated UI Components
 * All reusable UI components in one file for better maintainability
 */

import React, { forwardRef } from 'react';
import { cn } from '../lib/utils';

// ==================== BUTTON ====================
export const ModernButton = forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...props
}, ref) => {
    const variants = {
        primary: 'btn-primary',  // Use our CSS class from App.css
        outline: 'border-2 border-[rgb(155,255,0)] text-[rgb(155,255,0)] hover:bg-[rgba(155,255,0,0.1)]',
        ghost: 'text-[rgb(155,255,0)] hover:bg-[rgba(155,255,0,0.1)]',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            ref={ref}
            className={cn(
                'rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
});

ModernButton.displayName = 'ModernButton';

// ==================== BADGE ====================
export const Badge = forwardRef(({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
        default: 'bg-primary/20 text-primary border-primary/30',
        success: 'bg-success/20 text-success border-success/30',
        warning: 'bg-warning/20 text-warning border-warning/30',
        danger: 'bg-danger/20 text-danger border-danger/30',
        info: 'bg-info/20 text-info border-info/30',
    };

    return (
        <span
            ref={ref}
            className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
});

Badge.displayName = 'Badge';

// ==================== CARD ====================
export const Card = forwardRef(({ className, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn('card rounded-lg border border-white/10 bg-surface p-6', className)}
        {...props}
    >
        {children}
    </div>
));

Card.displayName = 'Card';

export const CardHeader = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('mb-4', className)} {...props}>
        {children}
    </div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef(({ className, children, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-xl font-bold text-text', className)} {...props}>
        {children}
    </h3>
));

CardTitle.displayName = 'CardTitle';

export const CardContent = forwardRef(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props}>
        {children}
    </div>
));

CardContent.displayName = 'CardContent';

// ==================== INPUT ====================
export const Input = forwardRef(({ className, type = 'text', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={cn(
            'w-full px-4 py-2 bg-surface border border-white/10 rounded-lg text-text',
            'placeholder-muted focus:outline-none focus:border-primary transition-colors',
            className
        )}
        {...props}
    />
));

Input.displayName = 'Input';

// ==================== PROGRESS ====================
export const Progress = forwardRef(({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
        <div
            ref={ref}
            className={cn('w-full h-2 bg-surface rounded-full overflow-hidden', className)}
            {...props}
        >
            <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
});

Progress.displayName = 'Progress';

// ==================== LOADING SKELETON ====================
export const LoadingSkeleton = ({ className, ...props }) => (
    <div
        className={cn('animate-pulse bg-white/10 rounded', className)}
        {...props}
    />
);

LoadingSkeleton.displayName = 'LoadingSkeleton';

// ==================== GLASS CARD ====================
export const GlassCard = forwardRef(({ className, children, hoverable = false, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'glass-effect rounded-xl p-6 border border-white/10',
            hoverable && 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300',
            className
        )}
        {...props}
    >
        {children}
    </div>
));

GlassCard.displayName = 'GlassCard';

// ==================== PROGRESS RING ====================
export const ProgressRing = ({ progress = 0, size = 120, strokeWidth = 8, color = 'primary' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    const colors = {
        primary: 'stroke-primary',
        success: 'stroke-success',
        warning: 'stroke-warning',
        danger: 'stroke-danger',
    };

    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                className="text-surface"
            />
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="currentColor"
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className={cn('transition-all duration-500', colors[color])}
            />
        </svg>
    );
};

ProgressRing.displayName = 'ProgressRing';

// ==================== DIFFICULTY BADGE ====================
export const DifficultyBadge = ({ difficulty }) => {
    const getDifficultyColor = () => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-gradient-to-r from-success/20 to-success/10 text-success border-success/30';
            case 'medium':
                return 'bg-gradient-to-r from-warning/20 to-warning/10 text-warning border-warning/30';
            case 'hard':
                return 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border-orange-500/30';
            case 'insane':
                return 'bg-gradient-to-r from-danger/20 to-danger/10 text-danger border-danger/30';
            default:
                return 'bg-gradient-to-r from-gray-500/20 to-gray-600/10 text-gray-400 border-gray-500/30';
        }
    };

    return (
        <span className={cn('px-3 py-1 rounded-md text-xs font-semibold border', getDifficultyColor())}>
            {difficulty}
        </span>
    );
};

DifficultyBadge.displayName = 'DifficultyBadge';

// ==================== ANIMATED BACKGROUND ====================
export const AnimatedBackground = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
);

AnimatedBackground.displayName = 'AnimatedBackground';

// ==================== PREMIUM UPGRADE BANNER ====================
export const PremiumUpgradeBanner = ({ onUpgrade }) => (
    <div className="bg-gradient-to-r from-warning/20 to-primary/20 border border-warning/30 rounded-lg p-4 flex items-center justify-between">
        <div>
            <h3 className="font-bold text-text mb-1">Unlock Premium Features</h3>
            <p className="text-sm text-muted">Get unlimited access to all labs and rooms</p>
        </div>
        <ModernButton variant="primary" size="sm" onClick={onUpgrade}>
            Upgrade Now
        </ModernButton>
    </div>
);

PremiumUpgradeBanner.displayName = 'PremiumUpgradeBanner';
