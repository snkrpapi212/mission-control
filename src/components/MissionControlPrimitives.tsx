import type { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from "react";
import { forwardRef } from "react";

// ============================================================================
// BADGE / CHIP
// ============================================================================

export interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ children, className = "", variant = "default" }: BadgeProps) {
  const variantClasses = {
    default: "bg-[var(--mc-chip-bg)] text-[var(--mc-chip-text)] border-[var(--mc-line)]",
    primary: "bg-[var(--mc-amber-soft)] text-[var(--mc-amber)] border-[var(--mc-amber)]",
    secondary: "bg-[var(--mc-panel-soft)] text-[var(--mc-text-soft)] border-[var(--mc-line)]",
    success: "bg-[var(--mc-green-soft)] text-[var(--mc-green)] border-[var(--mc-green)]",
    warning: "bg-[var(--mc-amber-soft)] text-[var(--mc-amber)] border-[var(--mc-amber)]",
    danger: "bg-[var(--mc-red-soft)] text-[var(--mc-red)] border-[var(--mc-red)]",
    outline: "bg-transparent text-[var(--mc-text-soft)] border-[var(--mc-line-strong)]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--r-pill)] border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] transition-colors ${variantClasses[variant]} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

// Chip is an alias for Badge (kept for backward compatibility)
export function Chip({ children, className = "", variant = "default" }: BadgeProps) {
  return <Badge className={className} variant={variant}>{children}</Badge>;
}

// ============================================================================
// CARD
// ============================================================================

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "flat" | "interactive";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ children, className = "", variant = "default", padding = "md", ...props }, ref) {
    const variantClasses = {
      default: "bg-[var(--mc-card)] border-[var(--mc-line)] shadow-[var(--sh-card)]",
      elevated: "bg-[var(--mc-card)] border-[var(--mc-line)] shadow-[var(--sh-card-hover)]",
      flat: "bg-[var(--mc-panel)] border-[var(--mc-line)] shadow-none",
      interactive: "bg-[var(--mc-card)] border-[var(--mc-line)] shadow-[var(--sh-card)] hover:shadow-[var(--sh-card-hover)] hover:border-[var(--mc-line-strong)] cursor-pointer transition-all duration-150",
    };

    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={`rounded-[var(--r-card)] border ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// ============================================================================
// BUTTON
// ============================================================================

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { children, className = "", variant = "primary", size = "md", isLoading, disabled, ...props },
    ref
  ) {
    const variantClasses = {
      primary: "bg-[var(--mc-text)] text-[var(--mc-bg)] border-transparent hover:bg-[var(--mc-text-muted)]",
      secondary: "bg-[var(--mc-card)] text-[var(--mc-text)] border-[var(--mc-line)] hover:bg-[var(--mc-panel-soft)] hover:border-[var(--mc-line-strong)]",
      ghost: "bg-transparent text-[var(--mc-text)] border-transparent hover:bg-[var(--mc-panel-soft)]",
      danger: "bg-[var(--mc-red)] text-white border-transparent hover:bg-[var(--mc-red-soft)] hover:text-[var(--mc-red)]",
    };

    const sizeClasses = {
      sm: "h-8 px-3 text-[11px]",
      md: "h-9 px-4 text-[13px]",
      lg: "h-11 px-6 text-[14px]",
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-[var(--r-tile)] border font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mc-green)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

// ============================================================================
// ICON BUTTON
// ============================================================================

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { children, className = "", variant = "secondary", size = "md", ...props },
    ref
  ) {
    const variantClasses = {
      primary: "bg-[var(--mc-text)] text-[var(--mc-bg)] border-transparent hover:bg-[var(--mc-text-muted)]",
      secondary: "bg-[var(--mc-card)] text-[var(--mc-text)] border-[var(--mc-line)] hover:bg-[var(--mc-panel-soft)] hover:border-[var(--mc-line-strong)]",
      ghost: "bg-transparent text-[var(--mc-text)] border-transparent hover:bg-[var(--mc-panel-soft)]",
    };

    const sizeClasses = {
      sm: "h-8 w-8 text-[14px]",
      md: "h-9 w-9 text-[16px]",
      lg: "h-11 w-11 text-[18px]",
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-[var(--r-tile)] border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mc-green)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// ============================================================================
// INPUT
// ============================================================================

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`h-9 w-full rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] transition-all duration-150 focus:border-[var(--mc-green)] focus:outline-none focus:ring-1 focus:ring-[var(--mc-green)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
        {...props}
      />
    );
  }
);

// ============================================================================
// PANEL HEADER
// ============================================================================

export interface PanelHeaderProps {
  dotClass?: string;
  title: string;
  count?: number;
  className?: string;
  actions?: ReactNode;
}

export function PanelHeader({
  dotClass,
  title,
  count,
  className = "",
  actions,
}: PanelHeaderProps) {
  return (
    <div className={`flex h-[var(--h-section)] items-center justify-between border-b border-[var(--mc-line)] px-4 ${className}`.trim()}>
      <h2 className="text-[22px] font-semibold uppercase tracking-[0.12em] text-[var(--mc-text)]">
        <span className={`mr-2 text-[var(--mc-green)] ${dotClass ?? ""}`}>•</span>
        {title}
      </h2>
      <div className="flex items-center gap-2">
        {typeof count === "number" ? <Badge>{count}</Badge> : null}
        {actions}
      </div>
    </div>
  );
}

// ============================================================================
// TEXT AREA
// ============================================================================

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ className = "", resize = "vertical", ...props }, ref) {
    const resizeClasses = {
      none: "resize-none",
      both: "resize",
      horizontal: "resize-x",
      vertical: "resize-y",
    };

    return (
      <textarea
        ref={ref}
        className={`w-full rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 py-2 text-[13px] text-[var(--mc-text)] placeholder:text-[var(--mc-text-soft)] transition-all duration-150 focus:border-[var(--mc-green)] focus:outline-none focus:ring-1 focus:ring-[var(--mc-green)] disabled:opacity-50 disabled:cursor-not-allowed ${resizeClasses[resize]} ${className}`.trim()}
        {...props}
      />
    );
  }
);

// ============================================================================
// SELECT
// ============================================================================

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  className?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className = "", children, ...props }, ref) {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={`h-9 w-full appearance-none rounded-[var(--r-tile)] border border-[var(--mc-line)] bg-[var(--mc-card)] px-3 pr-8 text-[13px] text-[var(--mc-text)] transition-all duration-150 focus:border-[var(--mc-green)] focus:outline-none focus:ring-1 focus:ring-[var(--mc-green)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`.trim()}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--mc-text-soft)]">
          ▼
        </span>
      </div>
    );
  }
);

// ============================================================================
// SKELETON
// ============================================================================

export interface SkeletonProps {
  className?: string;
  variant?: "text" | "rect" | "circle";
}

export function Skeleton({ className = "", variant = "rect" }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 rounded",
    rect: "rounded-[var(--r-tile)]",
    circle: "rounded-full aspect-square",
  };

  return (
    <div
      className={`animate-pulse bg-[var(--mc-line)] ${variantClasses[variant]} ${className}`.trim()}
    />
  );
}

// ============================================================================
// DIVIDER
// ============================================================================

export interface DividerProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export function Divider({ className = "", orientation = "horizontal" }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div className={`w-px self-stretch bg-[var(--mc-line)] ${className}`.trim()} />
    );
  }

  return <div className={`h-px w-full bg-[var(--mc-line)] ${className}`.trim()} />;
}
